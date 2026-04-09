import { describe, it, expect } from "vitest"
import { parseOptionalDateInput, toDateInputValue } from "@/lib/trainers/dateInput"

describe("dateInput helpers", () => {
  it("parses empty to null", () => {
    expect(parseOptionalDateInput("")).toBeNull()
    expect(parseOptionalDateInput(undefined)).toBeNull()
  })

  it("formats a calendar day for input type=date", () => {
    const s = toDateInputValue(new Date(2026, 5, 1))
    expect(s).toBe("2026-06-01")
    expect(parseOptionalDateInput(s)).not.toBeNull()
  })

  it("accepts ISO strings from serialized server props", () => {
    expect(toDateInputValue("2026-06-15T00:00:00.000Z")).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
