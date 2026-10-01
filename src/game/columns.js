// Each variant splits guesses into columns (variant.columns) and decides which of them hint, per mode
// (variant.hinted). A hinted column is green when it matches the answer, and yellow when variant.isClose
// says the wrong value is still near it. The rest stay neutral until you guess the right answer.

// Returns { [column]: 'correct' | 'close' | 'unknown' }
export function columnResults(guess, answer, mode, variant) {
    const solved = guess.id === answer.id
    const hinted = variant.hinted[mode] ?? []
    return Object.fromEntries(variant.columns.map(({ key }) => {
        if (solved) return [key, 'correct']
        if (!hinted.includes(key)) return [key, 'unknown']
        if (guess[key] === answer[key]) return [key, 'correct']
        return [key, variant.isClose[key]?.(guess, answer) ? 'close' : 'unknown']
    }))
}

// Which way the answer's value in a numeric column is from the guess: 'up' (newer) or 'down' (older)
export function direction(guess, answer, key) {
    return Number(answer[key]) > Number(guess[key]) ? 'up' : 'down'
}
