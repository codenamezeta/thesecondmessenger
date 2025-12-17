import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_songs_genres" AS ENUM('Pop-Punk', 'Rock', 'Electronic', 'Acoustic', 'Pop', 'Dance', 'Hard Rock', 'Metal', 'Other');
  CREATE TYPE "public"."enum_songs_moods" AS ENUM('High Energy', 'Melancholic', 'Cinematic', 'Aggressive', 'Sad');
  CREATE TYPE "public"."enum_songs_credits_category" AS ENUM('Songwriter', 'Performer', 'Producer/Engineer', 'Visuals', 'Special Thanks');
  CREATE TYPE "public"."enum_songs_bonus_content_type" AS ENUM('Alternate Audio', 'Video', 'Artwork', 'Document', 'Other');
  CREATE TYPE "public"."enum_songs_bonus_content_access_level" AS ENUM('Public', 'Press Only', 'Private');
  CREATE TYPE "public"."enum_songs_composition_type" AS ENUM('Original', 'Cover', 'Public Domain');
  CREATE TYPE "public"."enum_songs_recording_type" AS ENUM('Studio', 'Live', 'Demo');
  CREATE TYPE "public"."enum_songs_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__songs_v_version_genres" AS ENUM('Pop-Punk', 'Rock', 'Electronic', 'Acoustic', 'Pop', 'Dance', 'Hard Rock', 'Metal', 'Other');
  CREATE TYPE "public"."enum__songs_v_version_moods" AS ENUM('High Energy', 'Melancholic', 'Cinematic', 'Aggressive', 'Sad');
  CREATE TYPE "public"."enum__songs_v_version_credits_category" AS ENUM('Songwriter', 'Performer', 'Producer/Engineer', 'Visuals', 'Special Thanks');
  CREATE TYPE "public"."enum__songs_v_version_bonus_content_type" AS ENUM('Alternate Audio', 'Video', 'Artwork', 'Document', 'Other');
  CREATE TYPE "public"."enum__songs_v_version_bonus_content_access_level" AS ENUM('Public', 'Press Only', 'Private');
  CREATE TYPE "public"."enum__songs_v_version_composition_type" AS ENUM('Original', 'Cover', 'Public Domain');
  CREATE TYPE "public"."enum__songs_v_version_recording_type" AS ENUM('Studio', 'Live', 'Demo');
  CREATE TYPE "public"."enum__songs_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_releases_type" AS ENUM('Single', 'EP', 'Album', 'YouTube Drop');
  CREATE TYPE "public"."enum_releases_distribution" AS ENUM('Official (CDBaby)', 'Casual (YouTube/SoundCloud)');
  CREATE TABLE "songs_stems" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"stem_name" varchar,
  	"audio_file_id" integer,
  	"volume" numeric DEFAULT 0.8
  );
  
  CREATE TABLE "songs_genres" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_songs_genres",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "songs_moods" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_songs_moods",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "songs_credits_roles" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"role" varchar
  );
  
  CREATE TABLE "songs_credits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"category" "enum_songs_credits_category"
  );
  
  CREATE TABLE "songs_bonus_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_songs_bonus_content_type",
  	"label" varchar,
  	"file_id" integer,
  	"access_level" "enum_songs_bonus_content_access_level" DEFAULT 'Public'
  );
  
  CREATE TABLE "songs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"youtube_id" varchar,
  	"master_audio_id" integer,
  	"caption" varchar,
  	"isrc" varchar,
  	"iswc" varchar,
  	"is_dynamic" boolean DEFAULT false,
  	"bpm" numeric,
  	"bpm_end" numeric,
  	"key" varchar,
  	"key_end" varchar,
  	"composition_type" "enum_songs_composition_type" DEFAULT 'Original',
  	"recording_type" "enum_songs_recording_type" DEFAULT 'Studio',
  	"is_explicit" boolean,
  	"liner_notes" jsonb,
  	"lyrics" varchar,
  	"download_permissions_allow_master_download" boolean DEFAULT false,
  	"download_permissions_allow_stem_download" boolean DEFAULT false,
  	"download_permissions_requires_email" boolean DEFAULT true,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_songs_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_songs_v_version_stems" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"stem_name" varchar,
  	"audio_file_id" integer,
  	"volume" numeric DEFAULT 0.8,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_songs_v_version_genres" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__songs_v_version_genres",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_songs_v_version_moods" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__songs_v_version_moods",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_songs_v_version_credits_roles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_songs_v_version_credits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"category" "enum__songs_v_version_credits_category",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_songs_v_version_bonus_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum__songs_v_version_bonus_content_type",
  	"label" varchar,
  	"file_id" integer,
  	"access_level" "enum__songs_v_version_bonus_content_access_level" DEFAULT 'Public',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_songs_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_youtube_id" varchar,
  	"version_master_audio_id" integer,
  	"version_caption" varchar,
  	"version_isrc" varchar,
  	"version_iswc" varchar,
  	"version_is_dynamic" boolean DEFAULT false,
  	"version_bpm" numeric,
  	"version_bpm_end" numeric,
  	"version_key" varchar,
  	"version_key_end" varchar,
  	"version_composition_type" "enum__songs_v_version_composition_type" DEFAULT 'Original',
  	"version_recording_type" "enum__songs_v_version_recording_type" DEFAULT 'Studio',
  	"version_is_explicit" boolean,
  	"version_liner_notes" jsonb,
  	"version_lyrics" varchar,
  	"version_download_permissions_allow_master_download" boolean DEFAULT false,
  	"version_download_permissions_allow_stem_download" boolean DEFAULT false,
  	"version_download_permissions_requires_email" boolean DEFAULT true,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__songs_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "releases" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"type" "enum_releases_type" NOT NULL,
  	"distribution" "enum_releases_distribution" DEFAULT 'Official (CDBaby)',
  	"release_date" timestamp(3) with time zone NOT NULL,
  	"upc" varchar,
  	"cover_art_id" integer NOT NULL,
  	"meta_description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "releases_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"songs_id" integer
  );
  
  CREATE TABLE "playlists" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"description" varchar,
  	"cover_art_id" integer,
  	"is_featured" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "playlists_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"songs_id" integer
  );
  
  ALTER TABLE "media" ADD COLUMN "prefix" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "songs_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "releases_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "playlists_id" integer;
  ALTER TABLE "songs_stems" ADD CONSTRAINT "songs_stems_audio_file_id_media_id_fk" FOREIGN KEY ("audio_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "songs_stems" ADD CONSTRAINT "songs_stems_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."songs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "songs_genres" ADD CONSTRAINT "songs_genres_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."songs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "songs_moods" ADD CONSTRAINT "songs_moods_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."songs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "songs_credits_roles" ADD CONSTRAINT "songs_credits_roles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."songs_credits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "songs_credits" ADD CONSTRAINT "songs_credits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."songs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "songs_bonus_content" ADD CONSTRAINT "songs_bonus_content_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "songs_bonus_content" ADD CONSTRAINT "songs_bonus_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."songs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "songs" ADD CONSTRAINT "songs_master_audio_id_media_id_fk" FOREIGN KEY ("master_audio_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "songs" ADD CONSTRAINT "songs_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_songs_v_version_stems" ADD CONSTRAINT "_songs_v_version_stems_audio_file_id_media_id_fk" FOREIGN KEY ("audio_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_songs_v_version_stems" ADD CONSTRAINT "_songs_v_version_stems_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_songs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_songs_v_version_genres" ADD CONSTRAINT "_songs_v_version_genres_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_songs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_songs_v_version_moods" ADD CONSTRAINT "_songs_v_version_moods_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_songs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_songs_v_version_credits_roles" ADD CONSTRAINT "_songs_v_version_credits_roles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_songs_v_version_credits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_songs_v_version_credits" ADD CONSTRAINT "_songs_v_version_credits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_songs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_songs_v_version_bonus_content" ADD CONSTRAINT "_songs_v_version_bonus_content_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_songs_v_version_bonus_content" ADD CONSTRAINT "_songs_v_version_bonus_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_songs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_songs_v" ADD CONSTRAINT "_songs_v_parent_id_songs_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."songs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_songs_v" ADD CONSTRAINT "_songs_v_version_master_audio_id_media_id_fk" FOREIGN KEY ("version_master_audio_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_songs_v" ADD CONSTRAINT "_songs_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "releases" ADD CONSTRAINT "releases_cover_art_id_media_id_fk" FOREIGN KEY ("cover_art_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "releases_rels" ADD CONSTRAINT "releases_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."releases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "releases_rels" ADD CONSTRAINT "releases_rels_songs_fk" FOREIGN KEY ("songs_id") REFERENCES "public"."songs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "playlists" ADD CONSTRAINT "playlists_cover_art_id_media_id_fk" FOREIGN KEY ("cover_art_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "playlists_rels" ADD CONSTRAINT "playlists_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."playlists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "playlists_rels" ADD CONSTRAINT "playlists_rels_songs_fk" FOREIGN KEY ("songs_id") REFERENCES "public"."songs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "songs_stems_order_idx" ON "songs_stems" USING btree ("_order");
  CREATE INDEX "songs_stems_parent_id_idx" ON "songs_stems" USING btree ("_parent_id");
  CREATE INDEX "songs_stems_audio_file_idx" ON "songs_stems" USING btree ("audio_file_id");
  CREATE INDEX "songs_genres_order_idx" ON "songs_genres" USING btree ("order");
  CREATE INDEX "songs_genres_parent_idx" ON "songs_genres" USING btree ("parent_id");
  CREATE INDEX "songs_moods_order_idx" ON "songs_moods" USING btree ("order");
  CREATE INDEX "songs_moods_parent_idx" ON "songs_moods" USING btree ("parent_id");
  CREATE INDEX "songs_credits_roles_order_idx" ON "songs_credits_roles" USING btree ("_order");
  CREATE INDEX "songs_credits_roles_parent_id_idx" ON "songs_credits_roles" USING btree ("_parent_id");
  CREATE INDEX "songs_credits_order_idx" ON "songs_credits" USING btree ("_order");
  CREATE INDEX "songs_credits_parent_id_idx" ON "songs_credits" USING btree ("_parent_id");
  CREATE INDEX "songs_bonus_content_order_idx" ON "songs_bonus_content" USING btree ("_order");
  CREATE INDEX "songs_bonus_content_parent_id_idx" ON "songs_bonus_content" USING btree ("_parent_id");
  CREATE INDEX "songs_bonus_content_file_idx" ON "songs_bonus_content" USING btree ("file_id");
  CREATE UNIQUE INDEX "songs_youtube_id_idx" ON "songs" USING btree ("youtube_id");
  CREATE INDEX "songs_master_audio_idx" ON "songs" USING btree ("master_audio_id");
  CREATE INDEX "songs_meta_image_idx" ON "songs" USING btree ("meta_image_id");
  CREATE INDEX "songs_updated_at_idx" ON "songs" USING btree ("updated_at");
  CREATE INDEX "songs_created_at_idx" ON "songs" USING btree ("created_at");
  CREATE INDEX "songs__status_idx" ON "songs" USING btree ("_status");
  CREATE INDEX "_songs_v_version_stems_order_idx" ON "_songs_v_version_stems" USING btree ("_order");
  CREATE INDEX "_songs_v_version_stems_parent_id_idx" ON "_songs_v_version_stems" USING btree ("_parent_id");
  CREATE INDEX "_songs_v_version_stems_audio_file_idx" ON "_songs_v_version_stems" USING btree ("audio_file_id");
  CREATE INDEX "_songs_v_version_genres_order_idx" ON "_songs_v_version_genres" USING btree ("order");
  CREATE INDEX "_songs_v_version_genres_parent_idx" ON "_songs_v_version_genres" USING btree ("parent_id");
  CREATE INDEX "_songs_v_version_moods_order_idx" ON "_songs_v_version_moods" USING btree ("order");
  CREATE INDEX "_songs_v_version_moods_parent_idx" ON "_songs_v_version_moods" USING btree ("parent_id");
  CREATE INDEX "_songs_v_version_credits_roles_order_idx" ON "_songs_v_version_credits_roles" USING btree ("_order");
  CREATE INDEX "_songs_v_version_credits_roles_parent_id_idx" ON "_songs_v_version_credits_roles" USING btree ("_parent_id");
  CREATE INDEX "_songs_v_version_credits_order_idx" ON "_songs_v_version_credits" USING btree ("_order");
  CREATE INDEX "_songs_v_version_credits_parent_id_idx" ON "_songs_v_version_credits" USING btree ("_parent_id");
  CREATE INDEX "_songs_v_version_bonus_content_order_idx" ON "_songs_v_version_bonus_content" USING btree ("_order");
  CREATE INDEX "_songs_v_version_bonus_content_parent_id_idx" ON "_songs_v_version_bonus_content" USING btree ("_parent_id");
  CREATE INDEX "_songs_v_version_bonus_content_file_idx" ON "_songs_v_version_bonus_content" USING btree ("file_id");
  CREATE INDEX "_songs_v_parent_idx" ON "_songs_v" USING btree ("parent_id");
  CREATE INDEX "_songs_v_version_version_youtube_id_idx" ON "_songs_v" USING btree ("version_youtube_id");
  CREATE INDEX "_songs_v_version_version_master_audio_idx" ON "_songs_v" USING btree ("version_master_audio_id");
  CREATE INDEX "_songs_v_version_version_meta_image_idx" ON "_songs_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_songs_v_version_version_updated_at_idx" ON "_songs_v" USING btree ("version_updated_at");
  CREATE INDEX "_songs_v_version_version_created_at_idx" ON "_songs_v" USING btree ("version_created_at");
  CREATE INDEX "_songs_v_version_version__status_idx" ON "_songs_v" USING btree ("version__status");
  CREATE INDEX "_songs_v_created_at_idx" ON "_songs_v" USING btree ("created_at");
  CREATE INDEX "_songs_v_updated_at_idx" ON "_songs_v" USING btree ("updated_at");
  CREATE INDEX "_songs_v_latest_idx" ON "_songs_v" USING btree ("latest");
  CREATE INDEX "releases_cover_art_idx" ON "releases" USING btree ("cover_art_id");
  CREATE INDEX "releases_updated_at_idx" ON "releases" USING btree ("updated_at");
  CREATE INDEX "releases_created_at_idx" ON "releases" USING btree ("created_at");
  CREATE INDEX "releases_rels_order_idx" ON "releases_rels" USING btree ("order");
  CREATE INDEX "releases_rels_parent_idx" ON "releases_rels" USING btree ("parent_id");
  CREATE INDEX "releases_rels_path_idx" ON "releases_rels" USING btree ("path");
  CREATE INDEX "releases_rels_songs_id_idx" ON "releases_rels" USING btree ("songs_id");
  CREATE INDEX "playlists_cover_art_idx" ON "playlists" USING btree ("cover_art_id");
  CREATE INDEX "playlists_updated_at_idx" ON "playlists" USING btree ("updated_at");
  CREATE INDEX "playlists_created_at_idx" ON "playlists" USING btree ("created_at");
  CREATE INDEX "playlists_rels_order_idx" ON "playlists_rels" USING btree ("order");
  CREATE INDEX "playlists_rels_parent_idx" ON "playlists_rels" USING btree ("parent_id");
  CREATE INDEX "playlists_rels_path_idx" ON "playlists_rels" USING btree ("path");
  CREATE INDEX "playlists_rels_songs_id_idx" ON "playlists_rels" USING btree ("songs_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_songs_fk" FOREIGN KEY ("songs_id") REFERENCES "public"."songs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_releases_fk" FOREIGN KEY ("releases_id") REFERENCES "public"."releases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_playlists_fk" FOREIGN KEY ("playlists_id") REFERENCES "public"."playlists"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_songs_id_idx" ON "payload_locked_documents_rels" USING btree ("songs_id");
  CREATE INDEX "payload_locked_documents_rels_releases_id_idx" ON "payload_locked_documents_rels" USING btree ("releases_id");
  CREATE INDEX "payload_locked_documents_rels_playlists_id_idx" ON "payload_locked_documents_rels" USING btree ("playlists_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "songs_stems" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "songs_genres" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "songs_moods" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "songs_credits_roles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "songs_credits" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "songs_bonus_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "songs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_songs_v_version_stems" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_songs_v_version_genres" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_songs_v_version_moods" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_songs_v_version_credits_roles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_songs_v_version_credits" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_songs_v_version_bonus_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_songs_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "releases" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "releases_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "playlists" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "playlists_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "songs_stems" CASCADE;
  DROP TABLE "songs_genres" CASCADE;
  DROP TABLE "songs_moods" CASCADE;
  DROP TABLE "songs_credits_roles" CASCADE;
  DROP TABLE "songs_credits" CASCADE;
  DROP TABLE "songs_bonus_content" CASCADE;
  DROP TABLE "songs" CASCADE;
  DROP TABLE "_songs_v_version_stems" CASCADE;
  DROP TABLE "_songs_v_version_genres" CASCADE;
  DROP TABLE "_songs_v_version_moods" CASCADE;
  DROP TABLE "_songs_v_version_credits_roles" CASCADE;
  DROP TABLE "_songs_v_version_credits" CASCADE;
  DROP TABLE "_songs_v_version_bonus_content" CASCADE;
  DROP TABLE "_songs_v" CASCADE;
  DROP TABLE "releases" CASCADE;
  DROP TABLE "releases_rels" CASCADE;
  DROP TABLE "playlists" CASCADE;
  DROP TABLE "playlists_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_songs_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_releases_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_playlists_fk";
  
  DROP INDEX "payload_locked_documents_rels_songs_id_idx";
  DROP INDEX "payload_locked_documents_rels_releases_id_idx";
  DROP INDEX "payload_locked_documents_rels_playlists_id_idx";
  ALTER TABLE "media" DROP COLUMN "prefix";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "songs_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "releases_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "playlists_id";
  DROP TYPE "public"."enum_songs_genres";
  DROP TYPE "public"."enum_songs_moods";
  DROP TYPE "public"."enum_songs_credits_category";
  DROP TYPE "public"."enum_songs_bonus_content_type";
  DROP TYPE "public"."enum_songs_bonus_content_access_level";
  DROP TYPE "public"."enum_songs_composition_type";
  DROP TYPE "public"."enum_songs_recording_type";
  DROP TYPE "public"."enum_songs_status";
  DROP TYPE "public"."enum__songs_v_version_genres";
  DROP TYPE "public"."enum__songs_v_version_moods";
  DROP TYPE "public"."enum__songs_v_version_credits_category";
  DROP TYPE "public"."enum__songs_v_version_bonus_content_type";
  DROP TYPE "public"."enum__songs_v_version_bonus_content_access_level";
  DROP TYPE "public"."enum__songs_v_version_composition_type";
  DROP TYPE "public"."enum__songs_v_version_recording_type";
  DROP TYPE "public"."enum__songs_v_version_status";
  DROP TYPE "public"."enum_releases_type";
  DROP TYPE "public"."enum_releases_distribution";`)
}
