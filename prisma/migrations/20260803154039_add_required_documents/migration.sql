-- CreateTable
CREATE TABLE "RequiredDocument" (
    "id" TEXT NOT NULL,
    "documentTypeId" TEXT NOT NULL,
    "operationType" "OperationType",
    "ownerType" "DocumentOwnerType" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequiredDocument_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RequiredDocument" ADD CONSTRAINT "RequiredDocument_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "DocumentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
