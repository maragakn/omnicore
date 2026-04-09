/** Absolute URL for RWA to open the quote portal (requires NEXT_PUBLIC_BASE_URL when sharing outside the browser origin). */
export function getPublicRwaQuoteUrl(inviteToken: string): string {
  const base = (process.env.NEXT_PUBLIC_BASE_URL ?? "").trim().replace(/\/$/, "")
  const path = `/rwa/quote/${inviteToken}`
  return base ? `${base}${path}` : path
}
