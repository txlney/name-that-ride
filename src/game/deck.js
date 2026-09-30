import cars from '../cars'
import { shuffle } from '../utils'

// Free play can deal from every car, or only cars from makes marked common in src/makes.js
const allPlayable = cars.filter(car => car.image)
const commonPlayable = allPlayable.filter(car => car.common)
const playable = {
    all: allPlayable,
    // Falls back to every car if no make is marked common, so there's always something to deal
    common: commonPlayable.length > 0 ? commonPlayable : allPlayable,
}
const decks = { all: [], common: [] }

// Deals every car in the pool once, in random order, before any repeats
export function drawCar(pool) {
    if (decks[pool].length === 0) decks[pool] = shuffle(playable[pool])
    return decks[pool].pop()
}

// The car the next drawCar() will return, so its photo can be preloaded
export function peekCar(pool) {
    if (decks[pool].length === 0) decks[pool] = shuffle(playable[pool])
    return decks[pool][decks[pool].length - 1]
}
