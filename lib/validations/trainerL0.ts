import { z } from "zod"

const L0_STAGE_ENUM = z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"])

export const TrainerL0CreateSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.union([z.literal(""), z.string().email()]).optional(),
  employeeRef: z.string().optional(),
  notes: z.string().optional(),
  l0Stage: L0_STAGE_ENUM.optional(),
  sourceOnboardingId: z.string().optional(),
  startDate: z.union([z.literal(""), z.string()]).optional(),
  endDate: z.union([z.literal(""), z.string()]).optional(),
})

export type TrainerL0CreateInput = z.infer<typeof TrainerL0CreateSchema>

export const TrainerL0UpdateSchema = TrainerL0CreateSchema.partial()
