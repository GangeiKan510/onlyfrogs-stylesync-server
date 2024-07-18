/*
  Warnings:

  - You are about to drop the `BudgetPreferences` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BudgetPreferences" DROP CONSTRAINT "BudgetPreferences_user_id_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "budget_preferences" JSONB NOT NULL DEFAULT '{}';

-- DropTable
DROP TABLE "BudgetPreferences";
