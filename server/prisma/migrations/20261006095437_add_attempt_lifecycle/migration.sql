-- CreateEnum
CREATE TYPE "AttemptStage" AS ENUM ('RESEARCHING', 'SPEAKING', 'SUBMITTED');

-- AlterTable
ALTER TABLE "Attempt" ADD COLUMN     "researchEndedAt" TIMESTAMP(3),
ADD COLUMN     "speakingEndedAt" TIMESTAMP(3),
ADD COLUMN     "speakingStartedAt" TIMESTAMP(3),
ADD COLUMN     "stage" "AttemptStage" NOT NULL DEFAULT 'RESEARCHING',
ADD COLUMN     "submittedAt" TIMESTAMP(3),
ADD COLUMN     "transcript" TEXT;

-- CreateIndex
CREATE INDEX "Attempt_userId_stage_idx" ON "Attempt"("userId", "stage");
