// Fisher-Yates shuffle, returns a new array. Pass a seeded `random` for a repeatable order.
export function shuffle(items, random = Math.random) {
    const arr = [...items]
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1))
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
}

export function range(n) {
    return Array.from({ length: n }, (_, i) => i)
}

// mulberry32: tiny deterministic PRNG, returns floats in [0, 1)
export function seededRandom(seed) {
    return function () {
        seed = (seed + 0x6d2b79f5) | 0
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}
