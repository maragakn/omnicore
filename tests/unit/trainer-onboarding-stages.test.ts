import { describe, it, expect } from "vitest"
import {
  TRAINER_ONBOARDING_STAGES,
  TRAINER_ONBOARDING_STAGE_LABELS,
  TRAINER_ONBOARDING_STAGE_DESCRIPTIONS,
} from "@/lib/trainers/onboardingStages"

describe("trainer hiring pipeline stages", () => {
  it("ends at offer accepted (no L0 or center posting in hiring)", () => {
    expect(TRAINER_ONBOARDING_STAGES).toEqual([
      "HIRING",
      "INTERVIEWING",
      "OFFER_ROLLED_OUT",
      "OFFER_ACCEPTED",
    ])
    expect(TRAINER_ONBOARDING_STAGES).not.toContain("L0_TRAINING")
    expect(TRAINER_ONBOARDING_STAGES).not.toContain("POSTED_TO_CENTER")
  })

  it("has a label for every stage", () => {
    for (const s of TRAINER_ONBOARDING_STAGES) {
      expect(TRAINER_ONBOARDING_STAGE_LABELS[s].length).toBeGreaterThan(0)
    }
  })

  it("documents what Hiring means vs later stages", () => {
    expect(TRAINER_ONBOARDING_STAGE_DESCRIPTIONS.HIRING.toLowerCase()).toMatch(/sourcing|screening/)
    expect(TRAINER_ONBOARDING_STAGE_DESCRIPTIONS.OFFER_ROLLED_OUT.toLowerCase()).toMatch(/tentative/)
  })
})
