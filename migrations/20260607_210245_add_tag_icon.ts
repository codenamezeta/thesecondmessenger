import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DO $$ BEGIN
     CREATE TYPE "public"."enum_users_theme_preference" AS ENUM('dark', 'light', 'interstellar', 'kelly_come_home', 'nebula', 'distress');
   EXCEPTION WHEN duplicate_object THEN NULL;
   END $$;

   DO $$ BEGIN
     CREATE TYPE "public"."enum_site_settings_default_theme" AS ENUM('dark', 'light', 'interstellar', 'kelly_come_home', 'nebula', 'distress');
   EXCEPTION WHEN duplicate_object THEN NULL;
   END $$;

   CREATE TABLE IF NOT EXISTS "site_settings" (
   	"id" serial PRIMARY KEY NOT NULL,
   	"default_theme" "enum_site_settings_default_theme" DEFAULT 'dark' NOT NULL,
   	"updated_at" timestamp(3) with time zone,
   	"created_at" timestamp(3) with time zone
   );

   ALTER TABLE "songs" ALTER COLUMN "comment" SET DEFAULT 'Thank you for listening.';
   ALTER TABLE "_songs_v" ALTER COLUMN "version_comment" SET DEFAULT 'Thank you for listening.';
   ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "theme_preference" "enum_users_theme_preference";
   ALTER TABLE "songs_streaming_links" DROP COLUMN IF EXISTS "description";
   ALTER TABLE "_songs_v_version_streaming_links" DROP COLUMN IF EXISTS "description";`)

  // Platform enum expansion — only when the old enum is still in place.
  await db.execute(sql`
   DO $$ BEGIN
     IF EXISTS (
       SELECT 1 FROM pg_type t
       JOIN pg_enum e ON t.oid = e.enumtypid
       WHERE t.typname = 'enum_songs_streaming_links_platform'
         AND e.enumlabel = 'Other'
         AND NOT EXISTS (
           SELECT 1 FROM pg_enum e2
           WHERE e2.enumtypid = t.oid AND e2.enumlabel = 'Spotify'
         )
     ) THEN
       ALTER TABLE "songs_streaming_links" ALTER COLUMN "platform" SET DATA TYPE text;
       DROP TYPE "public"."enum_songs_streaming_links_platform";
       CREATE TYPE "public"."enum_songs_streaming_links_platform" AS ENUM('YouTube Music', 'Spotify', 'Tidal', 'Apple Music', 'Amazon Music', 'iHeartRadio', 'Deezer', 'Pandora', 'Qobuz', 'SoundCloud', 'Bandcamp', 'Other');
       ALTER TABLE "songs_streaming_links" ALTER COLUMN "platform" SET DATA TYPE "public"."enum_songs_streaming_links_platform" USING "platform"::"public"."enum_songs_streaming_links_platform";
     END IF;
   END $$;

   DO $$ BEGIN
     IF EXISTS (
       SELECT 1 FROM pg_type t
       JOIN pg_enum e ON t.oid = e.enumtypid
       WHERE t.typname = 'enum__songs_v_version_streaming_links_platform'
         AND e.enumlabel = 'Other'
         AND NOT EXISTS (
           SELECT 1 FROM pg_enum e2
           WHERE e2.enumtypid = t.oid AND e2.enumlabel = 'Spotify'
         )
     ) THEN
       ALTER TABLE "_songs_v_version_streaming_links" ALTER COLUMN "platform" SET DATA TYPE text;
       DROP TYPE "public"."enum__songs_v_version_streaming_links_platform";
       CREATE TYPE "public"."enum__songs_v_version_streaming_links_platform" AS ENUM('YouTube Music', 'Spotify', 'Tidal', 'Apple Music', 'Amazon Music', 'iHeartRadio', 'Deezer', 'Pandora', 'Qobuz', 'SoundCloud', 'Bandcamp', 'Other');
       ALTER TABLE "_songs_v_version_streaming_links" ALTER COLUMN "platform" SET DATA TYPE "public"."enum__songs_v_version_streaming_links_platform" USING "platform"::"public"."enum__songs_v_version_streaming_links_platform";
     END IF;
   END $$;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DISABLE ROW LEVEL SECURITY;
  DROP TABLE IF EXISTS "site_settings" CASCADE;
  ALTER TABLE "songs_streaming_links" ALTER COLUMN "platform" SET DATA TYPE text;
  DROP TYPE IF EXISTS "public"."enum_songs_streaming_links_platform";
  CREATE TYPE "public"."enum_songs_streaming_links_platform" AS ENUM('YouTube Music', 'Spotify', 'Apple Music', 'Amazon Music', 'Tidal', 'Qobuz', 'Deezer', 'Pandora', 'SoundCloud', 'Bandcamp', 'Other');
  ALTER TABLE "songs_streaming_links" ALTER COLUMN "platform" SET DATA TYPE "public"."enum_songs_streaming_links_platform" USING "platform"::"public"."enum_songs_streaming_links_platform";
  ALTER TABLE "_songs_v_version_streaming_links" ALTER COLUMN "platform" SET DATA TYPE text;
  DROP TYPE IF EXISTS "public"."enum__songs_v_version_streaming_links_platform";
  CREATE TYPE "public"."enum__songs_v_version_streaming_links_platform" AS ENUM('YouTube Music', 'Spotify', 'Apple Music', 'Amazon Music', 'Tidal', 'Qobuz', 'Deezer', 'Pandora', 'SoundCloud', 'Bandcamp', 'Other');
  ALTER TABLE "_songs_v_version_streaming_links" ALTER COLUMN "platform" SET DATA TYPE "public"."enum__songs_v_version_streaming_links_platform" USING "platform"::"public"."enum__songs_v_version_streaming_links_platform";
  ALTER TABLE "songs" ALTER COLUMN "comment" SET DEFAULT 'Thank you for being a fan';
  ALTER TABLE "_songs_v" ALTER COLUMN "version_comment" SET DEFAULT 'Thank you for being a fan';
  ALTER TABLE "songs_streaming_links" ADD COLUMN IF NOT EXISTS "description" varchar;
  ALTER TABLE "_songs_v_version_streaming_links" ADD COLUMN IF NOT EXISTS "description" varchar;
  ALTER TABLE "users" DROP COLUMN IF EXISTS "theme_preference";
  DROP TYPE IF EXISTS "public"."enum_users_theme_preference";
  DROP TYPE IF EXISTS "public"."enum_site_settings_default_theme";`)
}
