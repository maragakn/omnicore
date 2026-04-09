/** Demo/hackathon: opaque string encoded in the resident QR (not production MyGate). */
export const CHECKIN_PREFIX = "omnicore-checkin:"

export function formatCheckinPayload(bookingId: string): string {
  return `${CHECKIN_PREFIX}${bookingId}`
}

/** Accepts full payload, bare booking id (cuid), or pasted URL containing id= */
export function parseCheckinPayload(raw: string): string | null {
  const t = raw.trim()
  const fromPrefix = t.startsWith(CHECKIN_PREFIX) ? t.slice(CHECKIN_PREFIX.length).trim() : null
  if (fromPrefix && /^c[a-z0-9]{20,}$/i.test(fromPrefix)) {
    return fromPrefix
  }
  if (/^c[a-z0-9]{20,}$/i.test(t)) {
    return t
  }
  const idParam = t.match(/(?:[?&])id=([^&\s#]+)/)
  if (idParam?.[1] && /^c[a-z0-9]{20,}$/i.test(decodeURIComponent(idParam[1]))) {
    return decodeURIComponent(idParam[1])
  }
  return null
}
