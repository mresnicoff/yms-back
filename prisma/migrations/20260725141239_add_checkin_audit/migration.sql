-- AlterTable
ALTER TABLE "CheckIn" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "DockOperation" ADD COLUMN     "assignedById" TEXT;

-- CreateIndex
CREATE INDEX "CheckIn_truckId_idx" ON "CheckIn"("truckId");

-- CreateIndex
CREATE INDEX "CheckIn_arrivalTime_idx" ON "CheckIn"("arrivalTime");

-- CreateIndex
CREATE INDEX "DockOperation_startedAt_idx" ON "DockOperation"("startedAt");

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DockOperation" ADD CONSTRAINT "DockOperation_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
