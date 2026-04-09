/** Store languages as JSON array string in DB; accept comma-separated or JSON in forms. */
export function normalizeLanguagesInput(input: string | undefined | null): string | null {
  const raw = input?.trim()
  if (!raw) return null
  try {
    if (raw.startsWith("[")) {
      const parsed = JSON.parse(raw) as unknown
      if (Array.isArray(parsed)) {
        const list = parsed.map((x) => String(x).trim()).filter(Boolean)
        return list.length ? JSON.stringify(list) : null
      }
    }
  } catch {
    // fall through to comma split
  }
  const list = raw.split(",").map((s) => s.trim()).filter(Boolean)
  return list.length ? JSON.stringify(list) : null
}

export function languagesToDisplay(languagesKnown: string | null | undefined): string {
  if (!languagesKnown?.trim()) return ""
  try {
    const parsed = JSON.parse(languagesKnown) as unknown
    if (Array.isArray(parsed)) return parsed.map(String).join(", ")
  } catch {
    // legacy plain text
  }
  return languagesKnown
}
