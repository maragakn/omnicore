import type { TrainerL0Training } from "@prisma/client"

/** JSON-serializable shape for passing L0 rows from Server → Client Components. */
export type ClientTrainerL0Enrollment = {
  id: string
  name: string
  phone: string
  email: string | null
  employeeRef: string | null
  notes: string | null
  l0Stage: string
  sourceOnboardingId: string | null
  startDate: string | null
  endDate: string | null
  createdAt: string
  updatedAt: string
}

export function toClientTrainerL0Enrollment(row: TrainerL0Training): ClientTrainerL0Enrollment {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    employeeRef: row.employeeRef,
    notes: row.notes,
    l0Stage: row.l0Stage,
    sourceOnboardingId: row.sourceOnboardingId,
    startDate: row.startDate ? row.startDate.toISOString() : null,
    endDate: row.endDate ? row.endDate.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
