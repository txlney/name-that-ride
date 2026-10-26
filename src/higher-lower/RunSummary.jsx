import { IoRefresh, IoStatsChart } from 'react-icons/io5'
import Countdown from '../components/Countdown'
import ShareButton from '../components/ShareButton'
import { DAILY_LENGTH } from './chain'
import { shareText } from './share'
import { correctCount } from './stats'

function dailyVerdict(correct) {
    if (correct === DAILY_LENGTH) return 'Perfect!'
    if (correct >= 8) return 'Great run'
    if (correct >= 5) return 'Not bad'
    return 'Tough one'
}

// Shown in place of the guess buttons once a run is over
function RunSummary({ run, pool, onShowStats, onPlayAgain, onNewDay }) {
    const correct = correctCount(run)
    const daily = run.kind === 'daily'
    const heading = daily ? dailyVerdict(correct) : run.newBest ? 'New best!' : 'Run over'
    const good = daily ? correct >= DAILY_LENGTH / 2 : run.newBest

    return (
        <div className="animate-fade-in flex flex-col gap-4 rounded-2xl bg-zinc-900/70 p-4 ring-1 ring-white/5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
                <div className={`text-xs font-semibold tracking-widest uppercase ${good ? 'text-emerald-400' : 'text-orange-400'}`}>{heading}</div>
                <div className="text-lg font-bold">
                    {daily ? `${correct} out of ${DAILY_LENGTH} right` : `Streak of ${correct}`}
                </div>
                {daily && (
                    <div className="text-sm text-zinc-400">
                        Next daily in <Countdown day={run.day} onNewDay={onNewDay} />
                    </div>
                )}
            </div>
            <div className="flex shrink-0 gap-2">
                <button onClick={onShowStats} aria-label="Statistics" className="cursor-pointer rounded-lg bg-zinc-800 px-3 py-2 text-white transition hover:bg-zinc-700">
                    <IoStatsChart size={17} />
                </button>
                <ShareButton text={shareText(run, pool)} className="bg-zinc-800 px-4 py-2 text-white hover:bg-zinc-700" />
                {!daily && (
                    <button
                        onClick={onPlayAgain}
                        autoFocus
                        className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-400 px-4 py-2 font-semibold text-blue-950 transition hover:bg-blue-300"
                    >
                        <IoRefresh size={18} /> Play again
                    </button>
                )}
            </div>
        </div>
    )
}

export default RunSummary
