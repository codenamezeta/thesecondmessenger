import {
  MigrateUpArgs,
  MigrateDownArgs,
  sql,
} from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "tags" ADD COLUMN "description" jsonb;
  ALTER TABLE "tags" ADD COLUMN "featured_image_id" integer;
  ALTER TABLE "tags" ADD CONSTRAINT "tags_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "tags_featured_image_idx" ON "tags" USING btree ("featured_image_id");`)
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "tags" DROP CONSTRAINT "tags_featured_image_id_media_id_fk";
  
  DROP INDEX "tags_featured_image_idx";
  ALTER TABLE "tags" DROP COLUMN "description";
  ALTER TABLE "tags" DROP COLUMN "featured_image_id";`)
}
