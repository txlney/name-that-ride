import cars from '../cars'
import { range, seededRandom, shuffle } from '../utils'
import { TILE_COUNT } from './constants'

const EPOCH = Date.UTC(2026, 0, 1)
const DAY_MS = 86_400_000

// Every player's device walks through the same shuffled list, so everyone gets the same car each day.
// Adding cars to cars.js reshuffles this list, which changes the car for today and future days.
const sequence = shuffle(
    cars.filter(car => car.image).sort((a, b) => a.id - b.id),
    seededRandom(20260101),
)

// Day 1 = 1 Jan 2026, counted in the player's local time zone
export function dayNumber(date) {
    return Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - EPOCH) / DAY_MS) + 1
}

export function msUntilTomorrow(now) {
    const midnight = new Date(now)
    midnight.setHours(24, 0, 0, 0)
    return midnight - now
}

export function dailyCar(day) {
    const n = sequence.length
    return sequence[(((day - 1) % n) + n) % n]
}

export function dailyTileOrder(day) {
    return shuffle(range(TILE_COUNT), seededRandom(day * 7919))
}
