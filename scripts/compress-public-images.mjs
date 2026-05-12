#!/usr/bin/env node
/**
 * compress-public-images.mjs
 *
 * One-off optimizer for everything under `public/imgs/`. These are static
 * assets (committed to git, served directly by Next.js with no on-the-fly
 * optimization since they're loaded via CSS `background-image` or static
 * <img>/<Image src=>), so they need to be optimized at the source.
 *
 * What it does:
 *   - Inspects every PNG/JPEG/JPG file under `public/imgs/` recursively.
 *   - Resizes images that exceed a per-category max dimension (photos
 *     get capped at 2400, backgrounds at 2000, logos at 1200, favicons
 *     are left alone).
 *   - Re-encodes via sharp at sane quality presets:
 *       - JPEG → mozjpeg quality 82
 *       - PNG → palette-quantized PNG (oxipng-equivalent compressionLevel: 9)
 *       - PNG → JPEG (smaller, no alpha lost) ONLY when --convert-png-to-jpg
 *         is passed AND the source has no alpha channel. Off by default so
 *         filenames stay stable and code references don't break silently.
 *   - Optionally also writes a sibling .webp at quality 80 alongside each
 *     output (so CSS can opt into webp via image-set later).
 *
 * Safe by default:
 *   - Dry-run mode (no flag) reports projected savings without touching files.
 *   - `--apply` writes optimized output to `public/imgs.optimized/` (mirroring
 *     the directory tree). Inspect, then `mv public/imgs.optimized public/imgs`
 *     when satisfied. Git history is your safety net.
 *   - `--in-place` overwrites originals directly. Only use after you've
 *     verified the dry-run output is sensible.
 *
 * Usage:
 *   node scripts/compress-public-images.mjs              # dry-run report
 *   node scripts/compress-public-images.mjs --apply      # write to public/imgs.optimized/
 *   node scripts/compress-public-images.mjs --in-place   # overwrite originals
 *   node scripts/compress-public-images.mjs --webp       # also write .webp siblings
 *
 *   Filters:
 *     --only=backgrounds        only process files in public/imgs/backgrounds/
 *     --skip=favicons,logos     skip these subdirectories
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const SOURCE_DIR = path.join(ROOT, 'public', 'imgs')
const OUTPUT_DIR = path.join(ROOT, 'public', 'imgs.optimized')

const args = parseArgs(process.argv.slice(2))

/**
 * Per-directory profiles. Each profile defines the max dimension along the
 * longest edge and any format-specific overrides. Anything not matched by a
 * specific rule falls back to `default`.
 */
const PROFILES = {
  favicons: { maxEdge: null, jpegQuality: 90, pngQuality: 100 }, // leave alone
  logos:    { maxEdge: 1200, jpegQuality: 85, pngQuality: 9 },
  backgrounds: { maxEdge: 2000, jpegQuality: 80, pngQuality: 9 },
  default:  { maxEdge: 2400, jpegQuality: 82, pngQuality: 9 },
}

function getProfile(relPath) {
  const top = relPath.split(path.sep)[0]
  if (PROFILES[top]) return { name: top, ...PROFILES[top] }
  return { name: 'default', ...PROFILES.default }
}

async function main() {
  await fs.access(SOURCE_DIR).catch(() => {
    console.error(`✗ Source directory not found: ${SOURCE_DIR}`)
    process.exit(1)
  })

  if (args.apply && args.inPlace) {
    console.error('✗ Pass either --apply or --in-place, not both.')
    process.exit(1)
  }

  console.log(`compress-public-images — mode: ${describeMode()}`)
  console.log(`  source:  ${path.relative(ROOT, SOURCE_DIR)}/`)
  if (args.apply) console.log(`  output:  ${path.relative(ROOT, OUTPUT_DIR)}/`)
  if (args.inPlace) console.log('  output:  (overwriting originals in place)')
  if (args.webp) console.log('  webp:    yes (sibling .webp will be written)')
  console.log('')

  const files = await collectImages(SOURCE_DIR)
  const filtered = files.filter((f) => shouldProcess(f.relPath))

  console.log(`Found ${files.length} images, processing ${filtered.length}.\n`)

  let totalIn = 0
  let totalOut = 0
  let totalSkipped = 0
  const rows = []

  for (const file of filtered) {
    try {
      const result = await processFile(file)
      totalIn += result.bytesIn
      totalOut += result.bytesOut
      if (result.skipped) totalSkipped += 1
      rows.push(result)
    } catch (err) {
      console.error(`✗ ${file.relPath}: ${err.message}`)
    }
  }

  console.log('')
  console.log(formatTable(rows))
  console.log('')
  console.log(`Total in:        ${formatBytes(totalIn)}`)
  console.log(`Total out:       ${formatBytes(totalOut)}`)
  console.log(`Total saved:     ${formatBytes(totalIn - totalOut)} (${pct(totalIn - totalOut, totalIn)})`)
  console.log(`Files skipped:   ${totalSkipped}`)

  if (!args.apply && !args.inPlace) {
    console.log('')
    console.log('Dry-run only. Re-run with --apply to write to public/imgs.optimized/')
    console.log('or --in-place to overwrite originals.')
  }
}

async function collectImages(dir, base = dir, acc = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const abs = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await collectImages(abs, base, acc)
    } else if (entry.isFile() && /\.(png|jpe?g)$/i.test(entry.name)) {
      acc.push({ abs, relPath: path.relative(base, abs) })
    }
  }
  return acc
}

function shouldProcess(relPath) {
  const top = relPath.split(path.sep)[0]
  if (args.only && args.only !== top) return false
  if (args.skip.includes(top)) return false
  return true
}

async function processFile(file) {
  const profile = getProfile(file.relPath)
  const sourceBuffer = await fs.readFile(file.abs)
  const sourceMeta = await sharp(sourceBuffer).metadata()
  const bytesIn = sourceBuffer.length

  // Skip favicons (and any rule with no max edge) — they're already small.
  if (profile.maxEdge === null) {
    return {
      relPath: file.relPath,
      profile: profile.name,
      bytesIn,
      bytesOut: bytesIn,
      dimsIn: `${sourceMeta.width}x${sourceMeta.height}`,
      dimsOut: `${sourceMeta.width}x${sourceMeta.height}`,
      formatIn: sourceMeta.format,
      formatOut: sourceMeta.format,
      skipped: true,
    }
  }

  const longestEdge = Math.max(sourceMeta.width ?? 0, sourceMeta.height ?? 0)
  const needsResize = longestEdge > profile.maxEdge

  let pipeline = sharp(sourceBuffer)
  if (needsResize) {
    pipeline = pipeline.resize({
      width: profile.maxEdge,
      height: profile.maxEdge,
      fit: 'inside',
      withoutEnlargement: true,
    })
  }

  // Decide output format. PNG with no alpha → JPEG (smaller). Otherwise keep
  // PNG/JPEG. Sharp's `hasAlpha` is on metadata.
  const sourceFmt = sourceMeta.format
  const hasAlpha = sourceMeta.hasAlpha ?? false
  let formatOut = sourceFmt
  let outputBuffer

  if (sourceFmt === 'jpeg' || sourceFmt === 'jpg') {
    formatOut = 'jpeg'
    outputBuffer = await pipeline
      .jpeg({ quality: profile.jpegQuality, mozjpeg: true })
      .toBuffer()
  } else if (sourceFmt === 'png' && !hasAlpha && args.convertPngToJpg) {
    // Only convert when the user explicitly opts in. Filename will change
    // from .png → .jpg; the script handles the rename in --in-place mode
    // but any code references to the original .png will break.
    formatOut = 'jpeg'
    outputBuffer = await pipeline
      .jpeg({ quality: profile.jpegQuality, mozjpeg: true })
      .toBuffer()
  } else if (sourceFmt === 'png') {
    formatOut = 'png'
    outputBuffer = await pipeline
      .png({ compressionLevel: profile.pngQuality, palette: true })
      .toBuffer()
  } else {
    return {
      relPath: file.relPath,
      profile: profile.name,
      bytesIn,
      bytesOut: bytesIn,
      dimsIn: `${sourceMeta.width}x${sourceMeta.height}`,
      dimsOut: `${sourceMeta.width}x${sourceMeta.height}`,
      formatIn: sourceFmt,
      formatOut: sourceFmt,
      skipped: true,
    }
  }

  const outputMeta = await sharp(outputBuffer).metadata()

  // If the new file is bigger than the original (rare but possible — sharp
  // sometimes can't beat handcrafted PNGs), keep the original. Don't make
  // things worse.
  if (outputBuffer.length >= bytesIn) {
    return {
      relPath: file.relPath,
      profile: profile.name,
      bytesIn,
      bytesOut: bytesIn,
      dimsIn: `${sourceMeta.width}x${sourceMeta.height}`,
      dimsOut: `${sourceMeta.width}x${sourceMeta.height}`,
      formatIn: sourceFmt,
      formatOut: sourceFmt,
      skipped: true,
    }
  }

  if (args.apply || args.inPlace) {
    const ext = formatOut === 'jpeg' ? '.jpg' : `.${formatOut}`
    // Replace the original extension with the new one. If formats match, this
    // is a no-op.
    const baseRel = file.relPath.replace(/\.(png|jpe?g)$/i, ext)
    const targetDir = args.inPlace ? SOURCE_DIR : OUTPUT_DIR
    const targetAbs = path.join(targetDir, baseRel)
    await fs.mkdir(path.dirname(targetAbs), { recursive: true })
    await fs.writeFile(targetAbs, outputBuffer)

    if (args.inPlace && targetAbs !== file.abs) {
      // We wrote a new extension; remove the original to avoid duplicates.
      await fs.unlink(file.abs).catch(() => {})
    }

    if (args.webp) {
      const webpBuffer = await sharp(outputBuffer)
        .webp({ quality: 80 })
        .toBuffer()
      const webpRel = baseRel.replace(/\.(png|jpe?g)$/i, '.webp')
      const webpAbs = path.join(targetDir, webpRel)
      await fs.writeFile(webpAbs, webpBuffer)
    }
  }

  return {
    relPath: file.relPath,
    profile: profile.name,
    bytesIn,
    bytesOut: outputBuffer.length,
    dimsIn: `${sourceMeta.width}x${sourceMeta.height}`,
    dimsOut: `${outputMeta.width}x${outputMeta.height}`,
    formatIn: sourceFmt,
    formatOut,
    skipped: false,
  }
}

function parseArgs(argv) {
  const out = {
    apply: false,
    inPlace: false,
    webp: false,
    convertPngToJpg: false,
    only: null,
    skip: [],
  }
  for (const arg of argv) {
    if (arg === '--apply') out.apply = true
    else if (arg === '--in-place') out.inPlace = true
    else if (arg === '--webp') out.webp = true
    else if (arg === '--convert-png-to-jpg') out.convertPngToJpg = true
    else if (arg.startsWith('--only=')) out.only = arg.slice('--only='.length)
    else if (arg.startsWith('--skip=')) {
      out.skip = arg
        .slice('--skip='.length)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    } else if (arg === '--help' || arg === '-h') {
      printHelp()
      process.exit(0)
    } else {
      console.error(`Unknown argument: ${arg}`)
      printHelp()
      process.exit(1)
    }
  }
  return out
}

function describeMode() {
  if (args.inPlace) return 'IN-PLACE (overwriting originals)'
  if (args.apply) return 'APPLY (writing to public/imgs.optimized/)'
  return 'DRY-RUN (no files written)'
}

function formatBytes(bytes) {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(2)} MB`
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(1)} KB`
  return `${bytes} B`
}

function pct(part, whole) {
  if (!whole) return '0%'
  return `${((part / whole) * 100).toFixed(1)}%`
}

function formatTable(rows) {
  if (rows.length === 0) return '(no files)'
  const sorted = [...rows].sort((a, b) => b.bytesIn - a.bytesIn)
  const cols = [
    { header: 'File', key: 'relPath', width: 50 },
    { header: 'In',   key: 'inLabel', width: 10, align: 'right' },
    { header: 'Out',  key: 'outLabel', width: 10, align: 'right' },
    { header: 'Save', key: 'saveLabel', width: 10, align: 'right' },
    { header: 'Dims', key: 'dimsLabel', width: 20 },
    { header: 'Fmt',  key: 'fmtLabel', width: 12 },
  ]
  const annotated = sorted.map((r) => ({
    ...r,
    inLabel: formatBytes(r.bytesIn),
    outLabel: r.skipped ? '— skip' : formatBytes(r.bytesOut),
    saveLabel: r.skipped ? '—' : pct(r.bytesIn - r.bytesOut, r.bytesIn),
    dimsLabel: r.dimsIn === r.dimsOut ? r.dimsIn : `${r.dimsIn} → ${r.dimsOut}`,
    fmtLabel: r.formatIn === r.formatOut ? r.formatIn : `${r.formatIn} → ${r.formatOut}`,
  }))
  const lines = []
  lines.push(renderRow(cols.map((c) => ({ value: c.header, width: c.width, align: c.align }))))
  lines.push(cols.map((c) => '─'.repeat(c.width)).join('  '))
  for (const row of annotated) {
    lines.push(
      renderRow(
        cols.map((c) => ({ value: String(row[c.key] ?? ''), width: c.width, align: c.align })),
      ),
    )
  }
  return lines.join('\n')
}

function renderRow(cells) {
  return cells
    .map(({ value, width, align }) => {
      const truncated = value.length > width ? value.slice(0, width - 1) + '…' : value
      return align === 'right' ? truncated.padStart(width) : truncated.padEnd(width)
    })
    .join('  ')
}

function printHelp() {
  console.log(`compress-public-images.mjs

Usage:
  node scripts/compress-public-images.mjs [flags]

Flags:
  --apply               Write optimized output to public/imgs.optimized/
  --in-place            Overwrite originals directly (use with caution)
  --webp                Also write a sibling .webp at quality 80 for each output
  --convert-png-to-jpg  Convert non-transparent PNGs to JPGs. Off by default.
                        Off by default — opt in only after grepping for any
                        code references to the affected .png files.
  --only=DIR            Process only files under public/imgs/<DIR>/
  --skip=A,B,C          Skip these subdirectories (comma-separated)
  -h, --help            Show this message

Default mode is dry-run: prints projected savings without writing anything.
`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
