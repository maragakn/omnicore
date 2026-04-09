import { describe, it, expect } from "vitest"
import { computeQuoteTotals, formatPaise } from "@/lib/leads/quote"

describe("computeQuoteTotals", () => {
  it("sums one-time fees correctly", () => {
    const result = computeQuoteTotals([
      { oneTimeFee: 50000, monthlyFee: null },
      { oneTimeFee: 30000, monthlyFee: null },
    ])
    expect(result.totalOneTimePaise).toBe(80000)
    expect(result.totalMonthlyPaise).toBe(0)
  })

  it("sums monthly fees correctly", () => {
    const result = computeQuoteTotals([
      { oneTimeFee: null, monthlyFee: 10000 },
      { oneTimeFee: null, monthlyFee: 15000 },
    ])
    expect(result.totalOneTimePaise).toBe(0)
    expect(result.totalMonthlyPaise).toBe(25000)
  })

  it("sums mixed items correctly", () => {
    const result = computeQuoteTotals([
      { oneTimeFee: 200000, monthlyFee: null },
      { oneTimeFee: 50000, monthlyFee: 10000 },
      { oneTimeFee: null, monthlyFee: 20000 },
    ])
    expect(result.totalOneTimePaise).toBe(250000)
    expect(result.totalMonthlyPaise).toBe(30000)
  })

  it("returns zeros for empty list", () => {
    const result = computeQuoteTotals([])
    expect(result.totalOneTimePaise).toBe(0)
    expect(result.totalMonthlyPaise).toBe(0)
  })

  it("treats undefined fees as 0", () => {
    const result = computeQuoteTotals([{ oneTimeFee: undefined, monthlyFee: undefined }])
    expect(result.totalOneTimePaise).toBe(0)
    expect(result.totalMonthlyPaise).toBe(0)
  })
})

describe("formatPaise", () => {
  it("formats paise to rupees with Indian locale", () => {
    expect(formatPaise(100000)).toBe("₹1,000")
    expect(formatPaise(50000)).toBe("₹500")
    expect(formatPaise(0)).toBe("₹0")
  })
})
