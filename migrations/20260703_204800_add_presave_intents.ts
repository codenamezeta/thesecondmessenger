import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "presaves" ADD COLUMN IF NOT EXISTS "artist_followed_at" timestamptz;
    ALTER TABLE "presaves" ADD COLUMN IF NOT EXISTS "intent_status" jsonb;
    ALTER TABLE "presaves" ADD COLUMN IF NOT EXISTS "linked_user_id" integer;
  `)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "presaves"
        ADD CONSTRAINT "presaves_linked_user_id_users_id_fk"
        FOREIGN KEY ("linked_user_id") REFERENCES "users"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "presaves" DROP CONSTRAINT IF EXISTS "presaves_linked_user_id_users_id_fk";
    ALTER TABLE "presaves" DROP COLUMN IF EXISTS "linked_user_id";
    ALTER TABLE "presaves" DROP COLUMN IF EXISTS "intent_status";
    ALTER TABLE "presaves" DROP COLUMN IF EXISTS "artist_followed_at";
  `)
}
