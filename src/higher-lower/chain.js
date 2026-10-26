import { seededRandom } from '../utils'
import cars from '../cars'

// The daily is this many guesses, so its chain is one car longer
export const DAILY_LENGTH = 10

// How many years apart the two cars are, by how many guesses into the run.
// Early pairs are decades apart and the gap narrows as the run goes on.
const GAP_BANDS = [
    { fromStep: 0, min: 15, max: Infinity },
    { fromStep: 2, min: 8, max: 30 },
    { fromStep: 5, min: 4, max: 15 },
    { fromStep: 10, min: 2, max: 8 },
    { fromStep: 20, min: 1, max: 4 },
]

export const playableCars = cars.filter(car => car.image).map(car => ({ ...car, yearNumber: Number(car.year) }))

export function poolCars(pool) {
    const matching = pool?.filter ? playableCars.filter(pool.filter) : playableCars
    return matching.length > 0 ? matching : playableCars
}

function gapBand(step) {
    return GAP_BANDS.findLast(band => step >= band.fromStep)
}

const pick = (items, random) => items[Math.floor(random() * items.length)]

const FALLBACK_COUNT = 10

function closestYears(candidates, ref) {
    const gap = car => Math.abs(car.yearNumber - ref.yearNumber)
    return [...candidates].sort((a, b) => gap(a) - gap(b) || a.id - b.id).slice(0, FALLBACK_COUNT)
}

// The car to compare against `ref` at this step: never the same year, never a car already in the run,
// and newer or older at random (when the band allows both) so the answer can't be guessed from the reference alone.
export function pickNext(ref, step, pool, random, usedIds) {
    const fresh = pool.filter(car => car.yearNumber !== ref.yearNumber && !usedIds.has(car.id))
    // A tiny pool could run out of unseen cars, so allow repeats rather than end the run
    const candidates = fresh.length > 0 ? fresh : pool.filter(car => car.yearNumber !== ref.yearNumber)
    const { min, max } = gapBand(step)
    const inBand = candidates.filter(car => {
        const gap = Math.abs(car.yearNumber - ref.yearNumber)
        return gap >= min && gap <= max
    })
    // A car with few others near its year, e.g. a 1908 Model T, can leave the band empty, so fall back to the closest years
    const options = inBand.length > 0 ? inBand : closestYears(candidates, ref)
    const newer = options.filter(car => car.yearNumber > ref.yearNumber)
    const older = options.filter(car => car.yearNumber < ref.yearNumber)
    const [first, second] = random() < 0.5 ? [newer, older] : [older, newer]
    return pick(first.length > 0 ? first : second, random)
}

// Extends a chain of cars by `count`, each picked against the one before it
export function extendChain(chain, count, pool, random = Math.random) {
    const next = [...chain]
    const usedIds = new Set(next.map(car => car.id))
    for (let i = 0; i < count; i++) {
        const car = next.length === 0 ? pick(pool, random) : pickNext(next.at(-1), next.length - 1, pool, random, usedIds)
        next.push(car)
        usedIds.add(car.id)
    }
    return next
}

// The same chain for every player each day. Adding cars changes the chains for today and future days.
export function dailyChain(day) {
    return extendChain([], DAILY_LENGTH + 1, playableCars, seededRandom(day * 7919 + 4243))
}

export const isNewer = (car, ref) => car.yearNumber > ref.yearNumber
