/** Format whole seconds as `M:SS` for admin display and stored durationText. */
export function formatDurationMmSs(seconds: number): string {
  const mm = Math.floor(seconds / 60)
  const ss = Math.round(seconds % 60)
    .toString()
    .padStart(2, '0')
  return `${mm}:${ss}`
}
