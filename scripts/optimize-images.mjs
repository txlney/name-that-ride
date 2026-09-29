// Converts car photos in src/assets/cars to web-sized WebP files.
// Usage: npm run optimize-images
// Any .jpg/.jpeg/.png is resized to at most MAX_WIDTH wide, saved as .webp next to it, and the original is deleted.
// Keep your own copy of originals if you might want them later.
import { readdir, stat, unlink } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = path.resolve(import.meta.dirname, '../src/assets/cars')
const MAX_WIDTH = 1600 // the photo displays at most ~740 CSS px wide, so this covers 2x (retina) screens
const QUALITY = 80
const SOURCE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png'])

let converted = 0
let kept = 0
let before = 0
let after = 0

for (const make of await readdir(ROOT)) {
    const dir = path.join(ROOT, make)
    if (!(await stat(dir)).isDirectory()) continue

    for (const file of await readdir(dir)) {
        const ext = path.extname(file).toLowerCase()
        if (!SOURCE_EXTENSIONS.has(ext)) continue

        const source = path.join(dir, file)
        const target = path.join(dir, path.basename(file, path.extname(file)) + '.webp')

        await sharp(source)
            .rotate() // apply EXIF orientation before metadata is stripped
            .resize({ width: MAX_WIDTH, withoutEnlargement: true })
            .webp({ quality: QUALITY, effort: 6 })
            .toFile(target)

        const sourceSize = (await stat(source)).size
        const targetSize = (await stat(target)).size

        // Some photos are already squeezed hard; re-encoding those only makes them bigger
        const { width } = await sharp(source).metadata()
        if (targetSize >= sourceSize && width <= MAX_WIDTH) {
            await unlink(target)
            console.log(`${make}/${file}  kept original (${kb(sourceSize)}, WebP would be ${kb(targetSize)})`)
            kept++
            continue
        }

        before += sourceSize
        after += targetSize
        converted++
        await unlink(source)
        console.log(`${make}/${file}  ${kb(sourceSize)} -> ${kb(targetSize)}`)
    }
}

if (converted > 0) {
    console.log(`\nConverted ${converted} photos: ${mb(before)} -> ${mb(after)} (${Math.round((1 - after / before) * 100)}% smaller)`)
}
if (kept > 0) console.log(`Kept ${kept} photos as they were, because WebP wouldn't make them smaller.`)
if (converted === 0 && kept === 0) console.log('No .jpg/.jpeg/.png photos to convert.')

function kb(bytes) {
    return `${Math.round(bytes / 1024)} KB`
}

function mb(bytes) {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
