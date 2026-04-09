import { describe, expect, it } from "vitest"
import { utilizationDateRanges } from "@/lib/amenity/utilization"

describe("utilizationDateRanges", () => {
  it("aligns MTD end with six-month window end (both run through today)", () => {
    const fixed = new Date(2026, 3, 9, 15, 30, 0) // Apr 9, 2026
    const { mtd, lastSixMonths } = utilizationDateRanges(fixed)
    expect(mtd.lt.getTime()).toBe(lastSixMonths.lt.getTime())
    expect(mtd.gte.getTime()).toBeGreaterThanOrEqual(lastSixMonths.gte.getTime())
  })
})
