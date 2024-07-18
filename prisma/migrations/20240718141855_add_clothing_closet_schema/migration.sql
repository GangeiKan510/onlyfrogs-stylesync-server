/*
  Warnings:

  - Added the required column `tokens` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "tokens" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Clothing" (
    "id" TEXT NOT NULL,
    "serial" SERIAL NOT NULL,
    "image_url" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "closet_id" TEXT NOT NULL,

    CONSTRAINT "Clothing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Closet" (
    "id" TEXT NOT NULL,
    "serial" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "Closet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Clothing_id_key" ON "Clothing"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Clothing_serial_key" ON "Clothing"("serial");

-- CreateIndex
CREATE UNIQUE INDEX "Closet_id_key" ON "Closet"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Closet_serial_key" ON "Closet"("serial");

-- AddForeignKey
ALTER TABLE "Clothing" ADD CONSTRAINT "Clothing_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clothing" ADD CONSTRAINT "Clothing_closet_id_fkey" FOREIGN KEY ("closet_id") REFERENCES "Closet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Closet" ADD CONSTRAINT "Closet_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
