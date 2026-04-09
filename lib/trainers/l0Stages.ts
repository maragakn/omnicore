export const L0_STAGES = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"] as const

export type L0Stage = (typeof L0_STAGES)[number]

export const L0_STAGE_LABELS: Record<L0Stage, string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
}

/** One-line help under each L0 section header. */
export const L0_STAGE_DESCRIPTIONS: Record<L0Stage, string> = {
  NOT_STARTED: "Enrolled but program dates not set or not started yet.",
  IN_PROGRESS: "Active L0 window with start/end dates.",
  COMPLETED: "L0 finished; ready for roster / center assignment elsewhere.",
}
