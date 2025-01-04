/*
  Warnings:

  - You are about to drop the column `category_id` on the `Clothing` table. All the data in the column will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Clothing" DROP CONSTRAINT "Clothing_category_id_fkey";

-- AlterTable
ALTER TABLE "Clothing" DROP COLUMN "category_id";

-- DropTable
DROP TABLE "Category";

-- CreateTable
CREATE TABLE "ClothingCategory" (
    "id" TEXT NOT NULL,
    "clothing_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "ClothingCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClothingCategory_id_key" ON "ClothingCategory"("id");

-- AddForeignKey
ALTER TABLE "ClothingCategory" ADD CONSTRAINT "ClothingCategory_clothing_id_fkey" FOREIGN KEY ("clothing_id") REFERENCES "Clothing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
