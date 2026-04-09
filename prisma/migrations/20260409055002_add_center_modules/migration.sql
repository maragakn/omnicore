-- CreateTable
CREATE TABLE "CenterModule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "centerId" TEXT NOT NULL,
    "moduleKey" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "config" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CenterModule_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "Center" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CenterModule_centerId_moduleKey_key" ON "CenterModule"("centerId", "moduleKey");
