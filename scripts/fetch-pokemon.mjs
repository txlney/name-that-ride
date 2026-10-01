// Downloads every Pokémon's name, types and official artwork from PokeAPI.
// Usage: npm run fetch-pokemon
// Writes src/pokemon.json and src/assets/pokemon/<id>.webp. Safe to re-run: anything already downloaded is skipped.
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const COUNT = 1025
const CONCURRENCY = 8
const SIZE = 640 // the frame displays at most ~450 CSS px wide
const QUALITY = 80

const DATA_FILE = path.resolve(import.meta.dirname, '../src/pokemon.json')
const IMAGE_DIR = path.resolve(import.meta.dirname, '../src/assets/pokemon')
const API = 'https://pokeapi.co/api/v2'
const ARTWORK = id => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`

await mkdir(IMAGE_DIR, { recursive: true })
const saved = existsSync(DATA_FILE) ? JSON.parse(await readFile(DATA_FILE, 'utf8')) : []
const byId = new Map(saved.map(p => [p.id, p]))

const ids = Array.from({ length: COUNT }, (_, i) => i + 1)
let done = 0
const failed = []

async function worker() {
    while (ids.length > 0) {
        const id = ids.shift()
        try {
            if (!byId.has(id)) byId.set(id, await fetchDetails(id))
            const image = path.join(IMAGE_DIR, `${id}.webp`)
            if (!existsSync(image)) await downloadArtwork(id, image)
        } catch (err) {
            failed.push(id)
            console.error(`#${id} failed: ${err.message}`)
        }
        if (++done % 50 === 0) console.log(`${done}/${COUNT}`)
    }
}

async function fetchDetails(id) {
    const [species, pokemon] = await Promise.all([getJson(`${API}/pokemon-species/${id}`), getJson(`${API}/pokemon/${id}`)])
    const name = species.names.find(n => n.language.name === 'en')?.name ?? capitalize(species.name)
    const types = pokemon.types.sort((a, b) => a.slot - b.slot).map(t => capitalize(t.type.name))
    return { id, name, types }
}

async function downloadArtwork(id, target) {
    const res = await fetchWithRetry(ARTWORK(id))
    const png = Buffer.from(await res.arrayBuffer())
    await sharp(png)
        .resize({ width: SIZE, height: SIZE, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: QUALITY, alphaQuality: 90, effort: 6 })
        .toFile(target)
}

async function getJson(url) {
    return (await fetchWithRetry(url)).json()
}

async function fetchWithRetry(url, attempts = 4) {
    for (let i = 1; ; i++) {
        try {
            const res = await fetch(url)
            if (!res.ok) throw new Error(`${res.status} ${url}`)
            return res
        } catch (err) {
            if (i >= attempts) throw err
            await new Promise(resolve => setTimeout(resolve, 1000 * i))
        }
    }
}

function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1)
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker))

const list = [...byId.values()].sort((a, b) => a.id - b.id)
await writeFile(DATA_FILE, JSON.stringify(list, null, 1) + '\n')
console.log(`\nSaved ${list.length} Pokémon to src/pokemon.json`)
if (failed.length > 0) {
    console.log(`${failed.length} failed (${failed.join(', ')}). Run again to retry them.`)
    process.exitCode = 1
}
