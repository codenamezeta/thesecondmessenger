import type { TagLib } from 'taglib-wasm'

let _taglibPromise: Promise<TagLib> | null = null

async function getTagLib(): Promise<TagLib> {
  if (!_taglibPromise) {
    const mod = await import('taglib-wasm')
    _taglibPromise = mod.TagLib.initialize()
  }
  return _taglibPromise
}

/**
 * Read the decoded audio length from a buffer. Returns whole seconds,
 * rounded from taglib's floating-point duration.
 */
export async function getAudioDurationSeconds(
  buffer: Uint8Array,
): Promise<number | null> {
  const taglib = await getTagLib()
  const file = await taglib.open(buffer)
  try {
    if (!file.isValid()) return null
    const props = file.audioProperties()
    if (
      !props ||
      typeof props.duration !== 'number' ||
      !Number.isFinite(props.duration) ||
      props.duration <= 0
    ) {
      return null
    }
    return Math.round(props.duration)
  } finally {
    file.dispose()
  }
}
