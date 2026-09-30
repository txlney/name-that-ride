// The properties each guess is broken into in the guess list
export const COLUMNS = [
    { key: 'year', label: 'Year' },
    { key: 'make', label: 'Make' },
    { key: 'model', label: 'Model' },
]

// Which columns tell you whether they match the answer, per mode.
// The rest stay neutral until you guess the right car.
const HINTED_COLUMNS = {
    regular: ['year', 'make'],
    hard: [],
}

const CLOSE_YEARS = 5

// A wrong value that's still near the answer, e.g. a make from the same country
const IS_CLOSE = {
    year: (guess, car) => Math.abs(guess.year - car.year) <= CLOSE_YEARS,
    make: (guess, car) => guess.country === car.country,
}

// Returns { year, make, model }, each 'correct' | 'close' | 'wrong' | 'unknown'
export function columnResults(guess, car, mode) {
    const solved = guess.id === car.id
    const hinted = HINTED_COLUMNS[mode] ?? []
    return Object.fromEntries(COLUMNS.map(({ key }) => {
        if (solved) return [key, 'correct']
        if (!hinted.includes(key)) return [key, 'unknown']
        if (guess[key] === car[key]) return [key, 'correct']
        return [key, IS_CLOSE[key]?.(guess, car) ? 'close' : 'unknown']
    }))
}

// Which way the answer's year is from the guess: 'up' (newer) or 'down' (older)
export function yearDirection(guess, car) {
    return Number(car.year) > Number(guess.year) ? 'up' : 'down'
}
