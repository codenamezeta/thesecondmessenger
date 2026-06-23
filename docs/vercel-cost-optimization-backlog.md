# Vercel Cost Optimization — Backlog Report

**Project:** thesecondmessenger (team: a2zeta)  
**Date:** June 17, 2026  
**Context:** Hobby plan hit ~100% of the **10 GB/month Fast Origin Transfer (FOT)** included quota. Vercel warned that exceeding the limit can pause projects.

---

## What was done (June 17, 2026)

### Vault delivery: presigned R2 redirects

**Change:** `payload.config.ts` — `signedDownloads.shouldUseSignedURL` now returns `true` for **all** gated-content file GETs (not only `.zip` / `.7z` / `.rar`).

**Why it matters:** Vault audio, video, and downloads were proxied through Vercel serverless (`/api/gated-content/file/...` → R2 → function → CDN). That path bills **outgoing Fast Origin Transfer** on every byte. The dashboard showed **~98.9% outgoing**, consistent with large file delivery through compute.

**New flow:**

1. Browser requests `/api/gated-content/file/...` (with session cookies).
2. Payload runs tier checks (`gatedContentReadAccess`).
3. Handler responds with **302** to a short-lived presigned Cloudflare R2 URL.
4. Browser streams/downloads **directly from R2** — only the tiny redirect hits Vercel.

**User impact:** None expected (same UI, same URLs in components).

**Before closing this initiative:** Deploy to production and watch **Vercel → Usage → Fast Origin Transfer** for 3–7 days to confirm outgoing drops.

---

## Deferred work (pick up another day)

Items below are **lower priority** than vault proxying, or need product/architecture decisions. Ordered by likely cost impact.

---

### 1. Audio tag sync on Vercel compute

**Where:**

- `app/api/cron/sync-audio-tags/route.ts` — daily cron (`vercel.json`), `maxDuration = 300`, `force-dynamic`
- `lib/audio-tags/syncSongAudioTags.ts` — download master → mutate tags → re-upload to Blob
- Triggered from Songs `afterChange` hooks and the cron sweep

**Why it’s on the backlog:** Each sync pulls the **full master audio** (often multi‑MB) through a serverless function and writes it back. That is IO-heavy FOT, but it runs on a **schedule / on save**, not on every Crew listen. Unlikely to explain multi‑GB monthly spikes unless many songs are re-queued often.

**Options when you revisit:**

| Approach | Tradeoff |
| -------- | -------- |
| Keep as-is | Simplest; acceptable if cron volume stays low |
| Run worker off Vercel | e.g. GitHub Action, local script, or Cloudflare Worker on a schedule — removes tag-sync bytes from FOT entirely |
| Narrow triggers | Ensure hash short-circuit (`tagsSyncedHash`) is working; avoid bulk re-saves that re-queue entire catalog |
| Reduce cron frequency | Less timely tag updates |

**Effort:** Medium (if moving off Vercel). **Risk:** Low if hash skip already prevents redundant work.

---

### 2. Music song pages: dynamic rendering from `cookies()`

**Where:**

- `app/(frontend)/music/[slug]/page.tsx` — calls `cookies()` for presave / “saved” state (`tsm_user_id`)
- Page also does a **request-scoped** song fetch so vault-tier fields are not leaked through a shared slug cache

**Why it’s on the backlog:** Using `cookies()` opts the route into **dynamic rendering** on every request, so HTML is generated on compute instead of served from the CDN cache. That increases function invocations and some FOT, but payloads are **small** (HTML/JSON) compared to vault audio.

**Options when you revisit:**

| Approach | Tradeoff |
| -------- | -------- |
| Split static shell + client fetch for “saved” state | Song page can be ISR/static; presave UI hydrates client-side |
| Move presave check to a small API route | Main page stays cacheable with `revalidate = 600` (already used on list pages) |
| Leave as-is | Correctness is already handled; cost gain is modest vs vault fix |

**Effort:** Medium. **Risk:** Medium — must not expose gated URLs or tier-gated content in a statically cached response.

---

### 3. Admin: `regenerate-media-sizes` backfill

**Where:**

- `app/api/admin/regenerate-media-sizes/route.ts` — `force-dynamic`, `maxDuration = 300`
- Fetches full image masters from Blob URLs, runs sharp, writes derivatives back

**Why it’s on the backlog:** Only runs when **you** trigger it as admin. Not a production traffic pattern unless run repeatedly on a large catalog.

**Options when you revisit:**

- Always use `?ids=1,2,3` batches instead of POST without ids on Hobby.
- Run large backfills from a local machine with env vars, not production serverless.

**Effort:** Low (operational discipline). **Risk:** Low.

---

### 4. Metric-backed audit (Observability Plus)

**Status during June 17 audit:** Team **a2zeta** does not have **Observability Plus** enabled (`no_oplus_probe`). CLI usage collection also returned `USAGE_UNAVAILABLE` on Hobby.

**Why it’s on the backlog:** Without per-route metrics, optimization is **guesswork** after the vault fix. Observability Plus enables ranking by route (duration, cache hit rate, errors, cold starts) so the next pass targets what actually costs money.

**When you revisit:**

1. Enable Observability Plus in the Vercel dashboard (Observability tab).
2. Re-run a full `/vercel-optimize` audit with the project linked via CLI.
3. Use route-level evidence to validate remaining items above.

**Effort:** Low (dashboard toggle + audit rerun). **Cost:** Observability Plus is a paid add-on on top of plan.

---

### 5. Plan / quota headroom (business decision)

**Why it’s on the backlog:** If **Crew vault usage grows** (Lieutenant+ streaming dailys, stem downloads), even an optimized architecture will consume more **Fast Data Transfer** (edge → user) and some FOT (auth redirects, SSR, Payload admin).

**Hobby includes (approx.):**

- 10 GB Fast Origin Transfer / month
- Projects can be **paused** if included usage is exceeded

**Pro includes (approx.):**

- 100 GB Fast Origin Transfer / month
- On-demand overage instead of hard pause

**When to reconsider:** After deploying the vault redirect, if FOT stays high *or* traffic is intentional growth, Pro may be cheaper than emergency firefighting.

**Effort:** Billing decision only.

---

## Suggested order for a future session

1. **Deploy** vault presigned redirects (if not already live) and **monitor FOT** one billing cycle.
2. **Enable Observability Plus** (optional) and re-run optimize audit — confirms what’s left.
3. If FOT still elevated: investigate **audio tag sync** volume in logs / `tagSyncStatus` queue.
4. If function invocations / SSR cost matter: refactor **music `[slug]` page** caching vs presave cookie.
5. Revisit **Pro vs Hobby** once you have a month of post-fix usage data.

---

## Reference: Fast Origin Transfer (plain language)

**Fast Origin Transfer** = data between Vercel’s **CDN** and **compute** (functions, ISR data cache, etc.). It is **not** the same as total bandwidth to visitors.

- **Outgoing FOT** (what dominated your chart): compute sending large response bodies to the CDN.
- **Incoming FOT**: request bodies into compute (e.g. uploads); usually small for GET-heavy apps.

Primary docs: [Vercel CDN pricing and usage](https://vercel.com/docs/manage-cdn-usage)

---

## Files touched in the vault fix (for git / deploy)

- `payload.config.ts` — `signedDownloads` for all gated-content GETs
- `utilities/getGatedContentFileUrl.ts` — comment update only
