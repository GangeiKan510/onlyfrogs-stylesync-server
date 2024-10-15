-- CreateTable
CREATE TABLE "Worn" (
    "id" TEXT NOT NULL,
    "last_worn" TIMESTAMP(3) NOT NULL,
    "clothing_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Worn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Worn_id_key" ON "Worn"("id");

-- AddForeignKey
ALTER TABLE "Worn" ADD CONSTRAINT "Worn_clothing_id_fkey" FOREIGN KEY ("clothing_id") REFERENCES "Clothing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
