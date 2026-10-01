import { shuffle } from '../utils'

// Free play deals from one of the variant's pools, e.g. every car, or only cars from common makes.
// Each pool: { value, filter? }. A pool with no filter, or whose filter matches nothing, deals every item.
export function createDeck(items, pools) {
    const allPlayable = items.filter(item => item.image)
    const playable = Object.fromEntries(pools.map(({ value, filter }) => {
        const matching = filter ? allPlayable.filter(filter) : allPlayable
        return [value, matching.length > 0 ? matching : allPlayable]
    }))
    const decks = Object.fromEntries(pools.map(({ value }) => [value, []]))

    function refill(pool) {
        if (decks[pool].length === 0) decks[pool] = shuffle(playable[pool])
    }

    return {
        // Deals every item in the pool once, in random order, before any repeats
        draw(pool) {
            refill(pool)
            return decks[pool].pop()
        },
        // The item the next draw() will return, so its photo can be preloaded
        peek(pool) {
            refill(pool)
            return decks[pool][decks[pool].length - 1]
        },
    }
}
