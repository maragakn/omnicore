/** Parse `<input type="date">` value or ISO string; empty → null */
export function parseOptionalDateInput(v: string | undefined | null): Date | null {
  if (v === undefined || v === null) return null
  const t = String(v).trim()
  if (t === "") return null
  const d = new Date(t)
  return Number.isNaN(d.getTime()) ? null : d
}

/** `yyyy-mm-dd` for date inputs (Date, ISO string from serialized props, or null) */
export function toDateInputValue(d: Date | string | null | undefined): string {
  if (d === undefined || d === null || d === "") return ""
  const x = typeof d === "string" ? new Date(d) : d
  const y = x.getFullYear()
  const m = String(x.getMonth() + 1).padStart(2, "0")
  const day = String(x.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}
