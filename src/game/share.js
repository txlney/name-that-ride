import { MAX_GUESSES, ROUND_MS } from './constants'
import { guessResult } from './scoring'
import { range } from '../utils'

const EMOJI = { correct: '🟩', close: '🟨', wrong: '🟥' }

export function shareText(round) {
    const squares = range(MAX_GUESSES)
        .map(i => {
            const guess = round.guesses[i]
            return guess ? EMOJI[guessResult(guess, round.car, round.mode)] : '⬛'
        })
        .join('')
    const title = round.kind === 'daily'
        ? `Name That Ride #${round.day}`
        : `Name That Ride · Free play${round.pool === 'common' ? ' · Common' : ''}`
    const mode = round.mode === 'hard' ? ' · Hard' : ''
    const revealed = Math.round((round.elapsed / ROUND_MS) * 100)
    return `${title}${mode}\n${squares}\n📷 ${revealed}% revealed · ${round.score.toLocaleString()} pts`
}
