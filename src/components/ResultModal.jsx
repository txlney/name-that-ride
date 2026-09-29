import { useEffect, useState } from 'react'
import { IoShuffle } from 'react-icons/io5'
import { GUESS_POINTS, MAX_GUESSES, MAX_SCORE, PHOTO_POINTS, ROUND_MS } from '../game/constants'
import { scoreColor } from '../game/scoring'
import Countdown from './Countdown'
import Modal from './Modal'
import ShareButton from './ShareButton'

// Eases a number up from 0; jumps straight there for reduced-motion users
function useCountUp(target, duration = 1000) {
    const [value, setValue] = useState(0)

    useEffect(() => {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const start = performance.now()
        let frame
        const step = now => {
            const t = reduced ? 1 : Math.min(1, (now - start) / duration)
            setValue(Math.round(target * (1 - (1 - t) ** 3)))
            if (t < 1) frame = requestAnimationFrame(step)
        }
        frame = requestAnimationFrame(step)
        return () => cancelAnimationFrame(frame)
    }, [target, duration])

    return value
}

function ResultModal({ round, onClose, onNextCar, onNewDay }) {
    const won = round.status === 'won'
    const perfect = round.score === MAX_SCORE
    const displayScore = useCountUp(round.score)
    const revealedPercent = Math.round((round.elapsed / ROUND_MS) * 100)
    const title = perfect ? 'Perfect score!' : won ? 'You got it!' : 'Better luck next time'

    return (
        <Modal title={title} onClose={onClose}>
            <img
                src={round.car.image}
                alt={round.car.label}
                className={`mt-4 aspect-video w-full rounded-xl object-cover ring-2 ${won ? 'ring-emerald-500' : 'ring-red-500'}`}
            />
            <p className="mt-4 text-center text-zinc-400">
                {won ? 'It was the' : 'The hidden car was the'}{' '}
                <span className="font-bold text-white">{round.car.label}</span>
            </p>

            <div className="mt-5 text-center">
                <div className={`text-5xl font-extrabold tabular-nums tracking-tight ${scoreColor(round.score)}`}>
                    {displayScore.toLocaleString()}
                </div>
                <div className="mt-1 text-xs uppercase tracking-widest text-zinc-500">
                    out of {MAX_SCORE.toLocaleString()}{round.mode === 'hard' && ' · Hard mode'}
                </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <Stat value={`${round.photoPoints}`} label={`Photo / ${PHOTO_POINTS}`} />
                <Stat value={`${round.guessPoints}`} label={`Guesses / ${GUESS_POINTS}`} />
                <Stat value={`${revealedPercent}%`} label={won ? `Revealed · ${round.guesses.length}/${MAX_GUESSES}` : 'Revealed'} />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
                <ShareButton round={round} className="bg-zinc-800 py-2.5 text-white hover:bg-zinc-700" />
                {round.kind === 'free' ? (
                    <button
                        onClick={onNextCar}
                        className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-400 py-2.5 font-semibold text-blue-950 transition hover:bg-blue-300"
                    >
                        <IoShuffle size={18} /> Next car
                    </button>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-lg bg-zinc-950 py-1.5">
                        <span className="text-[10px] uppercase tracking-widest text-zinc-500">Next daily in</span>
                        <span className="font-semibold"><Countdown day={round.day} onNewDay={onNewDay} /></span>
                    </div>
                )}
            </div>
        </Modal>
    )
}

function Stat({ value, label }) {
    return (
        <div className="rounded-lg bg-zinc-950 px-2 py-3">
            <div className="text-lg font-bold tabular-nums">{value}</div>
            <div className="text-[11px] text-zinc-500">{label}</div>
        </div>
    )
}

export default ResultModal
