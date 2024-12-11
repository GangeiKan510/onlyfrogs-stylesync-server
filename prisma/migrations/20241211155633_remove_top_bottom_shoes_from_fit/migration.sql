/*
  Warnings:

  - You are about to drop the column `bottom_id` on the `Fit` table. All the data in the column will be lost.
  - You are about to drop the column `shoes_id` on the `Fit` table. All the data in the column will be lost.
  - You are about to drop the column `top_id` on the `Fit` table. All the data in the column will be lost.
  - Added the required column `name` to the `Fit` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Fit" DROP CONSTRAINT "Fit_bottom_id_fkey";

-- DropForeignKey
ALTER TABLE "Fit" DROP CONSTRAINT "Fit_shoes_id_fkey";

-- DropForeignKey
ALTER TABLE "Fit" DROP CONSTRAINT "Fit_top_id_fkey";

-- AlterTable
ALTER TABLE "Fit" DROP COLUMN "bottom_id",
DROP COLUMN "shoes_id",
DROP COLUMN "top_id",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "pieces" TEXT[];
