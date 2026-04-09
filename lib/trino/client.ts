/**
 * Trino HTTP client — implements the standard Trino challenge-response auth flow.
 *
 * Protocol:
 *   1. POST /v1/statement  (no auth) → Trino returns 401 + WWW-Authenticate
 *   2. Retry POST /v1/statement  (with Basic auth) → 200 + {id, nextUri, ...}
 *   3. GET nextUri  (with auth on every poll) until nextUri is absent
 *
 * Refs: https://trino.io/docs/current/develop/client-protocol.html
 */

type TrinoColumn = { name: string }

type TrinoResponse = {
  id?: string
  nextUri?: string
  columns?: TrinoColumn[]
  data?: Array<Array<string | number | boolean | null>>
  error?: { message?: string; errorCode?: number; errorType?: string }
}

// ─── Config ────────────────────────────────────────────────────────────────────

function hasTrinoConfig() {
  return Boolean(process.env.TRINO_HOST && process.env.TRINO_USER && process.env.TRINO_PASSWORD)
}

function getBaseUrl(): string {
  const host = process.env.TRINO_HOST!
  if (host.startsWith("http://") || host.startsWith("https://")) return host
  return `https://${host}`
}

function buildAuthHeader(): string {
  const user = process.env.TRINO_USER!
  const password = process.env.TRINO_PASSWORD!
  // If the password looks like a JWT/Bearer token use Bearer, otherwise Basic.
  if (password.startsWith("eyJ")) return `Bearer ${password}`
  return `Basic ${Buffer.from(`${user}:${password}`).toString("base64")}`
}

function baseHeaders(): Record<string, string> {
  const catalog = process.env.TRINO_CATALOG ?? "delta"
  const schema  = process.env.TRINO_SCHEMA  ?? "pk_prod_cultsport_asset_management_service"
  return {
    "Content-Type": "text/plain; charset=utf-8",
    Accept:           "application/json",
    "X-Trino-User":    process.env.TRINO_USER!,
    "X-Trino-Catalog": catalog,
    "X-Trino-Schema":  schema,
    "X-Trino-Source":  "omnicore-cf-admin",
  }
}

// ─── Public API ────────────────────────────────────────────────────────────────

export function isTrinoEnabled(): boolean {
  return hasTrinoConfig()
}

/**
 * Execute a Trino SQL query and collect all result rows.
 *
 * Uses Trino's challenge-response auth:
 *   • First POST is sent without Authorization so Trino can issue its
 *     WWW-Authenticate challenge (some versions skip the challenge if
 *     credentials are pre-sent, but others reject the pre-emptive header).
 *   • On 401 we immediately retry with the Authorization header.
 *   • Every subsequent nextUri poll carries the Authorization header.
 */
export async function runTrinoQuery<T = Record<string, string | number | boolean | null>>(
  sql: string,
): Promise<T[]> {
  if (!hasTrinoConfig()) return []

  const baseUrl = getBaseUrl()
  const auth    = buildAuthHeader()
  const base    = baseHeaders()
  const authed  = { ...base, Authorization: auth }

  // ── Step 1: initial POST without auth (Trino challenge-response) ────────────
  let response = await fetch(`${baseUrl}/v1/statement`, {
    method: "POST",
    headers: base,
    body: sql,
    cache: "no-store",
  })

  // ── Step 2: if 401, retry immediately with credentials ──────────────────────
  if (response.status === 401) {
    response = await fetch(`${baseUrl}/v1/statement`, {
      method: "POST",
      headers: authed,
      body: sql,
      cache: "no-store",
    })
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "")
    throw new Error(
      `Trino ${response.status}: ${body.slice(0, 300) || "check credentials and connectivity"}`,
    )
  }

  // ── Step 3: collect all pages via nextUri ───────────────────────────────────
  let payload = (await response.json()) as TrinoResponse

  // columns are set on the first page that has data
  let columns: string[] = []
  const rows: T[] = []

  while (true) {
    if (payload.error?.message) {
      throw new Error(`Trino query error: ${payload.error.message}`)
    }

    // columns may arrive before data
    if (payload.columns && payload.columns.length > 0 && columns.length === 0) {
      columns = payload.columns.map((c) => c.name)
    }

    if (payload.data && payload.data.length > 0 && columns.length > 0) {
      for (const row of payload.data) {
        const mapped: Record<string, string | number | boolean | null> = {}
        for (let i = 0; i < columns.length; i++) {
          mapped[columns[i]] = row[i] ?? null
        }
        rows.push(mapped as T)
      }
    }

    if (!payload.nextUri) break

    // Poll next page — always with auth
    const next = await fetch(payload.nextUri, {
      headers: authed,
      cache: "no-store",
    })

    if (!next.ok) {
      throw new Error(`Trino poll failed: ${next.status}`)
    }

    payload = (await next.json()) as TrinoResponse
  }

  return rows
}
