/*
  Warnings:

  - You are about to drop the column `pieces` on the `Fit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Fit" DROP COLUMN "pieces";

-- CreateTable
CREATE TABLE "_FitClothing" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_FitClothing_AB_unique" ON "_FitClothing"("A", "B");

-- CreateIndex
CREATE INDEX "_FitClothing_B_index" ON "_FitClothing"("B");

-- AddForeignKey
ALTER TABLE "_FitClothing" ADD CONSTRAINT "_FitClothing_A_fkey" FOREIGN KEY ("A") REFERENCES "Clothing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FitClothing" ADD CONSTRAINT "_FitClothing_B_fkey" FOREIGN KEY ("B") REFERENCES "Fit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
