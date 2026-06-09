import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "songs" ADD COLUMN "catalog_sequence" numeric;
  ALTER TABLE "_songs_v" ADD COLUMN "version_catalog_sequence" numeric;
  CREATE INDEX "songs_catalog_sequence_idx" ON "songs" USING btree ("catalog_sequence");
  CREATE INDEX "_songs_v_version_version_catalog_sequence_idx" ON "_songs_v" USING btree ("version_catalog_sequence");`)

  // Backfill: rank each song within its composition type by release date
  // (oldest = 1), matching the runtime hook in lib/songs/catalogNumbers.ts.
  await db.execute(sql`
   UPDATE "songs" AS s
   SET "catalog_sequence" = r.seq
   FROM (
     SELECT
       "id",
       ROW_NUMBER() OVER (
         PARTITION BY "composition_type"
         ORDER BY "release_date" ASC NULLS LAST, "id" ASC
       ) AS seq
     FROM "songs"
   ) AS r
   WHERE s."id" = r."id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "songs_catalog_sequence_idx";
  DROP INDEX "_songs_v_version_version_catalog_sequence_idx";
  ALTER TABLE "songs" DROP COLUMN "catalog_sequence";
  ALTER TABLE "_songs_v" DROP COLUMN "version_catalog_sequence";`)
}
