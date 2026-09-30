import cars from '../cars'
import { shuffle } from '../utils'

// Free play can deal from every car, or only the ones tagged sporty in cars.js
const playable = {
    all: cars.filter(car => car.image),
    sporty: cars.filter(car => car.image && car.sporty),
}
const decks = { all: [], sporty: [] }

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
