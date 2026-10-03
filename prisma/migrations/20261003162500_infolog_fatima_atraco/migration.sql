-- CreateEnum
CREATE TYPE "CheckoutMode" AS ENUM ('DISPATCH', 'CLIENT_PALLETS');

-- AlterTable
ALTER TABLE "Warehouse" ADD COLUMN     "checkoutMode" "CheckoutMode" NOT NULL DEFAULT 'DISPATCH',
ADD COLUMN     "infologLastSyncedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Appointment" ALTER COLUMN "vehicleTypeId" DROP NOT NULL,
ADD COLUMN     "externalTripId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_externalTripId_key" ON "Appointment"("externalTripId");

-- AlterTable
ALTER TABLE "CheckIn" ADD COLUMN     "semiTruckId" TEXT;

-- CreateIndex
CREATE INDEX "CheckIn_semiTruckId_idx" ON "CheckIn"("semiTruckId");

-- AlterTable
ALTER TABLE "Dispatch" ALTER COLUMN "routeSheetNumber" DROP NOT NULL,
ADD COLUMN     "pallets" INTEGER;

-- CreateTable
CREATE TABLE "Atraco" (
    "id" TEXT NOT NULL,
    "checkInId" TEXT NOT NULL,
    "cunasColocadas" INTEGER NOT NULL,
    "llavesOk" BOOLEAN NOT NULL,
    "clienteFinal" TEXT NOT NULL,
    "receptor" TEXT NOT NULL,
    "auditor" TEXT NOT NULL,
    "cargador" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Atraco_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Atraco_checkInId_key" ON "Atraco"("checkInId");

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_semiTruckId_fkey" FOREIGN KEY ("semiTruckId") REFERENCES "Truck"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Atraco" ADD CONSTRAINT "Atraco_checkInId_fkey" FOREIGN KEY ("checkInId") REFERENCES "CheckIn"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Atraco" ADD CONSTRAINT "Atraco_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
