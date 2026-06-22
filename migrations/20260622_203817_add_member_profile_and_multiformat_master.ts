import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

/**
 * Profile fields (Users), multi-format masters + MusicBrainz IDs (Songs).
 *
 * Idempotent: dev `pnpm dev` may auto-push parts of this schema before
 * `pnpm migrate` runs, so CREATE TYPE / ADD COLUMN / constraints use the
 * same guard patterns as earlier migrations in this repo.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DO $$ BEGIN
     CREATE TYPE "public"."enum_users_gender" AS ENUM('female', 'male', 'non_binary', 'other', 'prefer_not_to_say');
   EXCEPTION WHEN duplicate_object THEN NULL;
   END $$;

   ALTER TABLE "songs" ADD COLUMN IF NOT EXISTS "master_audio_flac_id" integer;
   ALTER TABLE "songs" ADD COLUMN IF NOT EXISTS "master_audio_wav_id" integer;
   ALTER TABLE "songs" ADD COLUMN IF NOT EXISTS "music_brainz_recording_id" varchar;
   ALTER TABLE "songs" ADD COLUMN IF NOT EXISTS "music_brainz_track_id" varchar;
   ALTER TABLE "songs" ADD COLUMN IF NOT EXISTS "music_brainz_release_id" varchar;
   ALTER TABLE "songs" ADD COLUMN IF NOT EXISTS "music_brainz_release_group_id" varchar;
   ALTER TABLE "songs" ADD COLUMN IF NOT EXISTS "music_brainz_artist_id" varchar;
   ALTER TABLE "songs" ADD COLUMN IF NOT EXISTS "music_brainz_work_id" varchar;
   ALTER TABLE "_songs_v" ADD COLUMN IF NOT EXISTS "version_master_audio_flac_id" integer;
   ALTER TABLE "_songs_v" ADD COLUMN IF NOT EXISTS "version_master_audio_wav_id" integer;
   ALTER TABLE "_songs_v" ADD COLUMN IF NOT EXISTS "version_music_brainz_recording_id" varchar;
   ALTER TABLE "_songs_v" ADD COLUMN IF NOT EXISTS "version_music_brainz_track_id" varchar;
   ALTER TABLE "_songs_v" ADD COLUMN IF NOT EXISTS "version_music_brainz_release_id" varchar;
   ALTER TABLE "_songs_v" ADD COLUMN IF NOT EXISTS "version_music_brainz_release_group_id" varchar;
   ALTER TABLE "_songs_v" ADD COLUMN IF NOT EXISTS "version_music_brainz_artist_id" varchar;
   ALTER TABLE "_songs_v" ADD COLUMN IF NOT EXISTS "version_music_brainz_work_id" varchar;
   ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "favorite_song_id" integer;
   ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "birthdate" timestamp(3) with time zone;
   ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "gender" "enum_users_gender";
   ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notification_settings_newsletter" boolean DEFAULT true;
   ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notification_settings_product_updates" boolean DEFAULT true;
   ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notification_settings_account_activity" boolean DEFAULT true;

   DO $$ BEGIN
     ALTER TABLE "songs" ADD CONSTRAINT "songs_master_audio_flac_id_media_id_fk" FOREIGN KEY ("master_audio_flac_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
   EXCEPTION WHEN duplicate_object THEN NULL;
   END $$;

   DO $$ BEGIN
     ALTER TABLE "songs" ADD CONSTRAINT "songs_master_audio_wav_id_media_id_fk" FOREIGN KEY ("master_audio_wav_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
   EXCEPTION WHEN duplicate_object THEN NULL;
   END $$;

   DO $$ BEGIN
     ALTER TABLE "_songs_v" ADD CONSTRAINT "_songs_v_version_master_audio_flac_id_media_id_fk" FOREIGN KEY ("version_master_audio_flac_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
   EXCEPTION WHEN duplicate_object THEN NULL;
   END $$;

   DO $$ BEGIN
     ALTER TABLE "_songs_v" ADD CONSTRAINT "_songs_v_version_master_audio_wav_id_media_id_fk" FOREIGN KEY ("version_master_audio_wav_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
   EXCEPTION WHEN duplicate_object THEN NULL;
   END $$;

   DO $$ BEGIN
     ALTER TABLE "users" ADD CONSTRAINT "users_favorite_song_id_songs_id_fk" FOREIGN KEY ("favorite_song_id") REFERENCES "public"."songs"("id") ON DELETE set null ON UPDATE no action;
   EXCEPTION WHEN duplicate_object THEN NULL;
   END $$;

   CREATE INDEX IF NOT EXISTS "songs_master_audio_flac_idx" ON "songs" USING btree ("master_audio_flac_id");
   CREATE INDEX IF NOT EXISTS "songs_master_audio_wav_idx" ON "songs" USING btree ("master_audio_wav_id");
   CREATE INDEX IF NOT EXISTS "_songs_v_version_version_master_audio_flac_idx" ON "_songs_v" USING btree ("version_master_audio_flac_id");
   CREATE INDEX IF NOT EXISTS "_songs_v_version_version_master_audio_wav_idx" ON "_songs_v" USING btree ("version_master_audio_wav_id");
   CREATE INDEX IF NOT EXISTS "users_favorite_song_idx" ON "users" USING btree ("favorite_song_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "songs" DROP CONSTRAINT IF EXISTS "songs_master_audio_flac_id_media_id_fk";
   ALTER TABLE "songs" DROP CONSTRAINT IF EXISTS "songs_master_audio_wav_id_media_id_fk";
   ALTER TABLE "_songs_v" DROP CONSTRAINT IF EXISTS "_songs_v_version_master_audio_flac_id_media_id_fk";
   ALTER TABLE "_songs_v" DROP CONSTRAINT IF EXISTS "_songs_v_version_master_audio_wav_id_media_id_fk";
   ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_favorite_song_id_songs_id_fk";

   DROP INDEX IF EXISTS "songs_master_audio_flac_idx";
   DROP INDEX IF EXISTS "songs_master_audio_wav_idx";
   DROP INDEX IF EXISTS "_songs_v_version_version_master_audio_flac_idx";
   DROP INDEX IF EXISTS "_songs_v_version_version_master_audio_wav_idx";
   DROP INDEX IF EXISTS "users_favorite_song_idx";

   ALTER TABLE "songs" DROP COLUMN IF EXISTS "master_audio_flac_id";
   ALTER TABLE "songs" DROP COLUMN IF EXISTS "master_audio_wav_id";
   ALTER TABLE "songs" DROP COLUMN IF EXISTS "music_brainz_recording_id";
   ALTER TABLE "songs" DROP COLUMN IF EXISTS "music_brainz_track_id";
   ALTER TABLE "songs" DROP COLUMN IF EXISTS "music_brainz_release_id";
   ALTER TABLE "songs" DROP COLUMN IF EXISTS "music_brainz_release_group_id";
   ALTER TABLE "songs" DROP COLUMN IF EXISTS "music_brainz_artist_id";
   ALTER TABLE "songs" DROP COLUMN IF EXISTS "music_brainz_work_id";
   ALTER TABLE "_songs_v" DROP COLUMN IF EXISTS "version_master_audio_flac_id";
   ALTER TABLE "_songs_v" DROP COLUMN IF EXISTS "version_master_audio_wav_id";
   ALTER TABLE "_songs_v" DROP COLUMN IF EXISTS "version_music_brainz_recording_id";
   ALTER TABLE "_songs_v" DROP COLUMN IF EXISTS "version_music_brainz_track_id";
   ALTER TABLE "_songs_v" DROP COLUMN IF EXISTS "version_music_brainz_release_id";
   ALTER TABLE "_songs_v" DROP COLUMN IF EXISTS "version_music_brainz_release_group_id";
   ALTER TABLE "_songs_v" DROP COLUMN IF EXISTS "version_music_brainz_artist_id";
   ALTER TABLE "_songs_v" DROP COLUMN IF EXISTS "version_music_brainz_work_id";
   ALTER TABLE "users" DROP COLUMN IF EXISTS "favorite_song_id";
   ALTER TABLE "users" DROP COLUMN IF EXISTS "birthdate";
   ALTER TABLE "users" DROP COLUMN IF EXISTS "gender";
   ALTER TABLE "users" DROP COLUMN IF EXISTS "notification_settings_newsletter";
   ALTER TABLE "users" DROP COLUMN IF EXISTS "notification_settings_product_updates";
   ALTER TABLE "users" DROP COLUMN IF EXISTS "notification_settings_account_activity";

   DROP TYPE IF EXISTS "public"."enum_users_gender";`)
}
