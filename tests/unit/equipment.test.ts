import { describe, it, expect } from "vitest"
import { deriveEquipmentCategory } from "@/lib/onboarding/equipment"

describe("deriveEquipmentCategory", () => {
  it("returns SMALL when both dimensions are below thresholds", () => {
    expect(deriveEquipmentCategory(500, 100)).toBe("SMALL")
  })

  it("returns SMALL at the exact lower boundary (999 sqft, 199 units)", () => {
    expect(deriveEquipmentCategory(999, 199)).toBe("SMALL")
  })

  it("returns MEDIUM when gymSqFt hits 1000", () => {
    expect(deriveEquipmentCategory(1000, 100)).toBe("MEDIUM")
  })

  it("returns MEDIUM when totalUnits hits 200 (even if sqft < 1000)", () => {
    expect(deriveEquipmentCategory(800, 200)).toBe("MEDIUM")
  })

  it("returns MEDIUM at the upper boundary (2500 sqft, 500 units)", () => {
    expect(deriveEquipmentCategory(2500, 500)).toBe("MEDIUM")
  })

  it("returns LARGE when gymSqFt exceeds 2500", () => {
    expect(deriveEquipmentCategory(2501, 100)).toBe("LARGE")
  })

  it("returns LARGE when totalUnits exceeds 500 (even if sqft is small)", () => {
    expect(deriveEquipmentCategory(500, 501)).toBe("LARGE")
  })

  it("returns LARGE when both dimensions are large", () => {
    expect(deriveEquipmentCategory(3000, 700)).toBe("LARGE")
  })
})
