import { GRACE_MS, GUESS_POINTS, MAX_GUESSES, MAX_SCORE, PHOTO_POINTS, ROUND_MS } from './constants'

export function photoPoints(elapsed) {
    const drained = Math.max(0, elapsed - GRACE_MS) / (ROUND_MS - GRACE_MS)
    return Math.round(PHOTO_POINTS * (1 - Math.min(1, drained)))
}

// 1st guess 1000, 2nd 800 ... 6th 0
export function guessPoints(guessCount) {
    return Math.round(((MAX_GUESSES - guessCount) / (MAX_GUESSES - 1)) * GUESS_POINTS)
}

export function guessResult(guess, car, mode) {
    if (guess.id === car.id) return 'correct'
    if (mode === 'regular' && guess.make === car.make) return 'close'
    return 'wrong'
}

const SCORE_COLORS = [
    [MAX_SCORE, 'text-yellow-300'],
    [4000, 'text-sky-300'],
    [3000, 'text-emerald-400'],
    [2000, 'text-lime-300'],
    [1000, 'text-amber-500'],
    [0, 'text-red-500'],
]

export function scoreColor(score) {
    return SCORE_COLORS.find(([min]) => score >= min)[1]
}
