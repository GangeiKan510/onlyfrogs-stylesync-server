/*
  Warnings:

  - You are about to drop the column `createdAt` on the `ChatSession` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `ChatSession` table. All the data in the column will be lost.
  - You are about to drop the column `occasion` on the `Clothing` table. All the data in the column will be lost.
  - You are about to drop the column `season` on the `Clothing` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Clothing` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Clothing` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `isRead` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `PromptSettings` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `PromptSettings` table. All the data in the column will be lost.
  - You are about to drop the column `auto_tag_tokens` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `favorite_colors` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `last_token_reset` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `preferred_brands` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `preferred_style` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `skin_tone_complements` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `style_preferences` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `tokens` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Worn` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Worn` table. All the data in the column will be lost.
  - You are about to drop the `_FitClothing` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `ChatSession` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `ChatSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `PromptSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Worn` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ChatSession" DROP CONSTRAINT "ChatSession_userId_fkey";

-- DropForeignKey
ALTER TABLE "Clothing" DROP CONSTRAINT "Clothing_user_id_fkey";

-- DropForeignKey
ALTER TABLE "_FitClothing" DROP CONSTRAINT "_FitClothing_A_fkey";

-- DropForeignKey
ALTER TABLE "_FitClothing" DROP CONSTRAINT "_FitClothing_B_fkey";

-- DropIndex
DROP INDEX "ChatSession_userId_key";

-- AlterTable
ALTER TABLE "ChatSession" DROP COLUMN "createdAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Clothing" DROP COLUMN "occasion",
DROP COLUMN "season",
DROP COLUMN "tags",
DROP COLUMN "user_id",
ALTER COLUMN "category" DROP DEFAULT,
ALTER COLUMN "category" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "createdAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "createdAt",
DROP COLUMN "isRead",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_read" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "PromptSettings" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "auto_tag_tokens",
DROP COLUMN "favorite_colors",
DROP COLUMN "last_token_reset",
DROP COLUMN "preferred_brands",
DROP COLUMN "preferred_style",
DROP COLUMN "skin_tone_complements",
DROP COLUMN "style_preferences",
DROP COLUMN "tokens",
ALTER COLUMN "role" DROP NOT NULL,
ALTER COLUMN "role" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Worn" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "_FitClothing";

-- CreateTable
CREATE TABLE "UserToken" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSkinToneComplement" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "complement" TEXT NOT NULL,

    CONSTRAINT "UserSkinToneComplement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserStylePreference" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "style" TEXT NOT NULL,

    CONSTRAINT "UserStylePreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserFavoriteColor" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "UserFavoriteColor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPreferredBrand" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,

    CONSTRAINT "UserPreferredBrand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPreferredStyle" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "style" TEXT NOT NULL,

    CONSTRAINT "UserPreferredStyle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClothingTag" (
    "id" TEXT NOT NULL,
    "clothing_id" TEXT NOT NULL,
    "tag" TEXT NOT NULL,

    CONSTRAINT "ClothingTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClothingSeason" (
    "id" TEXT NOT NULL,
    "clothing_id" TEXT NOT NULL,
    "season" TEXT NOT NULL,

    CONSTRAINT "ClothingSeason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClothingOccasion" (
    "id" TEXT NOT NULL,
    "clothing_id" TEXT NOT NULL,
    "occasion" TEXT NOT NULL,

    CONSTRAINT "ClothingOccasion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FitClothing" (
    "id" TEXT NOT NULL,
    "fit_id" TEXT NOT NULL,
    "clothing_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FitClothing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserToken_id_key" ON "UserToken"("id");

-- CreateIndex
CREATE UNIQUE INDEX "UserSkinToneComplement_id_key" ON "UserSkinToneComplement"("id");

-- CreateIndex
CREATE UNIQUE INDEX "UserStylePreference_id_key" ON "UserStylePreference"("id");

-- CreateIndex
CREATE UNIQUE INDEX "UserFavoriteColor_id_key" ON "UserFavoriteColor"("id");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreferredBrand_id_key" ON "UserPreferredBrand"("id");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreferredStyle_id_key" ON "UserPreferredStyle"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ClothingTag_id_key" ON "ClothingTag"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ClothingSeason_id_key" ON "ClothingSeason"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ClothingOccasion_id_key" ON "ClothingOccasion"("id");

-- CreateIndex
CREATE UNIQUE INDEX "FitClothing_id_key" ON "FitClothing"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ChatSession_user_id_key" ON "ChatSession"("user_id");

-- AddForeignKey
ALTER TABLE "UserToken" ADD CONSTRAINT "UserToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSkinToneComplement" ADD CONSTRAINT "UserSkinToneComplement_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStylePreference" ADD CONSTRAINT "UserStylePreference_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFavoriteColor" ADD CONSTRAINT "UserFavoriteColor_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPreferredBrand" ADD CONSTRAINT "UserPreferredBrand_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPreferredStyle" ADD CONSTRAINT "UserPreferredStyle_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClothingTag" ADD CONSTRAINT "ClothingTag_clothing_id_fkey" FOREIGN KEY ("clothing_id") REFERENCES "Clothing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClothingSeason" ADD CONSTRAINT "ClothingSeason_clothing_id_fkey" FOREIGN KEY ("clothing_id") REFERENCES "Clothing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClothingOccasion" ADD CONSTRAINT "ClothingOccasion_clothing_id_fkey" FOREIGN KEY ("clothing_id") REFERENCES "Clothing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FitClothing" ADD CONSTRAINT "FitClothing_fit_id_fkey" FOREIGN KEY ("fit_id") REFERENCES "Fit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FitClothing" ADD CONSTRAINT "FitClothing_clothing_id_fkey" FOREIGN KEY ("clothing_id") REFERENCES "Clothing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
