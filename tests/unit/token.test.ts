import { describe, it, expect } from "vitest"
import { generateInviteToken, isTokenExpired, tokenExpiresAt, TOKEN_EXPIRY_DAYS } from "@/lib/leads/token"

describe("generateInviteToken", () => {
  it("returns a 64-character hex string", () => {
    const token = generateInviteToken()
    expect(token).toHaveLength(64)
    expect(token).toMatch(/^[0-9a-f]+$/)
  })

  it("returns unique tokens on each call", () => {
    expect(generateInviteToken()).not.toBe(generateInviteToken())
  })
})

describe("isTokenExpired", () => {
  it("returns false for a future expiry", () => {
    const future = new Date(Date.now() + 1000 * 60 * 60)
    expect(isTokenExpired(future)).toBe(false)
  })

  it("returns true for a past expiry", () => {
    const past = new Date(Date.now() - 1)
    expect(isTokenExpired(past)).toBe(true)
  })
})

describe("tokenExpiresAt", () => {
  it(`sets expiry to TOKEN_EXPIRY_DAYS days from now`, () => {
    const before = Date.now()
    const expiresAt = tokenExpiresAt()
    const after = Date.now()
    const expectedMs = TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
    expect(expiresAt.getTime()).toBeGreaterThanOrEqual(before + expectedMs)
    expect(expiresAt.getTime()).toBeLessThanOrEqual(after + expectedMs)
  })
})
