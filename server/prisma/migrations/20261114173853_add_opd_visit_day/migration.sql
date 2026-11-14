/*
  Warnings:

  - A unique constraint covering the columns `[departmentId,visitDay,tokenNumber]` on the table `OPDVisit` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `visitDay` to the `OPDVisit` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "OPDVisit_departmentId_visitDate_tokenNumber_key";

-- AlterTable
ALTER TABLE "OPDVisit" ADD COLUMN     "visitDay" DATE NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "OPDVisit_departmentId_visitDay_tokenNumber_key" ON "OPDVisit"("departmentId", "visitDay", "tokenNumber");
