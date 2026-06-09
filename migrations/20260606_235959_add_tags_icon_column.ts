import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

/**
 * Adds the optional `tags.icon` editor field to the database.
 *
 * Kept separate from `20260607_210245_add_tag_icon` so environments that
 * already received the multitheme parts of that migration (via dev push or
 * an earlier deploy) can still pick up the icon column without re-running
 * the full batch.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DO $$ BEGIN
     CREATE TYPE "public"."enum_tags_icon" AS ENUM(
       'music', 'guitar', 'piano', 'drum', 'bass', 'mic', 'synth', 'headphones',
       'keyboard', 'speaker', 'waveform', 'sliders', 'volume', 'radio', 'disc',
       'cpu', 'activity', 'dumbbell', 'running', 'car', 'gamepad', 'book', 'code',
       'coffee', 'plane', 'party', 'zap', 'heart', 'heart-crack', 'rain', 'flame',
       'skull', 'sparkles', 'moon', 'sun', 'sunrise', 'globe', 'swords', 'users',
       'user', 'map-pin', 'gift', 'snowflake', 'trees', 'mountain', 'ghost', 'star',
       'history', 'crown', 'layers', 'branch', 'repeat', 'clock', 'rocket',
       'telescope', 'satellite', 'orbit', 'tag'
     );
   EXCEPTION
     WHEN duplicate_object THEN NULL;
   END $$;

   ALTER TABLE "tags" ADD COLUMN IF NOT EXISTS "icon" "enum_tags_icon";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "tags" DROP COLUMN IF EXISTS "icon";
   DROP TYPE IF EXISTS "public"."enum_tags_icon";`)
}
