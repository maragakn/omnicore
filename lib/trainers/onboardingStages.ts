export const TRAINER_ONBOARDING_STAGES = [
  "HIRING",
  "INTERVIEWING",
  "OFFER_ROLLED_OUT",
  "OFFER_ACCEPTED",
] as const

export type TrainerOnboardingStage = (typeof TRAINER_ONBOARDING_STAGES)[number]

export const TRAINER_ONBOARDING_STAGE_LABELS: Record<TrainerOnboardingStage, string> = {
  HIRING: "Hiring",
  INTERVIEWING: "Interviewing",
  OFFER_ROLLED_OUT: "Offers rolled out",
  OFFER_ACCEPTED: "Offer accepted",
}

/** Short explanations for CF Admin (tooltips / column help). */
export const TRAINER_ONBOARDING_STAGE_DESCRIPTIONS: Record<TrainerOnboardingStage, string> = {
  HIRING:
    "Sourcing and early screening: role is open, applications or referrals in progress — before structured interviews.",
  INTERVIEWING: "Structured interviews and assessments; no offer yet.",
  OFFER_ROLLED_OUT: "An offer is out; capture a tentative start date. Candidate has not necessarily accepted yet.",
  OFFER_ACCEPTED:
    "Offer accepted — record tentative start if still useful and the actual join date when they start employment.",
}
