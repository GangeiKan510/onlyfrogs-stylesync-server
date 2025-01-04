-- AlterTable
ALTER TABLE "User" 
  ALTER COLUMN "gender" SET DEFAULT '',
  ALTER COLUMN "skin_tone_classification" SET DEFAULT '',
  ALTER COLUMN "body_type" SET DEFAULT '',
  ALTER COLUMN "budget_max" SET DEFAULT 0,
  ALTER COLUMN "budget_min" SET DEFAULT 0,
  ALTER COLUMN "season" SET DEFAULT '',
  ALTER COLUMN "sub_season" SET DEFAULT '',
  ALTER COLUMN "weight" SET DEFAULT 0,
  ALTER COLUMN "birth_date" SET DEFAULT '1970-01-01 00:00:00'::timestamp, 
  ALTER COLUMN "height" SET DEFAULT 0,
  ALTER COLUMN "location" SET DEFAULT '{}',
  ALTER COLUMN "profile_url" SET DEFAULT '',
  ALTER COLUMN "role" SET DEFAULT 0;
