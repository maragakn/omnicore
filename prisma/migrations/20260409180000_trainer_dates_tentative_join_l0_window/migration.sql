-- TrainerOnboarding: tentative start + actual join date
ALTER TABLE "TrainerOnboarding" ADD COLUMN "tentativeStartDate" DATETIME;
ALTER TABLE "TrainerOnboarding" ADD COLUMN "joinedOn" DATETIME;

-- TrainerL0Training: rename program window to startDate / endDate
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_TrainerL0Training" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "l0Stage" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "employeeRef" TEXT,
    "notes" TEXT,
    "sourceOnboardingId" TEXT,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "new_TrainerL0Training" (
    "id", "l0Stage", "name", "phone", "email", "employeeRef", "notes", "sourceOnboardingId",
    "startDate", "endDate", "createdAt", "updatedAt"
)
SELECT
    "id", "l0Stage", "name", "phone", "email", "employeeRef", "notes", "sourceOnboardingId",
    "startedAt", "completedAt", "createdAt", "updatedAt"
FROM "TrainerL0Training";

DROP TABLE "TrainerL0Training";
ALTER TABLE "new_TrainerL0Training" RENAME TO "TrainerL0Training";

CREATE UNIQUE INDEX "TrainerL0Training_sourceOnboardingId_key" ON "TrainerL0Training"("sourceOnboardingId");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
