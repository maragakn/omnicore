/**
 * Quick discovery: prints the top centers by SR count from Trino AMS.
 * Run once to pick your 3 demo center IDs, then set DEMO_CENTER_IDS in .env.
 *
 *   npx tsx scripts/discover-centers.ts
 */

import { runTrinoQuery } from "../lib/trino/client"

const sql = `
  SELECT
    TRY_CAST(sr.assetownerid AS INTEGER) AS center_id,
    CAST(c.name              AS VARCHAR) AS center_name,
    COUNT(sr._id)                        AS sr_count
  FROM service_requests sr
  LEFT JOIN centers c
    ON CAST(sr.assetownerid AS VARCHAR) = CAST(c.externalcenterid AS VARCHAR)
  WHERE sr.state NOT IN ('CANCELLED')
    AND sr.assetownerid IS NOT NULL
  GROUP BY sr.assetownerid, c.name
  ORDER BY sr_count DESC
  LIMIT 20
`

type Row = { center_id: number | null; center_name: string | null; sr_count: number | null }

async function main() {
  console.log("Querying Trino AMS — top 20 centers by service request count…\n")
  const rows = await runTrinoQuery<Row>(sql)

  if (rows.length === 0) {
    console.log("No results. Check Trino credentials.")
    return
  }

  console.log("Rank  Center ID   SR Count   Name")
  console.log("────  ─────────   ────────   ────")
  rows.forEach((r, i) => {
    const id    = String(r.center_id ?? "?").padEnd(10)
    const count = String(r.sr_count  ?? 0).padStart(8)
    const name  = r.center_name ?? "(no name)"
    console.log(`  ${String(i + 1).padStart(2)}  ${id}  ${count}   ${name}`)
  })

  const top3 = rows.slice(0, 3).map((r) => r.center_id).filter(Boolean).join(",")
  console.log(`\nSuggested DEMO_CENTER_IDS=${top3}`)
}

main().catch((e) => { console.error(e.message); process.exit(1) })
