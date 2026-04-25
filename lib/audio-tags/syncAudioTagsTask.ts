import type { TaskConfig } from 'payload'
import { syncSongAudioTags } from './syncSongAudioTags'

/**
 * Payload job-queue task: write a Song's CMS metadata into its master
 * audio file's ID3v2.3 / Vorbis tags.
 *
 * Triggered from:
 *   - Songs `afterChange` hook (per-save, immediate).
 *   - Vercel Cron sweep (catches any `queued` songs that the immediate
 *     enqueue missed, e.g. when running outside a Payload request).
 *
 * The slug is registered as a string (not added to TypedJobs) so it
 * compiles before payload-types.ts is regenerated. Once Payload regens
 * the types, this can be tightened to `TaskConfig<'syncAudioTags'>`.
 */
type SyncAudioTagsIO = {
  input: { songId: number }
  output: { status: string; detail: string }
}

export const syncAudioTagsTask: TaskConfig<SyncAudioTagsIO> = {
  slug: 'syncAudioTags',
  retries: 2,
  inputSchema: [
    {
      name: 'songId',
      type: 'number',
      required: true,
      admin: {
        description: 'ID of the Song whose master audio should be re-tagged.',
      },
    },
  ],
  outputSchema: [
    { name: 'status', type: 'text' },
    { name: 'detail', type: 'text' },
  ],
  handler: async ({ input, req }) => {
    const { songId } = input as { songId: number }
    const result = await syncSongAudioTags(req.payload, songId)

    if (result.status === 'error') {
      // Throwing surfaces the failure into Payload's job retry mechanism.
      throw new Error(result.error)
    }

    return {
      output: {
        status: result.status,
        detail:
          result.status === 'synced'
            ? `wrote ${result.bytesWritten} bytes (hash ${result.hash})`
            : result.reason,
      },
    }
  },
}
