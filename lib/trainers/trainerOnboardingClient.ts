import type { TrainerOnboarding } from "@prisma/client"

/** JSON-serializable onboarding row for Server → Client Components. */
export type ClientTrainerOnboarding = {
  id: string
  pipelineStage: string
  name: string
  phone: string
  email: string | null
  employeeRef: string | null
  govtIdentityId: string | null
  areaLocality: string | null
  experience: string | null
  languagesKnown: string | null
  imageUrl: string | null
  address: string | null
  tentativeStartDate: string | null
  joinedOn: string | null
  createdAt: string
  updatedAt: string
}

export function toClientTrainerOnboarding(row: TrainerOnboarding): ClientTrainerOnboarding {
  return {
    id: row.id,
    pipelineStage: row.pipelineStage,
    name: row.name,
    phone: row.phone,
    email: row.email,
    employeeRef: row.employeeRef,
    govtIdentityId: row.govtIdentityId,
    areaLocality: row.areaLocality,
    experience: row.experience,
    languagesKnown: row.languagesKnown,
    imageUrl: row.imageUrl,
    address: row.address,
    tentativeStartDate: row.tentativeStartDate ? row.tentativeStartDate.toISOString() : null,
    joinedOn: row.joinedOn ? row.joinedOn.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
