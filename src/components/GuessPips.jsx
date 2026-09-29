import { FaPlay, FaPause } from 'react-icons/fa'
import { MAX_GUESSES } from '../game/constants'
import { guessResult } from '../game/scoring'
import { range } from '../utils'

const PIP_COLORS = { correct: 'bg-emerald-500', close: 'bg-yellow-400', wrong: 'bg-red-500' }

// points: what a correct guess is worth right now (or the final score once the round is over)
function GuessPips({ guesses, car, mode, running, canToggle, onToggle, points, pointsLabel }) {
    return (
        <div className="flex items-stretch rounded-b-2xl bg-zinc-950">
            <button
                onClick={onToggle}
                disabled={!canToggle}
                aria-label={running ? 'Pause' : 'Play'}
                className="flex w-14 shrink-0 items-center justify-center rounded-bl-2xl bg-zinc-900 text-white transition enabled:cursor-pointer enabled:hover:bg-blue-400 enabled:hover:text-blue-950 disabled:opacity-30 sm:w-16"
            >
                {running ? <FaPause size={15} /> : <FaPlay size={15} />}
            </button>
            <div className="flex flex-1 items-center gap-1.5 px-3 py-3.5 sm:gap-3 sm:px-4" aria-label={`${guesses.length} of ${MAX_GUESSES} guesses used`}>
                {range(MAX_GUESSES).map(i => {
                    const guess = guesses[i]
                    const color = guess ? PIP_COLORS[guessResult(guess, car, mode)] : 'bg-zinc-800'
                    return <div key={i} className={`h-2.5 flex-1 rounded-full transition-colors duration-300 ${color}`} />
                })}
            </div>
            <div className="flex w-20 shrink-0 flex-col items-end justify-center pr-4 leading-tight" title={pointsLabel}>
                <span className="font-bold tabular-nums">{points.toLocaleString()}</span>
                <span className="text-[10px] uppercase tracking-wider text-zinc-500">{pointsLabel}</span>
            </div>
        </div>
    )
}

export default GuessPips
