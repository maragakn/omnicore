/**
 * Copy text with Clipboard API when available, else fallback (older browsers / non-HTTPS).
 * Call from click handlers only (user gesture may be required).
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === "undefined") return false
  try {
    if (window.navigator?.clipboard?.writeText) {
      await window.navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* try fallback */
  }
  try {
    const ta = document.createElement("textarea")
    ta.value = text
    ta.setAttribute("readonly", "")
    ta.style.position = "fixed"
    ta.style.left = "-9999px"
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand("copy")
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}
