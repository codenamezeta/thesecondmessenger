# Presave cron — cron-job.org setup

The release fulfillment worker lives at:

```
GET https://thesecondmessenger.com/api/cron/release-radar?key=YOUR_CRON_SECRET
```

Replace `YOUR_CRON_SECRET` with the same value as the `CRON_SECRET` environment variable in Vercel.

Vercel Hobby only runs built-in crons **once per day** (backup at 09:00 UTC via `vercel.json`). For timely Spotify saves and YouTube premiere likes, use **cron-job.org** as the primary scheduler.

## cron-job.org configuration

1. Log in at [cron-job.org](https://cron-job.org)
2. **Cronjobs** → **Create cronjob**
3. **Title:** `TSM Release Radar`
4. **URL:**

```
 https://thesecondmessenger.com/api/cron/release-radar?key=YOUR_CRON_SECRET
```

5. **Schedule (normal releases):** every **30 minutes**

- Expression: `*/30 * * * *`

6. **Request method:** `GET`
7. **Timeout:** 120 seconds (or max allowed)
8. **Notifications:** optional — enable email on failure

### Around a premiere / release day

Create a **second** cronjob (or temporarily edit the schedule) for higher frequency:

| Window          | Schedule         | Expression     |
| --------------- | ---------------- | -------------- |
| Release week    | Every 15 minutes | `*/15 * * * *` |
| Premiere hour   | Every 5 minutes  | `*/5 * * * *`  |
| Premiere minute | Every 1 minute   | `* * * * *`    |

Example for **Lost In Space** premiering **August 1**:

- From **July 31** through **August 2**: run every **15 minutes**
- On **August 1** from **00:00–04:00** your local premiere window: run every **5 minutes**

After the release window, switch back to every 30 minutes or disable the aggressive job.

## Security notes

- Never commit `CRON_SECRET` to git
- cron-job.org stores the full URL including the key — use a dedicated secret only for cron
- The route also accepts `Authorization: Bearer YOUR_CRON_SECRET` if you prefer not to put the key in the query string (cron-job.org → **Advanced** → **Headers**)

## Manual test

```bash
curl "https://thesecondmessenger.com/api/cron/release-radar?key=YOUR_CRON_SECRET"
```

Expected response:

```json
{
  "success": true,
  "presavesScanned": 0,
  "spotifyAttempts": 0,
  "spotifyFulfilled": 0,
  "youtubeAttempts": 0,
  "youtubeFulfilled": 0,
  "errors": 0,
  "message": "..."
}
```

## What the worker does

1. Scans all `presaves` profiles
2. For each song in `campaigns` (or with a pending intent) released within the last **14 days**
3. **Spotify:** refreshes token → saves track if `spotifyId` exists → marks intent fulfilled
4. **YouTube:** if `linkedUser` has Google refresh token → likes video if `youtubeId` exists → marks intent fulfilled

## Local development

```bash
curl "http://localhost:3000/api/cron/release-radar?key=YOUR_CRON_SECRET"
```

Ensure `CRON_SECRET` is set in `.env.local`.
