-- CreateEnum
CREATE TYPE "DocumentOwnerType" AS ENUM ('DRIVER', 'TRUCK');

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "documentTypeId" TEXT NOT NULL,
    "ownerType" "DocumentOwnerType" NOT NULL,
    "driverId" TEXT,
    "truckId" TEXT,
    "expirationDate" TIMESTAMP(3),
    "fileUrl" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentType" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Document_driverId_idx" ON "Document"("driverId");

-- CreateIndex
CREATE INDEX "Document_truckId_idx" ON "Document"("truckId");

-- CreateIndex
CREATE INDEX "Document_expirationDate_idx" ON "Document"("expirationDate");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentType_code_key" ON "DocumentType"("code");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "DocumentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_truckId_fkey" FOREIGN KEY ("truckId") REFERENCES "Truck"("id") ON DELETE SET NULL ON UPDATE CASCADE;
