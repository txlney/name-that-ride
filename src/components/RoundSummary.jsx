import { IoShuffle, IoTrophyOutline } from 'react-icons/io5'
import Countdown from './Countdown'
import ShareButton from './ShareButton'
import { scoreColor } from '../game/scoring'
import { useVariant } from '../game/variant'

// Shown under the photo once a round is over
function RoundSummary({ round, onShowResult, onNext, onNewDay }) {
    const { noun } = useVariant()
    const won = round.status === 'won'

    return (
        <div className="animate-fade-in mt-4 flex flex-col gap-4 rounded-2xl bg-zinc-900/70 p-4 ring-1 ring-white/5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
                <div className={`text-xs font-semibold uppercase tracking-widest ${won ? 'text-emerald-400' : 'text-red-400'}`}>
                    {won ? 'Correct' : `The ${noun} was`}
                </div>
                <div className="truncate text-lg font-bold">{round.answer.label}</div>
                <div className="text-sm text-zinc-400">
                    Score <span className={`font-semibold tabular-nums ${scoreColor(round.score)}`}>{round.score.toLocaleString()}</span>
                    {round.kind === 'daily' && (
                        <> · Next daily in <Countdown day={round.day} onNewDay={onNewDay} /></>
                    )}
                </div>
            </div>
            <div className="flex shrink-0 gap-2">
                <button onClick={onShowResult} aria-label="Show result" className="cursor-pointer rounded-lg bg-zinc-800 px-3 py-2 text-white transition hover:bg-zinc-700">
                    <IoTrophyOutline size={18} />
                </button>
                <ShareButton round={round} className="bg-zinc-800 px-4 py-2 text-white hover:bg-zinc-700" />
                {round.kind === 'free' && (
                    <button
                        onClick={onNext}
                        className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-400 px-4 py-2 font-semibold text-blue-950 transition hover:bg-blue-300"
                    >
                        <IoShuffle size={18} /> Next {noun}
                    </button>
                )}
            </div>
        </div>
    )
}

export default RoundSummary
