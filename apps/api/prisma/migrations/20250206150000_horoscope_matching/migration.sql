-- AlterTable
ALTER TABLE "profiles" ADD COLUMN "time_of_birth" TEXT,
ADD COLUMN "place_of_birth" TEXT,
ADD COLUMN "birth_lat_long" JSONB;

-- CreateTable
CREATE TABLE "horoscope_matches" (
    "id" TEXT NOT NULL,
    "profile_a_id" TEXT NOT NULL,
    "profile_b_id" TEXT NOT NULL,
    "match_percent" DOUBLE PRECISION NOT NULL,
    "dosha_result" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "horoscope_matches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "horoscope_matches_profile_a_id_profile_b_id_key" ON "horoscope_matches"("profile_a_id", "profile_b_id");

-- CreateIndex
CREATE INDEX "horoscope_matches_profile_a_id_idx" ON "horoscope_matches"("profile_a_id");

-- CreateIndex
CREATE INDEX "horoscope_matches_profile_b_id_idx" ON "horoscope_matches"("profile_b_id");

-- AddForeignKey
ALTER TABLE "horoscope_matches" ADD CONSTRAINT "horoscope_matches_profile_a_id_fkey" FOREIGN KEY ("profile_a_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horoscope_matches" ADD CONSTRAINT "horoscope_matches_profile_b_id_fkey" FOREIGN KEY ("profile_b_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
