-- CreateTable
CREATE TABLE "TrainerOnboarding" (
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
    "postedToCenterId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TrainerOnboarding_postedToCenterId_fkey" FOREIGN KEY ("postedToCenterId") REFERENCES "Center" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
