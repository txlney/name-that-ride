import { getGame } from '../games'
import { DAILY_LENGTH } from './chain'
import { correctCount } from './stats'

export function shareText(run, pool) {
    const { title } = getGame('higher-lower')
    const name = `${title.lead} ${title.accent}`
    const correct = correctCount(run)

    if (run.kind === 'daily') {
        const squares = run.guesses.map(g => (g.correct ? '🟩' : '🟥')).join('')
        return `${name} #${run.day}\n${squares}\n${correct}/${DAILY_LENGTH}`
    }

    const caption = pool?.caption ? ` · ${pool.caption}` : ''
    return `${name} · Endless${caption}\n🔥 Streak of ${correct}`
}
