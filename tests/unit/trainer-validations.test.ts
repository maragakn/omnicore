import { describe, it, expect } from "vitest"
import { TrainerOnboardingCreateSchema } from "@/lib/validations/trainerOnboarding"
import { TrainerL0CreateSchema } from "@/lib/validations/trainerL0"

describe("TrainerOnboardingCreateSchema", () => {
  it("accepts minimal valid hiring candidate", () => {
    const parsed = TrainerOnboardingCreateSchema.parse({
      name: "A User",
      phone: "+91 90000 00000",
    })
    expect(parsed.name).toBe("A User")
  })

  it("rejects invalid email when provided", () => {
    expect(() =>
      TrainerOnboardingCreateSchema.parse({
        name: "X",
        phone: "1",
        email: "not-an-email",
      })
    ).toThrow()
  })

  it("accepts OFFER_ACCEPTED as pipeline stage", () => {
    const parsed = TrainerOnboardingCreateSchema.parse({
      name: "X",
      phone: "1",
      pipelineStage: "OFFER_ACCEPTED",
    })
    expect(parsed.pipelineStage).toBe("OFFER_ACCEPTED")
  })

  it("rejects legacy hiring stages removed from product", () => {
    expect(() =>
      TrainerOnboardingCreateSchema.parse({
        name: "X",
        phone: "1",
        pipelineStage: "POSTED_TO_CENTER",
      })
    ).toThrow()
  })
})

describe("TrainerL0CreateSchema", () => {
  it("accepts minimal L0 enrollment", () => {
    const parsed = TrainerL0CreateSchema.parse({
      name: "L0 Trainee",
      phone: "+91 90000 00001",
    })
    expect(parsed.name).toBe("L0 Trainee")
  })

  it("accepts all L0 stage values", () => {
    for (const l0Stage of ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"] as const) {
      const parsed = TrainerL0CreateSchema.parse({
        name: "T",
        phone: "1",
        l0Stage,
      })
      expect(parsed.l0Stage).toBe(l0Stage)
    }
  })
})
