-- AlterTable
ALTER TABLE "Evaluation" ADD COLUMN     "fillerWordFeedback" TEXT,
ADD COLUMN     "paceFeedback" TEXT,
ADD COLUMN     "speakingDurationSeconds" INTEGER,
ADD COLUMN     "wordsPerMinute" DOUBLE PRECISION;
