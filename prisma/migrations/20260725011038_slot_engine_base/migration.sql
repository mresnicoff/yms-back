/*
  Warnings:

  - Added the required column `dockGroupId` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `warehouseId` to the `Appointment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "dockGroupId" TEXT NOT NULL,
ADD COLUMN     "warehouseId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "DockSchedule" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_roleId_idx" ON "User"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_code_key" ON "Role"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_code_key" ON "Permission"("code");

-- CreateIndex
CREATE INDEX "Appointment_startTime_idx" ON "Appointment"("startTime");

-- CreateIndex
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");

-- CreateIndex
CREATE INDEX "Appointment_warehouseId_idx" ON "Appointment"("warehouseId");

-- CreateIndex
CREATE INDEX "Appointment_dockGroupId_idx" ON "Appointment"("dockGroupId");

-- CreateIndex
CREATE INDEX "Appointment_dockGroupId_startTime_idx" ON "Appointment"("dockGroupId", "startTime");

-- CreateIndex
CREATE INDEX "Dock_groupId_idx" ON "Dock"("groupId");

-- CreateIndex
CREATE INDEX "Dock_status_idx" ON "Dock"("status");

-- CreateIndex
CREATE INDEX "DockGroup_warehouseId_idx" ON "DockGroup"("warehouseId");

-- CreateIndex
CREATE INDEX "DockOperation_dockId_idx" ON "DockOperation"("dockId");

-- CreateIndex
CREATE INDEX "DockOperation_status_idx" ON "DockOperation"("status");

-- CreateIndex
CREATE INDEX "DockSchedule_dockId_idx" ON "DockSchedule"("dockId");

-- CreateIndex
CREATE INDEX "DockSchedule_weekday_idx" ON "DockSchedule"("weekday");

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_dockGroupId_fkey" FOREIGN KEY ("dockGroupId") REFERENCES "DockGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
