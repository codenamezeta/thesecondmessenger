import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_tags_icon" AS ENUM('music', 'guitar', 'piano', 'drum', 'bass', 'mic', 'synth', 'headphones', 'keyboard', 'speaker', 'waveform', 'sliders', 'volume', 'radio', 'disc', 'cpu', 'activity', 'dumbbell', 'running', 'car', 'gamepad', 'book', 'code', 'coffee', 'plane', 'party', 'zap', 'heart', 'heart-crack', 'rain', 'flame', 'skull', 'sparkles', 'moon', 'sun', 'sunrise', 'globe', 'swords', 'users', 'user', 'map-pin', 'gift', 'snowflake', 'trees', 'mountain', 'ghost', 'star', 'history', 'crown', 'layers', 'branch', 'repeat', 'clock', 'rocket', 'telescope', 'satellite', 'orbit', 'tag');
  CREATE TYPE "public"."enum_users_theme_preference" AS ENUM('dark', 'light', 'interstellar', 'kelly_come_home', 'nebula', 'distress');
  CREATE TYPE "public"."enum_site_settings_default_theme" AS ENUM('dark', 'light', 'interstellar', 'kelly_come_home', 'nebula', 'distress');
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"default_theme" "enum_site_settings_default_theme" DEFAULT 'dark' NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "songs_streaming_links" ALTER COLUMN "platform" SET DATA TYPE text;
  DROP TYPE "public"."enum_songs_streaming_links_platform";
  CREATE TYPE "public"."enum_songs_streaming_links_platform" AS ENUM('YouTube Music', 'Spotify', 'Tidal', 'Apple Music', 'Amazon Music', 'iHeartRadio', 'Deezer', 'Pandora', 'Qobuz', 'SoundCloud', 'Bandcamp', 'Other');
  ALTER TABLE "songs_streaming_links" ALTER COLUMN "platform" SET DATA TYPE "public"."enum_songs_streaming_links_platform" USING "platform"::"public"."enum_songs_streaming_links_platform";
  ALTER TABLE "_songs_v_version_streaming_links" ALTER COLUMN "platform" SET DATA TYPE text;
  DROP TYPE "public"."enum__songs_v_version_streaming_links_platform";
  CREATE TYPE "public"."enum__songs_v_version_streaming_links_platform" AS ENUM('YouTube Music', 'Spotify', 'Tidal', 'Apple Music', 'Amazon Music', 'iHeartRadio', 'Deezer', 'Pandora', 'Qobuz', 'SoundCloud', 'Bandcamp', 'Other');
  ALTER TABLE "_songs_v_version_streaming_links" ALTER COLUMN "platform" SET DATA TYPE "public"."enum__songs_v_version_streaming_links_platform" USING "platform"::"public"."enum__songs_v_version_streaming_links_platform";
  ALTER TABLE "songs" ALTER COLUMN "comment" SET DEFAULT 'Thank you for listening.';
  ALTER TABLE "_songs_v" ALTER COLUMN "version_comment" SET DEFAULT 'Thank you for listening.';
  ALTER TABLE "tags" ADD COLUMN "icon" "enum_tags_icon";
  ALTER TABLE "users" ADD COLUMN "theme_preference" "enum_users_theme_preference";
  ALTER TABLE "songs_streaming_links" DROP COLUMN "description";
  ALTER TABLE "_songs_v_version_streaming_links" DROP COLUMN "description";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "site_settings" CASCADE;
  ALTER TABLE "songs_streaming_links" ALTER COLUMN "platform" SET DATA TYPE text;
  DROP TYPE "public"."enum_songs_streaming_links_platform";
  CREATE TYPE "public"."enum_songs_streaming_links_platform" AS ENUM('YouTube Music', 'Spotify', 'Apple Music', 'Amazon Music', 'Tidal', 'Qobuz', 'Deezer', 'Pandora', 'SoundCloud', 'Bandcamp', 'Other');
  ALTER TABLE "songs_streaming_links" ALTER COLUMN "platform" SET DATA TYPE "public"."enum_songs_streaming_links_platform" USING "platform"::"public"."enum_songs_streaming_links_platform";
  ALTER TABLE "_songs_v_version_streaming_links" ALTER COLUMN "platform" SET DATA TYPE text;
  DROP TYPE "public"."enum__songs_v_version_streaming_links_platform";
  CREATE TYPE "public"."enum__songs_v_version_streaming_links_platform" AS ENUM('YouTube Music', 'Spotify', 'Apple Music', 'Amazon Music', 'Tidal', 'Qobuz', 'Deezer', 'Pandora', 'SoundCloud', 'Bandcamp', 'Other');
  ALTER TABLE "_songs_v_version_streaming_links" ALTER COLUMN "platform" SET DATA TYPE "public"."enum__songs_v_version_streaming_links_platform" USING "platform"::"public"."enum__songs_v_version_streaming_links_platform";
  ALTER TABLE "songs" ALTER COLUMN "comment" SET DEFAULT 'Thank you for being a fan';
  ALTER TABLE "_songs_v" ALTER COLUMN "version_comment" SET DEFAULT 'Thank you for being a fan';
  ALTER TABLE "songs_streaming_links" ADD COLUMN "description" varchar;
  ALTER TABLE "_songs_v_version_streaming_links" ADD COLUMN "description" varchar;
  ALTER TABLE "tags" DROP COLUMN "icon";
  ALTER TABLE "users" DROP COLUMN "theme_preference";
  DROP TYPE "public"."enum_tags_icon";
  DROP TYPE "public"."enum_users_theme_preference";
  DROP TYPE "public"."enum_site_settings_default_theme";`)
}
