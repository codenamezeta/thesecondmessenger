# Storage migration: Vercel Blob → Cloudflare R2

**Date:** June 2026  
**Goal:** Retire Vercel Blob for public `media`, serve optimized derivatives, and move lossless masters / stems into the Vault (`gated-content`).

---

## Bucket layout (recommended)

R2 **buckets cannot be renamed** — create a new bucket and update `R2_BUCKET`. Inside each bucket, **prefix folders** organize content (this is what the app actually uses).

```
the-second-messenger/           ← production bucket
  media/                          ← public: cover art, MP3 masters, avatars (R2_MEDIA_PREFIX)
  gated-content/                  ← private vault (R2_PREFIX)

the-second-messenger-dev/         ← development bucket (same prefix layout)
  media/
  gated-content/
```

Legacy buckets (retire after migration):

| Old bucket | Status |
|------------|--------|
| `tsm-gated-media` | 1.62 GB vault data — **copy out**, then delete |
| `tsm-dev-gated-media` | Empty — delete when dev uses `the-second-messenger-dev` |

The bucket name is never shown to fans. Semantics live in the **prefixes** and (for public files) your CDN domain.

| Environment | `R2_BUCKET` | Neon branch | Notes |
|-------------|-------------|-------------|-------|
| **Production** (Vercel) | `the-second-messenger` | `main` | Public domain `media.thesecondmessenger.com` |
| **Local dev** (`.env.local`) | `the-second-messenger-dev` | `dev` | Refresh from prod on a schedule (below) |

**Migrating from old buckets:** copy objects from `tsm-gated-media` → `the-second-messenger` (see [How to copy between buckets](#how-to-copy-between-r2-buckets)), then update env vars. Delete old buckets when verified.

---

## How to copy between R2 buckets

R2 has **no “duplicate bucket” button** in the dashboard. “Copy” means **replicate every object (file) from bucket A to bucket B**, keeping the same internal paths (keys).

Think of it like copying folders on disk:

```
tsm-gated-media/gated-content/some-demo.mp3
        ↓ copy
the-second-messenger/gated-content/some-demo.mp3
```

Your vault files in `tsm-gated-media` were uploaded with `R2_PREFIX=gated-content`, so they almost certainly live under the `gated-content/` **prefix** already. The empty `media/` folder in the new bucket is expected — public media still lives on **Vercel Blob** until you run the Blob→R2 migration script.

### Option 1 — Project script (recommended, no AWS CLI)

Uses `@aws-sdk/client-s3` already in this repo. Reads R2 credentials from `.env.local`.

**Dry run:**

```bash
pnpm r2:sync-buckets -- --source=tsm-gated-media --dest=the-second-messenger
```

**Apply** (~1.5 GB):

```bash
pnpm r2:sync-buckets -- --source=tsm-gated-media --dest=the-second-messenger --apply
```

**Dev refresh** (after prod is complete):

```bash
pnpm r2:sync-buckets -- --source=the-second-messenger --dest=the-second-messenger-dev --apply
```

When finished, open **the-second-messenger** in the Cloudflare dashboard — object count should be ~34, under `gated-content/`.

### Option 2 — AWS CLI

On some WSL/Ubuntu setups `apt install awscli` is unavailable. Use the [official AWS CLI v2 installer](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) instead, or stick with Option 1.

Set credentials (same values as `.env.local` / Vercel):

```bash
export R2_ENDPOINT="https://<account_id>.r2.cloudflarestorage.com"
export AWS_ACCESS_KEY_ID="your R2 access key"
export AWS_SECRET_ACCESS_KEY="your R2 secret key"
```

**Dry run:**

```bash
aws s3 sync "s3://tsm-gated-media" "s3://the-second-messenger" \
  --endpoint-url "$R2_ENDPOINT" \
  --dryrun
```

**Apply:**

```bash
aws s3 sync "s3://tsm-gated-media" "s3://the-second-messenger" \
  --endpoint-url "$R2_ENDPOINT"
```

When finished, open **the-second-messenger** in the Cloudflare dashboard — object count should be ~34, size ~1.62 GB, under `gated-content/`.

**Dev refresh later** (prod → dev, after prod is complete):

```bash
aws s3 sync "s3://the-second-messenger" "s3://the-second-messenger-dev" \
  --endpoint-url "$R2_ENDPOINT"
```

Add `--delete` if you want dev to become an exact mirror (removes dev-only test files).

### Option 3 — Cloudflare dashboard (one file at a time)

R2 → open object → **Copy** → pick destination bucket. Fine for a single file; impractical for 34 objects / 1.6 GB.

### Option 4 — Wrangler CLI

Cloudflare’s `wrangler r2 object` commands can get/put individual objects. Same limitation as the dashboard for bulk work — use `aws s3 sync` for migrations.

### After the copy

1. Do **not** delete `tsm-gated-media` until vault files work with `R2_BUCKET=the-second-messenger` on production.
2. Update Vercel `R2_BUCKET=the-second-messenger`.
3. Run Blob→R2 migration for public `media/` (separate step — copies from Vercel Blob, not from `tsm-gated-media`).

---

## Resume here (R2 console + migration)

Use this checklist if you have only added `R2_MEDIA_PREFIX` / `R2_PUBLIC_MEDIA_BASE_URL` to `.env.local` so far.

### Phase A — Production bucket (do once)

1. **Create bucket** `the-second-messenger` (done) with `media/` and `gated-content/` prefixes.
2. **Copy vault data** from `tsm-gated-media` → `the-second-messenger` — see [How to copy between buckets](#how-to-copy-between-r2-buckets).
3. **CORS** — R2 → bucket → Settings → CORS → paste `docs/r2-cors-policy.example.json` (apply on **prod** and **dev** buckets).
4. **Public access for `media/`** — R2 → bucket → Settings → Public access:
   - Connect custom domain **`media.thesecondmessenger.com`** to the **production** bucket.
   - DNS: add the CNAME Cloudflare shows (usually on the same zone as thesecondmessenger.com).
   - After propagation, `https://media.thesecondmessenger.com/media/<filename>` should serve objects you upload to the `media/` prefix.

   **Vault security note:** A public custom domain exposes **read access to the whole bucket** at that hostname. Vault delivery still goes through Payload tier checks + presigned URLs, but anyone who guesses `https://media.thesecondmessenger.com/gated-content/...` could bypass the app. Mitigations (pick one):
   - **Preferred:** two buckets — public `the-second-messenger-media` (custom domain) + private vault bucket (no public domain); or
   - Keep one bucket and add a Cloudflare rule blocking `/gated-content/*` on the public hostname; or
   - Accept the risk for now (obscure filenames) and harden later.

5. **Vercel production env** (in addition to Neon `DATABASE_URL`):
   ```bash
   R2_BUCKET=the-second-messenger
   R2_MEDIA_PREFIX=media
   R2_PREFIX=gated-content
   R2_PUBLIC_MEDIA_BASE_URL=https://media.thesecondmessenger.com
   # R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY — already set
   ```
6. **Deploy** the storage migration code (merge branch with `payload.config.ts` R2 media changes) to production.

### Phase B — Migrate off Vercel Blob (production)

Run locally or on a machine with Vercel CLI + prod env — targets whatever bucket is in `R2_BUCKET`:

```bash
pnpm media:audit
pnpm media:migrate-blob-to-r2 -- --apply
pnpm media:migrate-gated-masters -- --apply   # if FLAC/WAV/stems still on media
```

Then verify live site: cover art from `media.thesecondmessenger.com`, admin can upload new media.

### Phase C — Dev bucket

1. Create **`the-second-messenger-dev`** (done).
2. CORS on dev bucket (same JSON).
3. **Optional:** skip public custom domain in dev — omit `R2_PUBLIC_MEDIA_BASE_URL` in `.env.local` so uploads use `/api/media/file/...` on localhost.
4. **`.env.local`:**
   ```bash
   R2_BUCKET=the-second-messenger-dev
   R2_MEDIA_PREFIX=media
   R2_PREFIX=gated-content
   # R2_PUBLIC_MEDIA_BASE_URL=      ← leave unset locally unless you add dev r2.dev domain
   DATABASE_URL=...                 ← dev branch (ep-orange-truth-...)
   ```
5. **Refresh dev from prod** — [Neon reset + R2 sync](#refreshing-dev-from-production) whenever you want a fresh copy.

### What you already did

- `R2_MEDIA_PREFIX=media` and `R2_PUBLIC_MEDIA_BASE_URL=https://media.thesecondmessenger.com` in `.env.local` — good for testing prod CDN URLs locally, but **won't work until** the custom domain is connected and Blob→R2 migration has run. Until then, leave `R2_PUBLIC_MEDIA_BASE_URL` commented out locally to avoid broken image URLs.

---

## Environment variables

### Production (Vercel)

```bash
R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
R2_BUCKET=the-second-messenger
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_PREFIX=gated-content
R2_MEDIA_PREFIX=media
R2_PUBLIC_MEDIA_BASE_URL=https://media.thesecondmessenger.com

DATABASE_URL=...   # main / production Neon branch
```

### Local development (`.env.local`)

Use a **dev Neon branch** and **dev R2 bucket** together. Never pair a production database with an empty dev bucket — Payload stores filenames/URLs in Postgres, so DB and object storage must agree.

```bash
R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
R2_BUCKET=the-second-messenger-dev
R2_ACCESS_KEY_ID=...          # same account token is fine; scope per bucket in CF if you prefer
R2_SECRET_ACCESS_KEY=...
R2_PREFIX=gated-content
R2_MEDIA_PREFIX=media

# Optional in dev: omit or use an r2.dev URL so you don't write to the prod CDN.
# If omitted, new uploads use /api/media/file/... on localhost.
# R2_PUBLIC_MEDIA_BASE_URL=

DATABASE_URL=...   # Neon *dev* branch connection string (pooler URL)
```

When `R2_BUCKET` + `R2_ENDPOINT` are set, Payload uses R2 for `media` and **does not** register Vercel Blob.

---

## One-time dev setup (Option B)

### 1. Neon dev branch

1. [Neon console](https://console.neon.tech) → your project → **Branches**.
2. **Create branch** `dev` from `main` (production).
3. Copy the **pooled** connection string for `dev` into `.env.local` as `DATABASE_URL`.
4. Keep production `DATABASE_URL` on Vercel only.

### 2. R2 dev bucket

1. Cloudflare → R2 → **Create bucket** → `the-second-messenger-dev`.
2. Apply the same **CORS** policy as production (`docs/r2-cors-policy.example.json`).
3. Public access for `media/` is optional in dev (API routes work without a custom domain).

### 3. Initial refresh from production

Run the [manual refresh](#refreshing-dev-from-production) below once so dev DB + dev bucket both mirror prod before you experiment.

---

## Refreshing dev from production

Use this when you want dev to catch up with real CMS content and files — not start empty, but **reset** to a known-good copy of production.

**What it does**

| Step | Action                              | Result                                                                    |
| ---- | ----------------------------------- | ------------------------------------------------------------------------- |
| 1    | Reset Neon `dev` branch from `main` | Dev Postgres = copy of prod schema + rows (discards dev-only experiments) |
| 2    | Sync R2 prod bucket → dev bucket    | Dev `media/` + `gated-content/` objects match prod                        |

**When to run:** after meaningful production uploads, before a big local feature, or whenever dev feels stale. Monthly or ad-hoc is fine.

### Step 1 — Reset Neon dev branch

**Dashboard:** Project → Branches → `dev` → **Reset from parent** (confirm).

**CLI** (with [neonctl](https://neon.tech/docs/reference/cli-reference) installed):

```bash
neonctl branches reset dev --project-id <your-neon-project-id>
```

Optional: preserve current dev state before reset:

```bash
neonctl branches reset dev --project-id <id> --preserve-under-name dev-backup-2026-06-30
```

After reset, `DATABASE_URL` for the `dev` branch is unchanged (same branch, new data).

### Step 2 — Sync R2 prod → dev

Requires [AWS CLI v2](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) (S3-compatible API).

```bash
export R2_ENDPOINT="https://<account_id>.r2.cloudflarestorage.com"
export AWS_ACCESS_KEY_ID="<R2_ACCESS_KEY_ID>"
export AWS_SECRET_ACCESS_KEY="<R2_SECRET_ACCESS_KEY>"

# Dry run — lists what would copy
aws s3 sync "s3://the-second-messenger" "s3://the-second-messenger-dev" \
  --endpoint-url "$R2_ENDPOINT" \
  --dryrun

# Apply
aws s3 sync "s3://the-second-messenger" "s3://the-second-messenger-dev" \
  --endpoint-url "$R2_ENDPOINT"
```

This copies **both** prefixes (`media/` and `gated-content/`). It does not delete extra objects in dev; to mirror exactly:

```bash
aws s3 sync "s3://the-second-messenger" "s3://the-second-messenger-dev" \
  --endpoint-url "$R2_ENDPOINT" \
  --delete
```

`--delete` removes dev-only keys not present in prod — use when you want a strict mirror.

### Step 3 — Restart local dev

```bash
pnpm dev
```

Spot-check: Payload admin, one song cover image, one vault file (Lieutenant+ test user).

### Caveats

- **Dev experiments are wiped** on Neon reset unless you used `preserve-under-name`.
- **Media URLs in the DB** may still be absolute production CDN URLs (`https://media.thesecondmessenger.com/...`) after a DB copy. That is usually fine for local viewing (reads hit prod CDN). New uploads in dev go to `the-second-messenger-dev` via your local `R2_BUCKET`.
- **Stripe webhooks / cron** in dev should stay on test keys; never point production webhooks at localhost without a tunnel.
- Run refresh when **not** actively debugging a dev-only DB change you still need.

---

## Cloudflare prerequisites (per bucket)

1. **CORS** for admin client uploads — `docs/r2-cors-policy.example.json` (apply on prod; copy to dev bucket).
2. **Public access** (production only, for `media/`):
   - Custom domain `media.thesecondmessenger.com` **or** `r2.dev` subdomain.
   - Set `R2_PUBLIC_MEDIA_BASE_URL` on Vercel to that base URL (no trailing slash).

---

## Blob → R2 migration (one-time)

Run from the project root. Scripts load `.env.local` via `tsx`.

Target the bucket in `R2_BUCKET` (run against **production** env when migrating prod Blob data).

### 1. Audit orphans (read-only)

```bash
pnpm media:audit
```

Review orphans in Payload admin before deleting.

### 2. Copy Vercel Blob → R2

```bash
pnpm media:migrate-blob-to-r2
pnpm media:migrate-blob-to-r2 -- --apply
```

Uses `vercel blob get` (reads work while the Hobby store is suspended for uploads) and uploads to `R2_MEDIA_PREFIX` (`media/`).

### 3. Promote FLAC / WAV / stems to Vault

```bash
pnpm media:migrate-gated-masters
pnpm media:migrate-gated-masters -- --apply
```

### 4. Deploy production

- `R2_BUCKET=the-second-messenger` (or your chosen prod name) on Vercel.
- `R2_PUBLIC_MEDIA_BASE_URL` set.
- Confirm cover art loads from R2, not `vercel-storage.com`.
- Confirm vault files still tier-check → 302 → R2.

### 5. Refresh dev from prod

Run [refresh steps](#refreshing-dev-from-production) so local env matches.

### 6. Cleanup

- Delete orphaned `media` docs in Payload admin.
- Empty Vercel Blob store when nothing references it.

---

## Code reference

| Area                                  | Change                                                                        |
| ------------------------------------- | ----------------------------------------------------------------------------- |
| `payload.config.ts`                   | `media` on R2 public prefix; Blob only when R2 unset                          |
| `collections/Songs.ts`                | FLAC / WAV / stems → `gated-content`                                          |
| `utilities/getMediaUrl.ts`            | `pickMediaImageUrl()` for derivatives                                         |
| Frontend                              | `thumbnail` / `card` / `feature` instead of master PNG                        |
| `lib/audio-tags/syncSongAudioTags.ts` | FLAC via R2 GetObject; re-upload to correct collection                        |
| `scripts/*`                           | `pnpm media:audit`, `media:migrate-blob-to-r2`, `media:migrate-gated-masters` |

---

## Troubleshooting

| Symptom                          | Fix                                                                             |
| -------------------------------- | ------------------------------------------------------------------------------- |
| Vault 404 locally, works in prod | Dev DB + dev bucket misaligned — run [refresh](#refreshing-dev-from-production) |
| Admin upload “Failed to fetch”   | Fix R2 CORS on the bucket you're writing to                                     |
| Images 404 on production         | `R2_PUBLIC_MEDIA_BASE_URL`; public access on `media/` prefix                    |
| Tag sync fails on FLAC           | Gated-master migration; object under `gated-content/` in R2                     |
| Still Blob URLs in DB            | `pnpm media:migrate-blob-to-r2 -- --apply` on production                        |
| Dev bucket always empty          | Confirm `.env.local` `R2_BUCKET` is dev; uploads only go to configured bucket   |
