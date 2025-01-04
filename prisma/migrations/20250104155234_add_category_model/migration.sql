/*
  Warnings:

  - You are about to drop the column `category` on the `Clothing` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Clothing" DROP COLUMN "category",
ADD COLUMN     "category_id" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "birth_date" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_id_key" ON "Category"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_type_key" ON "Category"("name", "type");

-- AddForeignKey
ALTER TABLE "Clothing" ADD CONSTRAINT "Clothing_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
