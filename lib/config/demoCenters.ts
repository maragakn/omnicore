/**
 * Numeric AMS center IDs used to filter the service-request report.
 *
 * Set DEMO_CENTER_IDS in .env as a comma-separated list of the numeric
 * `externalcenterid` values from the AMS `centers` table.
 *
 * Example: DEMO_CENTER_IDS=10045,10087,10123
 *
 * Leave blank (or omit) to fetch requests across all centers.
 */

export function getDemoCenterIds(): number[] {
  const raw = process.env.DEMO_CENTER_IDS ?? ""
  if (!raw.trim()) return []
  return raw
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n) && n > 0)
}
