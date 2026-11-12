-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('DAILY_PRACTICE', 'STREAK');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dailyReminderEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reminderTime" TEXT NOT NULL DEFAULT '18:00',
ADD COLUMN     "streakReminderEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata';

-- CreateTable
CREATE TABLE "ReminderLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ReminderType" NOT NULL,
    "localDate" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReminderLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReminderLog_userId_sentAt_idx" ON "ReminderLog"("userId", "sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReminderLog_userId_type_localDate_key" ON "ReminderLog"("userId", "type", "localDate");

-- AddForeignKey
ALTER TABLE "ReminderLog" ADD CONSTRAINT "ReminderLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
