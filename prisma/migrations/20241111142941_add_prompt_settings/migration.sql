-- CreateTable
CREATE TABLE "PromptSettings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "consider_skin_tone" BOOLEAN NOT NULL DEFAULT false,
    "prioritize_preferences" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromptSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PromptSettings_id_key" ON "PromptSettings"("id");

-- CreateIndex
CREATE UNIQUE INDEX "PromptSettings_user_id_key" ON "PromptSettings"("user_id");

-- AddForeignKey
ALTER TABLE "PromptSettings" ADD CONSTRAINT "PromptSettings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
