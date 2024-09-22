/*
  Warnings:

  - The `category` column on the `Clothing` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Clothing" ADD COLUMN     "brand" TEXT,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "material" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "occasion" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "pattern" TEXT,
ADD COLUMN     "season" TEXT[] DEFAULT ARRAY[]::TEXT[],
DROP COLUMN "category",
ADD COLUMN     "category" JSONB NOT NULL DEFAULT '{}';
