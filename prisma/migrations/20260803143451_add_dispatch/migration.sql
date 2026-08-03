-- CreateTable
CREATE TABLE "Dispatch" (
    "id" TEXT NOT NULL,
    "dockOperationId" TEXT NOT NULL,
    "routeSheetNumber" TEXT NOT NULL,
    "sealNumbers" TEXT[],
    "checkedOutAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dispatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Dispatch_dockOperationId_key" ON "Dispatch"("dockOperationId");

-- AddForeignKey
ALTER TABLE "Dispatch" ADD CONSTRAINT "Dispatch_dockOperationId_fkey" FOREIGN KEY ("dockOperationId") REFERENCES "DockOperation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
