-- CreateEnum
CREATE TYPE "AssignmentMode" AS ENUM ('AUTO', 'MANUAL');

-- AlterTable
ALTER TABLE "DockGroup" ADD COLUMN     "assignmentMode" "AssignmentMode" NOT NULL DEFAULT 'AUTO';
