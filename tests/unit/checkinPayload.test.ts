import { describe, expect, it } from "vitest"
import { formatCheckinPayload, parseCheckinPayload } from "@/lib/demo/checkinPayload"

describe("parseCheckinPayload", () => {
  it("parses full payload", () => {
    const id = "clxyz0123456789012345678901"
    expect(parseCheckinPayload(formatCheckinPayload(id))).toBe(id)
  })

  it("parses bare cuid", () => {
    const id = "clabcdefghijk012345678901"
    expect(parseCheckinPayload(`  ${id} `)).toBe(id)
  })

  it("parses id from query string", () => {
    const id = "clabcdefghijk012345678901"
    expect(parseCheckinPayload(`https://x.test/y?id=${id}&z=1`)).toBe(id)
  })

  it("returns null for garbage", () => {
    expect(parseCheckinPayload("not-a-token")).toBeNull()
  })
})
