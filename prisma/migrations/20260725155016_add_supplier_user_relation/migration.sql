-- AlterTable
ALTER TABLE "User" ADD COLUMN     "supplierId" TEXT;

-- CreateIndex
CREATE INDEX "User_supplierId_idx" ON "User"("supplierId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
