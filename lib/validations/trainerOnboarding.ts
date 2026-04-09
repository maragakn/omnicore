import { z } from "zod"
import { TRAINER_ONBOARDING_STAGES } from "@/lib/trainers/onboardingStages"

/** Accept empty string from HTML inputs; API routes map "" → null / omit. */
export const TrainerOnboardingCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.union([z.literal(""), z.string().email()]).optional(),
  employeeRef: z.string().optional(),
  govtIdentityId: z.string().optional(),
  areaLocality: z.string().optional(),
  experience: z.string().optional(),
  languagesKnown: z.string().optional(),
  imageUrl: z.union([z.literal(""), z.string().url("Invalid image URL")]).optional(),
  address: z.string().optional(),
  pipelineStage: z.enum(TRAINER_ONBOARDING_STAGES).optional(),
  tentativeStartDate: z.union([z.literal(""), z.string()]).optional(),
  joinedOn: z.union([z.literal(""), z.string()]).optional(),
})

export type TrainerOnboardingCreateInput = z.infer<typeof TrainerOnboardingCreateSchema>

export const TrainerOnboardingUpdateSchema = TrainerOnboardingCreateSchema.partial()

export type TrainerOnboardingUpdateInput = z.infer<typeof TrainerOnboardingUpdateSchema>
