-- AlterTable
ALTER TABLE "User" ADD COLUMN     "primaryFocus" TEXT,
ADD COLUMN     "secondaryFocus" TEXT;

-- CreateTable
CREATE TABLE "PlanGenerationLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanGenerationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlanGenerationLog_userId_createdAt_idx" ON "PlanGenerationLog"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "PlanGenerationLog" ADD CONSTRAINT "PlanGenerationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
