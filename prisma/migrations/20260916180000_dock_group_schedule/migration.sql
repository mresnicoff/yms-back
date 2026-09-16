-- CreateTable
CREATE TABLE "DockGroupSchedule" (
    "id" TEXT NOT NULL,
    "dockGroupId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "closed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DockGroupSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DockGroupSchedule_dockGroupId_weekday_key" ON "DockGroupSchedule"("dockGroupId", "weekday");

-- CreateIndex
CREATE INDEX "DockGroupSchedule_dockGroupId_idx" ON "DockGroupSchedule"("dockGroupId");

-- AddForeignKey
ALTER TABLE "DockGroupSchedule" ADD CONSTRAINT "DockGroupSchedule_dockGroupId_fkey" FOREIGN KEY ("dockGroupId") REFERENCES "DockGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
