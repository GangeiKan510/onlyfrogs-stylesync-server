-- AlterTable
ALTER TABLE "User" ADD COLUMN     "auto_tag_tokens" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "last_token_reset" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;