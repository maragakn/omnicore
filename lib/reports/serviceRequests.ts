/**
 * Service Request report — live data from Trino AMS.
 *
 * Set DEMO_CENTER_IDS in .env to comma-separated numeric AMS externalcenterid
 * values to filter by specific centers. Leave blank for all centers.
 */

import { queryServiceRequestsReportFromTrino } from "@/lib/trino/queries/serviceRequests"
import { getDemoCenterIds } from "@/lib/config/demoCenters"
import { isTrinoEnabled } from "@/lib/trino/client"

export type ServiceRequestReportRow = {
  requestId: string
  centerId: string
  centerName: string
  title: string
  description?: string
  status: string
  priority: string
  raisedBy: string
  raisedByRole: "TRAINER" | "RWA_ADMIN" | "OPS"
  equipmentName: string
  equipmentCategory: string
  equipmentSerial: string
  qrPayload: string
  createdAt: Date
  updatedAt: Date
}

export type ServiceRequestReportMeta = {
  centerIds: number[]
  trinoEnabled: boolean
  rowCount: number
  error?: string
}

export async function getServiceRequestReportRows(): Promise<{
  rows: ServiceRequestReportRow[]
  meta: ServiceRequestReportMeta
}> {
  const centerIds = getDemoCenterIds()

  if (!isTrinoEnabled()) {
    return { rows: [], meta: { centerIds, trinoEnabled: false, rowCount: 0 } }
  }

  try {
    const rows = await queryServiceRequestsReportFromTrino(centerIds)
    return { rows, meta: { centerIds, trinoEnabled: true, rowCount: rows.length } }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      rows: [],
      meta: { centerIds, trinoEnabled: true, rowCount: 0, error: `Trino: ${message}` },
    }
  }
}
