import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

/**
 * Adds Playlists.displayOrder for player library sort order.
 *
 * Kept minimal on purpose: `migrate:create` also emitted tags.icon DDL that
 * already exists on dev (via push or 20260606_235959_add_tags_icon_column).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "playlists" ADD COLUMN IF NOT EXISTS "display_order" numeric DEFAULT 100;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "playlists" DROP COLUMN IF EXISTS "display_order";`)
}
