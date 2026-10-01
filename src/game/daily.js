import { range, seededRandom, shuffle } from '../utils'
import { TILE_COUNT } from './constants'

const EPOCH = Date.UTC(2026, 0, 1)
const DAY_MS = 86_400_000

// Day 1 = 1 Jan 2026, counted in the player's local time zone
export function dayNumber(date) {
    return Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - EPOCH) / DAY_MS) + 1
}

export function msUntilTomorrow(now) {
    const midnight = new Date(now)
    midnight.setHours(24, 0, 0, 0)
    return midnight - now
}

export function createDaily(items, seed) {
    // Every player's device walks through the same shuffled list, so everyone gets the same answer each day.
    // Adding items reshuffles this list, which changes the answer for today and future days.
    const sequence = shuffle(
        items.filter(item => item.image).sort((a, b) => a.id - b.id),
        seededRandom(seed),
    )

    return {
        answer(day) {
            const n = sequence.length
            return sequence[(((day - 1) % n) + n) % n]
        },
        tileOrder(day) {
            return shuffle(range(TILE_COUNT), seededRandom(day * 7919))
        },
    }
}
