// Adds new cars to the game from photos you've saved.
// 1. Save a photo into the _new-cars folder, named "<year> <make> <model>", e.g. "2026 Alfa Romeo Tonale.jpg"
//    (for a brand-new make with a space in it, separate it with " - ": "2024 Land Rover - Defender.jpg")
//    Sports/super/hyper cars go in _new-cars/sporty instead, so they also appear in Free play's "Sporty" mode.
// 2. Run: npm run add-car
// Each photo is converted to WebP, saved in src/assets/cars and added to src/cars.js, then removed from _new-cars.
import { readFile, writeFile, readdir, mkdir, access, unlink } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = path.resolve(import.meta.dirname, '..')
const INBOX = path.join(ROOT, '_new-cars')
const CARS_FILE = path.join(ROOT, 'src/cars.js')
const MAX_WIDTH = 1600 // same settings as optimize-images.mjs
const QUALITY = 80
const SOURCE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif'])
const CAR_LINE = /^\s*\{ id: (\d+), year: "(\d{4})", make: "([^"]+)", model: "([^"]*)"(, sporty: true)? \},?\s*$/

await mkdir(path.join(INBOX, 'sporty'), { recursive: true })
const files = [
    ...(await photosIn(INBOX)).map(file => ({ file, sporty: false })),
    ...(await photosIn(path.join(INBOX, 'sporty'))).map(file => ({ file: path.join('sporty', file), sporty: true })),
]
if (files.length === 0) {
    console.log('No photos in _new-cars. Save some there named like "2026 Alfa Romeo Tonale.jpg" (sports cars in _new-cars/sporty), then run this again.')
    process.exit(0)
}

let added = 0
for (const { file, sporty } of files) {
    try {
        const result = await addCar(file, sporty)
        if (result.skipped) {
            console.log(`- skipped ${file}: ${result.skipped}`)
        } else {
            added++
            console.log(`+ added ${result.label}${sporty ? ' (sporty)' : ''}  ->  ${result.file}`)
        }
    } catch (error) {
        console.log(`! failed ${file}: ${error.message}`)
    }
}
console.log(`\nAdded ${added} of ${files.length}.${added < files.length ? ' Anything not added is still in _new-cars.' : ''}`)

async function photosIn(dir) {
    return (await readdir(dir)).filter(file => SOURCE_EXTENSIONS.has(path.extname(file).toLowerCase()))
}

async function addCar(file, sporty) {
    const source = await readFile(CARS_FILE, 'utf8')
    const eol = source.includes('\r\n') ? '\r\n' : '\n' // keep the file's line endings (VS Code on Windows uses \r\n)
    const lines = source.split(/\r?\n/)
    const existing = lines.map(line => line.match(CAR_LINE)).filter(Boolean)
    // A hand-edited line in another format would be missed here and could end up with a reused id
    const unreadable = lines.find(line => /^\s*\{ id: \d+/.test(line) && !CAR_LINE.test(line))
    if (unreadable) throw new Error(`cars.js has a car line in an unexpected format, fix it first: ${unreadable.trim()}`)

    const { year, make, model } = parseFileName(path.basename(file, path.extname(file)), existing.map(match => match[3]))
    const label = `${year} ${make} ${model}`

    const duplicate = existing.some(([, , y, m, mo]) =>
        y === year && m.toLowerCase() === make.toLowerCase() && mo.toLowerCase() === model.toLowerCase())
    if (duplicate) return { skipped: `${label} is already in cars.js` }

    const target = photoFile({ year, make, model })
    if (await exists(target)) return { skipped: `a photo already exists at ${path.relative(ROOT, target)}` }

    const photo = path.join(INBOX, file)
    await mkdir(path.dirname(target), { recursive: true })
    // Read into memory first; on Windows sharp would otherwise keep the file locked so it can't be removed after
    await sharp(await readFile(photo))
        .rotate()
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: QUALITY, effort: 6 })
        .toFile(target)

    await writeFile(CARS_FILE, insertCar(lines, existing, { year, make, model, sporty }).join(eol))
    await unlink(photo)
    return { label, file: path.relative(ROOT, target) }
}

// "2026 Alfa Romeo Tonale" or "2024 Land Rover - Defender"
function parseFileName(name, knownMakes) {
    const match = name.trim().match(/^(\d{4})\s+(.+)$/)
    if (!match) throw new Error('name should start with the year, e.g. "2026 Alfa Romeo Tonale.jpg"')
    const [, year, rest] = match

    const split = rest.match(/^(.+?)\s+-\s+(.+)$/)
    if (split) return { year, make: matchKnownMake(split[1].trim(), knownMakes) ?? split[1].trim(), model: split[2].trim() }

    // Prefer the spelling already used in cars.js, so e.g. "mercedes-benz" becomes "Mercedes-Benz"
    const known = [...new Set(knownMakes)]
        .sort((a, b) => b.length - a.length)
        .find(make => rest.toLowerCase().startsWith(make.toLowerCase() + ' '))
    if (known) return { year, make: known, model: rest.slice(known.length).trim() }

    // New make: assume it's the first word
    const [make, ...model] = rest.split(/\s+/)
    if (model.length === 0) throw new Error('name needs a make and a model, e.g. "2026 Alfa Romeo Tonale.jpg"')
    return { year, make, model: model.join(' ') }
}

function matchKnownMake(make, knownMakes) {
    return knownMakes.find(known => known.toLowerCase() === make.toLowerCase())
}

// Mirrors photoPath() in src/cars.js, which can't be imported here because it relies on import.meta.glob
function photoFile({ year, make, model }) {
    const makeSlug = make.toLowerCase().replace(/ /g, '-')
    const modelSlug = model.toLowerCase().replace(/-/g, '=').replace(/ /g, '-')
    return path.join(ROOT, 'src/assets/cars', makeSlug, `${year}-${modelSlug}.webp`)
}

// Puts the new car after the last car of the same make, or at the end of the list for a new make
function insertCar(lines, existing, { year, make, model, sporty }) {
    const id = Math.max(0, ...existing.map(match => Number(match[1]))) + 1
    const sameMake = lines.findLastIndex(line => line.match(CAR_LINE)?.[3].toLowerCase() === make.toLowerCase())
    const after = sameMake !== -1 ? sameMake : lines.findLastIndex(line => CAR_LINE.test(line))

    const isLast = !lines[after].trimEnd().endsWith(',')
    if (isLast) lines[after] = lines[after].trimEnd() + ','
    const entry = `    { id: ${id}, year: ${JSON.stringify(year)}, make: ${JSON.stringify(make)}, model: ${JSON.stringify(model)}${sporty ? ', sporty: true' : ''} }${isLast ? '' : ','}`
    lines.splice(after + 1, 0, entry)
    return lines
}

async function exists(file) {
    try {
        await access(file)
        return true
    } catch {
        return false
    }
}
