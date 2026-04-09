import { describe, it, expect } from "vitest"
import { L0_STAGES, L0_STAGE_LABELS } from "@/lib/trainers/l0Stages"

describe("L0 training stages", () => {
  it("uses a three-stage flow separate from hiring", () => {
    expect(L0_STAGES).toEqual(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"])
  })

  it("has a label for every stage", () => {
    for (const s of L0_STAGES) {
      expect(L0_STAGE_LABELS[s].length).toBeGreaterThan(0)
    }
  })
})
