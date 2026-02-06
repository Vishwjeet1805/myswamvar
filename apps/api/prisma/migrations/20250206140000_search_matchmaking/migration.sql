-- AlterTable: add religion to profiles
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "religion" TEXT;

-- CreateEnum
CREATE TYPE "InterestStatus" AS ENUM ('pending', 'accepted', 'declined');

-- CreateTable: shortlists
CREATE TABLE "shortlists" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shortlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable: interests
CREATE TABLE "interests" (
    "id" TEXT NOT NULL,
    "from_user_id" TEXT NOT NULL,
    "to_user_id" TEXT NOT NULL,
    "status" "InterestStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interests_pkey" PRIMARY KEY ("id")
);

-- CreateTable: saved_searches
CREATE TABLE "saved_searches" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "filters" JSONB NOT NULL,
    "notify" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_searches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: profiles for search
CREATE INDEX "profiles_gender_idx" ON "profiles"("gender");
CREATE INDEX "profiles_dob_idx" ON "profiles"("dob");
CREATE INDEX "profiles_education_idx" ON "profiles"("education");
CREATE INDEX "profiles_occupation_idx" ON "profiles"("occupation");
CREATE INDEX "profiles_religion_idx" ON "profiles"("religion");

-- CreateIndex: shortlists
CREATE UNIQUE INDEX "shortlists_user_id_profile_id_key" ON "shortlists"("user_id", "profile_id");
CREATE INDEX "shortlists_user_id_idx" ON "shortlists"("user_id");

-- CreateIndex: interests
CREATE UNIQUE INDEX "interests_from_user_id_to_user_id_key" ON "interests"("from_user_id", "to_user_id");
CREATE INDEX "interests_from_user_id_idx" ON "interests"("from_user_id");
CREATE INDEX "interests_to_user_id_idx" ON "interests"("to_user_id");

-- CreateIndex: saved_searches
CREATE INDEX "saved_searches_user_id_idx" ON "saved_searches"("user_id");

-- AddForeignKey: shortlists
ALTER TABLE "shortlists" ADD CONSTRAINT "shortlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shortlists" ADD CONSTRAINT "shortlists_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: interests
ALTER TABLE "interests" ADD CONSTRAINT "interests_from_user_id_fkey" FOREIGN KEY ("from_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "interests" ADD CONSTRAINT "interests_to_user_id_fkey" FOREIGN KEY ("to_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: saved_searches
ALTER TABLE "saved_searches" ADD CONSTRAINT "saved_searches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
