export const MAX_GUESSES = 6
export const ROUND_MS = 30_000
export const GRID_SIZE = 8
export const TILE_COUNT = GRID_SIZE * GRID_SIZE

// Photo points stay at full value for the grace period, then drain to zero by the end of the round
export const GRACE_MS = 3_000
export const PHOTO_POINTS = 4000
export const GUESS_POINTS = 1000
export const MAX_SCORE = PHOTO_POINTS + GUESS_POINTS

// regular: guessing the right make (wrong model) is flagged as close
// hard: every wrong guess is just wrong
export const MODES = ['regular', 'hard']

// Which cars free play deals: all of them, or only cars from makes marked common in src/makes.js
export const POOLS = ['all', 'common']
