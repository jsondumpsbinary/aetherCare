-- CreateEnum
CREATE TYPE "BedType" AS ENUM ('GENERAL', 'ICU', 'PRIVATE');

-- CreateEnum
CREATE TYPE "BedStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE');

-- CreateTable
CREATE TABLE "Ward" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bed" (
    "id" SERIAL NOT NULL,
    "bedNumber" TEXT NOT NULL,
    "bedType" "BedType" NOT NULL DEFAULT 'GENERAL',
    "status" "BedStatus" NOT NULL DEFAULT 'AVAILABLE',
    "wardId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bed_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ward_name_key" ON "Ward"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Bed_bedNumber_key" ON "Bed"("bedNumber");

-- CreateIndex
CREATE INDEX "Bed_wardId_idx" ON "Bed"("wardId");

-- CreateIndex
CREATE INDEX "Bed_status_idx" ON "Bed"("status");

-- AddForeignKey
ALTER TABLE "Bed" ADD CONSTRAINT "Bed_wardId_fkey" FOREIGN KEY ("wardId") REFERENCES "Ward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
