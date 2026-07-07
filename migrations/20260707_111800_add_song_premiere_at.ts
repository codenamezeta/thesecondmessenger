import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "songs" ADD COLUMN IF NOT EXISTS "premiere_at" timestamptz;
    ALTER TABLE "_songs_v" ADD COLUMN IF NOT EXISTS "version_premiere_at" timestamptz;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "_songs_v" DROP COLUMN IF EXISTS "version_premiere_at";
    ALTER TABLE "songs" DROP COLUMN IF EXISTS "premiere_at";
  `)
}
