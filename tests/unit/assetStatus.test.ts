import { describe, it, expect } from "vitest"
import { computeAssetStatus, AssetCondition } from "@/lib/constants/enums"

const daysFromNow = (n: number) => new Date(Date.now() + n * 24 * 60 * 60 * 1000)
const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000)

describe("computeAssetStatus", () => {
  it("returns GOOD when next service is more than 30 days away", () => {
    // Use 35+ to avoid millisecond boundary sensitivity at exactly 31 days
    expect(computeAssetStatus(daysFromNow(35))).toBe(AssetCondition.GOOD)
    expect(computeAssetStatus(daysFromNow(60))).toBe(AssetCondition.GOOD)
    expect(computeAssetStatus(daysFromNow(90))).toBe(AssetCondition.GOOD)
  })

  it("returns FAIR when next service is 7–30 days away", () => {
    expect(computeAssetStatus(daysFromNow(28))).toBe(AssetCondition.FAIR)
    expect(computeAssetStatus(daysFromNow(15))).toBe(AssetCondition.FAIR)
    expect(computeAssetStatus(daysFromNow(9))).toBe(AssetCondition.FAIR)
  })

  it("returns POOR when next service is fewer than 7 days away", () => {
    expect(computeAssetStatus(daysFromNow(6))).toBe(AssetCondition.POOR)
    expect(computeAssetStatus(daysFromNow(1))).toBe(AssetCondition.POOR)
  })

  it("returns POOR when next service is overdue", () => {
    expect(computeAssetStatus(daysAgo(1))).toBe(AssetCondition.POOR)
    expect(computeAssetStatus(daysAgo(30))).toBe(AssetCondition.POOR)
  })

  it("returns GOOD when nextServiceDue is null", () => {
    expect(computeAssetStatus(null)).toBe(AssetCondition.GOOD)
  })
})
