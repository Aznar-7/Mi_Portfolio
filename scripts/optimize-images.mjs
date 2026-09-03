#!/usr/bin/env node
// Converts every raster image (.png/.jpg/.jpeg) under public/images/projects/
// to .webp (quality 82) in place, deletes the original once the .webp file
// is confirmed written, and reports the size saved. Safe to re-run: once a
// file has been converted, its original no longer exists, so it is skipped
// on the next run automatically.
//
// Usage: npm run optimize-images

import sharp from 'sharp'
import { readdir, stat, unlink } from 'node:fs/promises'
import { join, extname, basename, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'images', 'projects')
const RASTER_EXT = new Set(['.png', '.jpg', '.jpeg'])

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walk(full)))
    } else if (RASTER_EXT.has(extname(entry.name).toLowerCase())) {
      files.push(full)
    }
  }
  return files
}

async function convert(file) {
  const webpPath = join(dirname(file), basename(file, extname(file)) + '.webp')
  const before = (await stat(file)).size
  await sharp(file).webp({ quality: 82 }).toFile(webpPath)
  const after = (await stat(webpPath)).size
  await unlink(file)
  const savedPct = Math.round((1 - after / before) * 100)
  console.log(`${file} -> ${webpPath}  ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB (-${savedPct}%)`)
}

const files = await walk(ROOT)
if (files.length === 0) {
  console.log('No raster images found to convert.')
} else {
  for (const file of files) {
    await convert(file)
  }
  console.log(`\nConverted ${files.length} image(s).`)
}
