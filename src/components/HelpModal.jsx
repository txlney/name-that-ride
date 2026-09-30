import { GRACE_MS, GUESS_POINTS, MAX_GUESSES, MAX_SCORE, PHOTO_POINTS, ROUND_MS } from '../game/constants'
import Modal from './Modal'

function Pip({ className }) {
    return <span className={`inline-block h-2.5 w-6 rounded-full align-middle ${className}`} />
}

function HelpModal({ onClose }) {
    return (
        <Modal title="How to play" onClose={onClose}>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-zinc-300">
                <p>
                    A photo of a car is hidden behind black tiles. Press <b className="text-white">Start</b> and the tiles uncover
                    over {ROUND_MS / 1000} seconds. <b className="text-white">Pause</b> whenever you think you know it, then search
                    and guess. You have {MAX_GUESSES} guesses.
                </p>

                <div className="rounded-xl bg-zinc-950 p-4">
                    <div className="mb-2 font-semibold text-white">Scoring (up to {MAX_SCORE.toLocaleString()})</div>
                    <ul className="space-y-1.5">
                        <li><b className="text-white">Photo points</b>, up to {PHOTO_POINTS.toLocaleString()}. You keep them all for the first {GRACE_MS / 1000} seconds, then they drain as more of the photo shows.</li>
                        <li><b className="text-white">Guess points</b>, up to {GUESS_POINTS.toLocaleString()}. 1st guess {GUESS_POINTS}, then 200 fewer for each guess after that.</li>
                        <li>The number next to the guess pips shows what a correct guess is worth right now.</li>
                    </ul>
                </div>

                <div className="rounded-xl bg-zinc-950 p-4">
                    <div className="mb-2 font-semibold text-white">Modes</div>
                    <ul className="space-y-2">
                        <li className="flex items-center gap-3"><Pip className="bg-emerald-500" /> Correct car</li>
                        <li className="flex items-center gap-3"><Pip className="bg-yellow-400" /> Right make, wrong model <span className="text-zinc-500">(Regular only)</span></li>
                        <li className="flex items-center gap-3"><Pip className="bg-red-500" /> Wrong</li>
                    </ul>
                    <p className="mt-3 text-zinc-400">
                        <b className="text-white">Hard</b> gives no make hints. Changing mode in the middle of a free play round starts a new round.
                    </p>
                </div>

                <div className="rounded-xl bg-zinc-950 p-4">
                    <div className="mb-2 font-semibold text-white">Daily and Free play</div>
                    <p>
                        <b className="text-white">Daily</b> is the same car for everyone, once a day. Win it on consecutive days to build a streak, and share your result.
                        <b className="text-white"> Free play</b> gives you unlimited random cars. Switch it to
                        <b className="text-white"> Sporty</b> for only sports cars, supercars and hypercars.
                    </p>
                </div>

                <p className="text-zinc-500">
                    Tip: press <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-200">Space</kbd> to start and pause.
                    In the search, use <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-200">↑</kbd>{' '}
                    <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-200">↓</kbd> and{' '}
                    <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-200">Enter</kbd>.
                </p>
            </div>
        </Modal>
    )
}

export default HelpModal
