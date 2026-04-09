import { runTrinoQuery, isTrinoEnabled } from "@/lib/trino/client"
import type { ServiceRequestReportRow } from "@/lib/reports/serviceRequests"

/**
 * Maps AMS service_request.state (MongoDB enum) → OmniCore ServiceRequest.status
 * Verified AMS states: RAISED | ASSIGNED | IN_PROGRESS | RESOLVED | CLOSED | CANCELLED
 */
function mapAmsState(state: string | null): string {
  switch ((state ?? "").toUpperCase()) {
    case "RAISED":
      return "OPEN"
    case "ASSIGNED":
      return "ASSIGNED"
    case "IN_PROGRESS":
    case "INPROGRESS":
      return "IN_PROGRESS"
    case "RESOLVED":
    case "CLOSED":
    case "COMPLETED":
      return "RESOLVED"
    default:
      return "OPEN"
  }
}

/**
 * Maps AMS priority to OmniCore priority.
 * AMS typically uses P1/P2/P3/P4 or HIGH/MEDIUM/LOW.
 */
function mapAmsPriority(priority: string | null): string {
  const p = (priority ?? "").toUpperCase()
  if (p === "P1" || p === "CRITICAL" || p === "URGENT") return "CRITICAL"
  if (p === "P2" || p === "HIGH") return "HIGH"
  if (p === "P3" || p === "MEDIUM" || p === "NORMAL") return "MEDIUM"
  if (p === "P4" || p === "LOW") return "LOW"
  return "MEDIUM"
}

/**
 * Maps AMS service_request.source to an OmniCore role.
 * AMS source values: TRAINER | APP | OPS | ADMIN | SELF | VENDOR
 */
function mapAmsSource(source: string | null): ServiceRequestReportRow["raisedByRole"] {
  const s = (source ?? "").toUpperCase()
  if (s === "TRAINER" || s === "FLOOR_TRAINER") return "TRAINER"
  if (s === "APP" || s === "RESIDENT" || s === "MEMBER") return "RWA_ADMIN"
  return "OPS"
}

function sourceLabel(source: string | null, issueType: string | null): string {
  const s = (source ?? "").toUpperCase()
  if (s === "TRAINER" || s === "FLOOR_TRAINER") return `Trainer (${issueType ?? source ?? "floor report"})`
  if (s === "APP" || s === "MEMBER") return `Resident via App`
  if (s === "OPS" || s === "ADMIN") return `Ops Desk`
  return source ?? "System"
}

/**
 * Pulls real service requests from AMS via Trino for the given numeric center IDs.
 *
 * Joins:
 *   service_requests → assets (equipment detail)
 *                    → products (equipment name / SKU)
 *                    → brands   (brand name)
 *                    → product_categories (category name)
 *                    → centers  (center name)
 *
 * Column reference (PLAN.md verified 2026-04-09):
 *   service_requests: _id, asset_id, assetownerid, state, priority,
 *                     issuetype, servicetype, title, description, source, created, updated
 *   assets:           _id, serialnumber, status, assetownership, product_id, qrcode
 *   products:         _id, sku, name, brand_id, productcategory_id
 *   brands:           _id, name
 *   product_categories: _id, name
 *   centers:          _id, externalcenterid, name
 */
export async function queryServiceRequestsReportFromTrino(
  centerIds: number[],
): Promise<ServiceRequestReportRow[]> {
  if (!isTrinoEnabled()) return []

  const sql = `
    WITH sr_dedup AS (
      SELECT *,
        ROW_NUMBER() OVER (PARTITION BY _id ORDER BY updated DESC) AS rn
      FROM service_requests
      WHERE state NOT IN ('CANCELLED')
    ),
    a_dedup AS (
      SELECT *,
        ROW_NUMBER() OVER (PARTITION BY _id ORDER BY updated DESC) AS rn
      FROM assets
    ),
    p_dedup AS (
      SELECT *,
        ROW_NUMBER() OVER (PARTITION BY _id ORDER BY updated DESC) AS rn
      FROM products
    ),
    b_dedup AS (
      SELECT *,
        ROW_NUMBER() OVER (PARTITION BY _id ORDER BY updated DESC) AS rn
      FROM brands
    ),
    pcat_dedup AS (
      SELECT *,
        ROW_NUMBER() OVER (PARTITION BY _id ORDER BY updated DESC) AS rn
      FROM product_categories
    ),
    c_dedup AS (
      SELECT *,
        ROW_NUMBER() OVER (PARTITION BY _id ORDER BY updated DESC) AS rn
      FROM PK_PROD_CULTSPORT_ASSET_MANAGEMENT_SERVICE.centers
    )
    SELECT
      CAST(sr._id              AS VARCHAR)  AS request_id,
      CAST(sr.assetownerid     AS VARCHAR)  AS center_id,
      CAST(c.name              AS VARCHAR)  AS center_name,
      CAST(sr.title            AS VARCHAR)  AS title,
      CAST(sr.description      AS VARCHAR)  AS description,
      CAST(sr.state            AS VARCHAR)  AS state,
      CAST(sr.priority         AS VARCHAR)  AS priority,
      CAST(sr.issuetype        AS VARCHAR)  AS issue_type,
      CAST(sr.servicetype      AS VARCHAR)  AS service_type,
      CAST(sr.source           AS VARCHAR)  AS source,
      CAST(a._id               AS VARCHAR)  AS asset_id,
      CAST(a.serialnumber      AS VARCHAR)  AS serial_number,
      CAST(a.status            AS VARCHAR)  AS asset_status,
      CAST(a.qrcode            AS VARCHAR)  AS asset_qr_code,
      CAST(p.name              AS VARCHAR)  AS product_name,
      CAST(p.sku               AS VARCHAR)  AS product_sku,
      CAST(b.name              AS VARCHAR)  AS brand_name,
      CAST(pcat.name           AS VARCHAR)  AS category_name,
      CAST(sr.created          AS VARCHAR)  AS created_at,
      CAST(sr.updated          AS VARCHAR)  AS updated_at
    FROM sr_dedup sr
    LEFT JOIN a_dedup    a    ON CAST(sr.asset_id          AS VARCHAR) = CAST(a._id     AS VARCHAR) AND a.rn    = 1
    LEFT JOIN p_dedup    p    ON CAST(a.product_id         AS VARCHAR) = CAST(p._id     AS VARCHAR) AND p.rn    = 1
    LEFT JOIN b_dedup    b    ON CAST(p.brand_id           AS VARCHAR) = CAST(b._id     AS VARCHAR) AND b.rn    = 1
    LEFT JOIN pcat_dedup pcat ON CAST(p.productcategory_id AS VARCHAR) = CAST(pcat._id  AS VARCHAR) AND pcat.rn = 1
    LEFT JOIN c_dedup    c    ON CAST(sr.assetownerid AS VARCHAR) = CAST(c._id AS VARCHAR) AND c.rn = 1
    JOIN dwh_fitness_mart.center_dim cdm ON CAST(cdm.center_service_id AS VARCHAR) = c.externalcenterid
    WHERE sr.rn = 1
    ORDER BY sr.created DESC
    LIMIT 25
  `

  type Raw = {
    request_id: string | null
    center_id: number | null
    center_name: string | null
    title: string | null
    description: string | null
    state: string | null
    priority: string | null
    issue_type: string | null
    service_type: string | null
    source: string | null
    asset_id: string | null
    serial_number: string | null
    asset_status: string | null
    asset_qr_code: string | null
    product_name: string | null
    product_sku: string | null
    brand_name: string | null
    category_name: string | null
    created_at: string | null
    updated_at: string | null
  }

  const rows = await runTrinoQuery<Raw>(sql)

  return rows
    .filter((r): r is typeof r & { request_id: string } => r.request_id != null)
    .map((r) => {
      const centerId = r.center_id ?? 0
      const requestId = r.request_id
      const serial = r.serial_number ?? r.asset_id ?? "UNMAPPED"
      const status = mapAmsState(r.state)

      const equipmentName =
        [r.brand_name, r.product_name].filter(Boolean).join(" ") || "Facility / Non-asset issue"
      const equipmentCategory = r.category_name ?? r.service_type ?? "GENERAL"

      // Prefer the physical asset QR from AMS; fall back to generated SR reference
      const qrPayload =
        r.asset_qr_code ??
        `OMNICORE-SR|REQ:${requestId}|CENTER:${centerId}|EQ:${serial}|STATUS:${status}`

      return {
        requestId,
        centerId: String(centerId),
        centerName: r.center_name ?? `Center ${centerId}`,
        title: r.title ?? r.issue_type ?? "Untitled request",
        description: r.description ?? undefined,
        status,
        priority: mapAmsPriority(r.priority),
        raisedBy: sourceLabel(r.source, r.issue_type),
        raisedByRole: mapAmsSource(r.source),
        equipmentName,
        equipmentCategory,
        equipmentSerial: serial,
        qrPayload,
        createdAt: r.created_at ? new Date(r.created_at) : new Date(),
        updatedAt: r.updated_at ? new Date(r.updated_at) : new Date(),
      }
    })
}
