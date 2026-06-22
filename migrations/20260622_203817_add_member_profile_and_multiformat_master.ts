import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_gender" AS ENUM('female', 'male', 'non_binary', 'other', 'prefer_not_to_say');
  ALTER TABLE "songs" ADD COLUMN "master_audio_flac_id" integer;
  ALTER TABLE "songs" ADD COLUMN "master_audio_wav_id" integer;
  ALTER TABLE "songs" ADD COLUMN "music_brainz_recording_id" varchar;
  ALTER TABLE "songs" ADD COLUMN "music_brainz_track_id" varchar;
  ALTER TABLE "songs" ADD COLUMN "music_brainz_release_id" varchar;
  ALTER TABLE "songs" ADD COLUMN "music_brainz_release_group_id" varchar;
  ALTER TABLE "songs" ADD COLUMN "music_brainz_artist_id" varchar;
  ALTER TABLE "songs" ADD COLUMN "music_brainz_work_id" varchar;
  ALTER TABLE "_songs_v" ADD COLUMN "version_master_audio_flac_id" integer;
  ALTER TABLE "_songs_v" ADD COLUMN "version_master_audio_wav_id" integer;
  ALTER TABLE "_songs_v" ADD COLUMN "version_music_brainz_recording_id" varchar;
  ALTER TABLE "_songs_v" ADD COLUMN "version_music_brainz_track_id" varchar;
  ALTER TABLE "_songs_v" ADD COLUMN "version_music_brainz_release_id" varchar;
  ALTER TABLE "_songs_v" ADD COLUMN "version_music_brainz_release_group_id" varchar;
  ALTER TABLE "_songs_v" ADD COLUMN "version_music_brainz_artist_id" varchar;
  ALTER TABLE "_songs_v" ADD COLUMN "version_music_brainz_work_id" varchar;
  ALTER TABLE "users" ADD COLUMN "favorite_song_id" integer;
  ALTER TABLE "users" ADD COLUMN "birthdate" timestamp(3) with time zone;
  ALTER TABLE "users" ADD COLUMN "gender" "enum_users_gender";
  ALTER TABLE "users" ADD COLUMN "notification_settings_newsletter" boolean DEFAULT true;
  ALTER TABLE "users" ADD COLUMN "notification_settings_product_updates" boolean DEFAULT true;
  ALTER TABLE "users" ADD COLUMN "notification_settings_account_activity" boolean DEFAULT true;
  ALTER TABLE "songs" ADD CONSTRAINT "songs_master_audio_flac_id_media_id_fk" FOREIGN KEY ("master_audio_flac_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "songs" ADD CONSTRAINT "songs_master_audio_wav_id_media_id_fk" FOREIGN KEY ("master_audio_wav_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_songs_v" ADD CONSTRAINT "_songs_v_version_master_audio_flac_id_media_id_fk" FOREIGN KEY ("version_master_audio_flac_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_songs_v" ADD CONSTRAINT "_songs_v_version_master_audio_wav_id_media_id_fk" FOREIGN KEY ("version_master_audio_wav_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_favorite_song_id_songs_id_fk" FOREIGN KEY ("favorite_song_id") REFERENCES "public"."songs"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "songs_master_audio_flac_idx" ON "songs" USING btree ("master_audio_flac_id");
  CREATE INDEX "songs_master_audio_wav_idx" ON "songs" USING btree ("master_audio_wav_id");
  CREATE INDEX "_songs_v_version_version_master_audio_flac_idx" ON "_songs_v" USING btree ("version_master_audio_flac_id");
  CREATE INDEX "_songs_v_version_version_master_audio_wav_idx" ON "_songs_v" USING btree ("version_master_audio_wav_id");
  CREATE INDEX "users_favorite_song_idx" ON "users" USING btree ("favorite_song_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "songs" DROP CONSTRAINT "songs_master_audio_flac_id_media_id_fk";
  
  ALTER TABLE "songs" DROP CONSTRAINT "songs_master_audio_wav_id_media_id_fk";
  
  ALTER TABLE "_songs_v" DROP CONSTRAINT "_songs_v_version_master_audio_flac_id_media_id_fk";
  
  ALTER TABLE "_songs_v" DROP CONSTRAINT "_songs_v_version_master_audio_wav_id_media_id_fk";
  
  ALTER TABLE "users" DROP CONSTRAINT "users_favorite_song_id_songs_id_fk";
  
  DROP INDEX "songs_master_audio_flac_idx";
  DROP INDEX "songs_master_audio_wav_idx";
  DROP INDEX "_songs_v_version_version_master_audio_flac_idx";
  DROP INDEX "_songs_v_version_version_master_audio_wav_idx";
  DROP INDEX "users_favorite_song_idx";
  ALTER TABLE "songs" DROP COLUMN "master_audio_flac_id";
  ALTER TABLE "songs" DROP COLUMN "master_audio_wav_id";
  ALTER TABLE "songs" DROP COLUMN "music_brainz_recording_id";
  ALTER TABLE "songs" DROP COLUMN "music_brainz_track_id";
  ALTER TABLE "songs" DROP COLUMN "music_brainz_release_id";
  ALTER TABLE "songs" DROP COLUMN "music_brainz_release_group_id";
  ALTER TABLE "songs" DROP COLUMN "music_brainz_artist_id";
  ALTER TABLE "songs" DROP COLUMN "music_brainz_work_id";
  ALTER TABLE "_songs_v" DROP COLUMN "version_master_audio_flac_id";
  ALTER TABLE "_songs_v" DROP COLUMN "version_master_audio_wav_id";
  ALTER TABLE "_songs_v" DROP COLUMN "version_music_brainz_recording_id";
  ALTER TABLE "_songs_v" DROP COLUMN "version_music_brainz_track_id";
  ALTER TABLE "_songs_v" DROP COLUMN "version_music_brainz_release_id";
  ALTER TABLE "_songs_v" DROP COLUMN "version_music_brainz_release_group_id";
  ALTER TABLE "_songs_v" DROP COLUMN "version_music_brainz_artist_id";
  ALTER TABLE "_songs_v" DROP COLUMN "version_music_brainz_work_id";
  ALTER TABLE "users" DROP COLUMN "favorite_song_id";
  ALTER TABLE "users" DROP COLUMN "birthdate";
  ALTER TABLE "users" DROP COLUMN "gender";
  ALTER TABLE "users" DROP COLUMN "notification_settings_newsletter";
  ALTER TABLE "users" DROP COLUMN "notification_settings_product_updates";
  ALTER TABLE "users" DROP COLUMN "notification_settings_account_activity";
  DROP TYPE "public"."enum_users_gender";`)
}
