-- CreateTable
CREATE TABLE "Center" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ONBOARDING',
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "operatingSince" DATETIME,
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ResidentialDetails" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "centerId" TEXT NOT NULL,
    "rwaName" TEXT NOT NULL,
    "totalUnits" INTEGER NOT NULL,
    "contactPersonName" TEXT NOT NULL,
    "contactPersonPhone" TEXT NOT NULL,
    "contactPersonEmail" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ResidentialDetails_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "Center" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MyGateConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "centerId" TEXT NOT NULL,
    "societyId" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "webhookUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "lastSyncedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MyGateConfig_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "Center" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ServiceConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "centerId" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "monthlyFee" REAL NOT NULL,
    "setupFee" REAL NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ServiceConfig_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "Center" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EquipmentAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "centerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "serialNumber" TEXT,
    "purchasedOn" DATETIME,
    "warrantyExpiry" DATETIME,
    "lastServicedOn" DATETIME,
    "nextServiceDue" DATETIME,
    "condition" TEXT NOT NULL DEFAULT 'GOOD',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EquipmentAsset_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "Center" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Trainer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "trainerType" TEXT NOT NULL DEFAULT 'FULLTIME',
    "specialization" TEXT,
    "certifications" TEXT,
    "joinedOn" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CenterTrainerMapping" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "centerId" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "assignedOn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CenterTrainerMapping_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "Center" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CenterTrainerMapping_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrainerAttendance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "centerId" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "checkIn" DATETIME,
    "checkOut" DATETIME,
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "status" TEXT NOT NULL DEFAULT 'PRESENT',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TrainerAttendance_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "Center" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TrainerAttendance_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PTSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "centerId" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "sessionDate" DATETIME NOT NULL,
    "durationMins" INTEGER NOT NULL DEFAULT 60,
    "ratePerHour" REAL NOT NULL,
    "memberName" TEXT,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PTSession_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "Center" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PTSession_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FootfallEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "centerId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "memberName" TEXT,
    "memberId" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL DEFAULT 'MYGATE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FootfallEvent_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "Center" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ServiceRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "centerId" TEXT NOT NULL,
    "assetId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "reportedBy" TEXT,
    "assignedTo" TEXT,
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ServiceRequest_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "Center" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ServiceRequest_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "EquipmentAsset" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Center_code_key" ON "Center"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ResidentialDetails_centerId_key" ON "ResidentialDetails"("centerId");

-- CreateIndex
CREATE UNIQUE INDEX "MyGateConfig_centerId_key" ON "MyGateConfig"("centerId");

-- CreateIndex
CREATE UNIQUE INDEX "CenterTrainerMapping_centerId_trainerId_key" ON "CenterTrainerMapping"("centerId", "trainerId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainerAttendance_centerId_trainerId_date_key" ON "TrainerAttendance"("centerId", "trainerId", "date");
