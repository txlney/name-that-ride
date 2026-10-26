// Each variant splits guesses into columns (variant.columns) and decides which of them hint, per mode
// (variant.hinted). A hinted column is green when it matches the answer, and yellow when variant.isClose
// says the wrong value is still near it. The rest stay neutral until you guess the right answer.
// A column holding a list (e.g. a Pokémon's types) is judged per value: each is green if the answer has it too.

// Returns { [column]: 'correct' | 'close' | 'unknown' }, or a list of those for a list column
export function columnResults(guess, answer, mode, variant) {
    const solved = guess.id === answer.id
    const hinted = variant.hinted[mode] ?? []
    return Object.fromEntries(variant.columns.map(({ key }) => {
        const value = guess[key]
        if (Array.isArray(value)) {
            return [key, value.map(v => (solved || (hinted.includes(key) && answer[key].includes(v)) ? 'correct' : 'unknown'))]
        }
        if (solved) return [key, 'correct']
        if (!hinted.includes(key)) return [key, 'unknown']
        if (value === answer[key]) return [key, 'correct']
        return [key, variant.isClose[key]?.(guess, answer) ? 'close' : 'unknown']
    }))
}

// Which way the answer's value in a numeric column is from the guess: 'up' (newer) or 'down' (older)
export function direction(guess, answer, key) {
    return Number(answer[key]) > Number(guess[key]) ? 'up' : 'down'
}
