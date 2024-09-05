-- AlterTable
ALTER TABLE "Clothing" ALTER COLUMN "category" SET DEFAULT 'unknown',
ALTER COLUMN "tags" SET DEFAULT ARRAY[]::TEXT[];
