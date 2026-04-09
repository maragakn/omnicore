-- CreateTable: post-offer L0 (separate from hiring and from center roster)
CREATE TABLE "TrainerL0Training" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "l0Stage" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "employeeRef" TEXT,
    "notes" TEXT,
    "sourceOnboardingId" TEXT,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "TrainerL0Training_sourceOnboardingId_key" ON "TrainerL0Training"("sourceOnboardingId");

-- Former L0_TRAINING candidates move entirely into L0 (no longer in hiring)
INSERT INTO "TrainerL0Training" ("id", "l0Stage", "name", "phone", "email", "employeeRef", "notes", "sourceOnboardingId", "startedAt", "completedAt", "createdAt", "updatedAt")
SELECT
    lower(hex(randomblob(16))),
    'IN_PROGRESS',
    "name",
    "phone",
    "email",
    "employeeRef",
    NULL,
    "id",
    NULL,
    NULL,
    "createdAt",
    "updatedAt"
FROM "TrainerOnboarding"
WHERE "pipelineStage" = 'L0_TRAINING';

-- Redefine TrainerOnboarding: drop center FK; hiring ends at OFFER_ACCEPTED.
-- Rows in POSTED_TO_CENTER are dropped here (center assignment is only via Trainer + CenterTrainerMapping).
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_TrainerOnboarding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pipelineStage" TEXT NOT NULL DEFAULT 'HIRING',
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "employeeRef" TEXT,
    "govtIdentityId" TEXT,
    "areaLocality" TEXT,
    "experience" TEXT,
    "languagesKnown" TEXT,
    "imageUrl" TEXT,
    "address" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "new_TrainerOnboarding" ("id", "pipelineStage", "name", "phone", "email", "employeeRef", "govtIdentityId", "areaLocality", "experience", "languagesKnown", "imageUrl", "address", "createdAt", "updatedAt")
SELECT
    "id",
    "pipelineStage",
    "name", "phone", "email", "employeeRef", "govtIdentityId", "areaLocality", "experience", "languagesKnown", "imageUrl", "address", "createdAt", "updatedAt"
FROM "TrainerOnboarding"
WHERE "pipelineStage" NOT IN ('L0_TRAINING', 'POSTED_TO_CENTER');

DROP TABLE "TrainerOnboarding";
ALTER TABLE "new_TrainerOnboarding" RENAME TO "TrainerOnboarding";

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
