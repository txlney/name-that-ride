import rawPokemon from './pokemon.json'

// pokemon.json and the artwork in src/assets/pokemon/<id>.webp come from `npm run fetch-pokemon`.
// import.meta.glob lets Vite bundle them and hand back a real URL for each.
const artwork = import.meta.glob('./assets/pokemon/*.webp', { eager: true, query: '?url', import: 'default' })

// The last national dex number in each generation
const GEN_ENDS = [151, 251, 386, 493, 649, 721, 809, 905, 1025]

function generation(id) {
    return GEN_ENDS.findIndex(end => id <= end) + 1
}

// Lets "farfetch'd", "farfetchd", "flabebe" and "nidoran female" find Farfetch’d, Flabébé and Nidoran♀
function searchText(name) {
    const lower = name.toLowerCase().replace(/’/g, "'")
    const plain = lower
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/♀/g, ' female')
        .replace(/♂/g, ' male')
        .replace(/[^a-z0-9 ]/g, '')
    return `${lower} ${plain}`
}

const pokemon = rawPokemon
    .map(p => {
        const image = artwork[`./assets/pokemon/${p.id}.webp`]
        if (!image && import.meta.env.DEV) console.warn(`No artwork for #${p.id} ${p.name}, run npm run fetch-pokemon`)
        return { ...p, gen: generation(p.id), label: p.name, searchText: searchText(p.name), image }
    })
    .sort((a, b) => a.name.localeCompare(b.name))

export default pokemon
