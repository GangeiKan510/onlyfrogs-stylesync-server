/*
  Warnings:

  - Added the required column `category` to the `Clothing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Clothing" ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "tags" TEXT[];

-- CreateTable
CREATE TABLE "Fit" (
    "id" TEXT NOT NULL,
    "serial" SERIAL NOT NULL,
    "top_id" TEXT NOT NULL,
    "bottom_id" TEXT NOT NULL,
    "shoes_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "Fit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Fit_id_key" ON "Fit"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Fit_serial_key" ON "Fit"("serial");

-- AddForeignKey
ALTER TABLE "Fit" ADD CONSTRAINT "Fit_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fit" ADD CONSTRAINT "Fit_top_id_fkey" FOREIGN KEY ("top_id") REFERENCES "Clothing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fit" ADD CONSTRAINT "Fit_bottom_id_fkey" FOREIGN KEY ("bottom_id") REFERENCES "Clothing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fit" ADD CONSTRAINT "Fit_shoes_id_fkey" FOREIGN KEY ("shoes_id") REFERENCES "Clothing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
