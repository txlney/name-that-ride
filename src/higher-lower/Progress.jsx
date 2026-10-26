import { IoFlame, IoTrophyOutline } from 'react-icons/io5'
import { range } from '../utils'
import { DAILY_LENGTH } from './chain'
import { correctCount } from './stats'

// Daily: a pip per guess. Endless: the current streak against the best for this pool.
function Progress({ run, best }) {
    const correct = correctCount(run)

    if (run.kind === 'daily') {
        return (
            <div className="flex items-center gap-3">
                <div className="flex flex-1 gap-1.5" aria-label={`${run.guesses.length} of ${DAILY_LENGTH} guesses made, ${correct} right`}>
                    {range(DAILY_LENGTH).map(i => {
                        const guess = run.guesses[i]
                        const current = i === run.guesses.length && run.phase === 'guessing'
                        const color = guess ? (guess.correct ? 'bg-emerald-500' : 'bg-red-500') : current ? 'bg-zinc-500' : 'bg-zinc-800'
                        return <div key={i} className={`h-2.5 flex-1 rounded-full transition-colors duration-300 ${color}`} />
                    })}
                </div>
                <span className="w-12 text-right font-bold tabular-nums">
                    {correct}<span className="text-zinc-500">/{DAILY_LENGTH}</span>
                </span>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 font-semibold">
                <IoFlame size={18} className={correct > 0 ? 'text-orange-400' : 'text-zinc-600'} />
                Streak <span className="tabular-nums">{correct}</span>
            </span>
            <span className="flex items-center gap-1.5 text-zinc-400">
                <IoTrophyOutline size={16} />
                Best <span className="font-semibold text-white tabular-nums">{Math.max(best, correct)}</span>
            </span>
        </div>
    )
}

export default Progress
