-- DropForeignKey
ALTER TABLE "Worn" DROP CONSTRAINT "Worn_clothing_id_fkey";

-- AddForeignKey
ALTER TABLE "Worn" ADD CONSTRAINT "Worn_clothing_id_fkey" FOREIGN KEY ("clothing_id") REFERENCES "Clothing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
