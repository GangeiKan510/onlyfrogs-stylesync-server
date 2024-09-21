/*
  Warnings:

  - You are about to drop the column `budget_preferences` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `favorite_color` on the `User` table. All the data in the column will be lost.
  - The `birth_date` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `height` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "budget_preferences",
DROP COLUMN "favorite_color",
ADD COLUMN     "body_type" TEXT,
ADD COLUMN     "budget_max" INTEGER,
ADD COLUMN     "budget_min" INTEGER,
ADD COLUMN     "favorite_colors" TEXT[],
ADD COLUMN     "location" TEXT,
ADD COLUMN     "preferred_brands" TEXT[],
ADD COLUMN     "season" TEXT,
ADD COLUMN     "skin_tone_complements" TEXT[],
ADD COLUMN     "sub_season" TEXT,
ADD COLUMN     "weight" INTEGER,
DROP COLUMN "birth_date",
ADD COLUMN     "birth_date" TIMESTAMP(3),
DROP COLUMN "height",
ADD COLUMN     "height" INTEGER;
