import cars from '../cars'
import { shuffle } from '../utils'

const playable = cars.filter(car => car.image)
let deck = []

// Deals every car once, in random order, before any repeats
export function drawCar() {
    if (deck.length === 0) deck = shuffle(playable)
    return deck.pop()
}

// The car the next drawCar() will return, so its photo can be preloaded
export function peekCar() {
    if (deck.length === 0) deck = shuffle(playable)
    return deck[deck.length - 1]
}
