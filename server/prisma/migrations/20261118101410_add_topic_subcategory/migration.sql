-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "subcategory" TEXT;

-- CreateIndex
CREATE INDEX "Topic_category_subcategory_idx" ON "Topic"("category", "subcategory");
