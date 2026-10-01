import { MAX_GUESSES, ROUND_MS } from './constants'
import { guessResult } from './scoring'
import { range } from '../utils'

const EMOJI = { correct: '🟩', close: '🟨', wrong: '🟥' }

export function shareText(round, variant) {
    const squares = range(MAX_GUESSES)
        .map(i => {
            const guess = round.guesses[i]
            return guess ? EMOJI[guessResult(guess, round.answer, round.mode, variant)] : '⬛'
        })
        .join('')
    const name = `${variant.title.lead} ${variant.title.accent}`
    const pool = variant.pools.find(p => p.value === round.pool)
    const title = round.kind === 'daily'
        ? `${name} #${round.day}`
        : `${name} · Free play${pool?.caption ? ` · ${pool.caption}` : ''}`
    const mode = round.mode === 'hard' ? ' · Hard' : ''
    const revealed = Math.round((round.elapsed / ROUND_MS) * 100)
    return `${title}${mode}\n${squares}\n📷 ${revealed}% revealed · ${round.score.toLocaleString()} pts`
}
