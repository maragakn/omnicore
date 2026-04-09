-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "societyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'INVITED',
    "inviteToken" TEXT NOT NULL,
    "inviteExpiresAt" DATETIME NOT NULL,
    "formData" TEXT,
    "centerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Lead_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "Center" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "sentAt" DATETIME,
    "acceptedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Quote_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuoteLineItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quoteId" TEXT NOT NULL,
    "moduleKey" TEXT NOT NULL,
    "pricingType" TEXT NOT NULL,
    "oneTimeFee" INTEGER,
    "monthlyFee" INTEGER,
    "takeRatePct" REAL,
    CONSTRAINT "QuoteLineItem_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ServicePricingConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "moduleKey" TEXT NOT NULL,
    "pricingType" TEXT NOT NULL,
    "defaultOneTimeFee" INTEGER,
    "defaultMonthlyFee" INTEGER,
    "defaultTakeRatePct" REAL
);

-- CreateTable
CREATE TABLE "EquipmentRecommendation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sizeCategory" TEXT NOT NULL,
    "items" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_inviteToken_key" ON "Lead"("inviteToken");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_centerId_key" ON "Lead"("centerId");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_leadId_key" ON "Quote"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "ServicePricingConfig_moduleKey_key" ON "ServicePricingConfig"("moduleKey");

-- CreateIndex
CREATE UNIQUE INDEX "EquipmentRecommendation_sizeCategory_key" ON "EquipmentRecommendation"("sizeCategory");
