import { guessResult } from '../game/scoring'

const BORDER_COLORS = { correct: 'border-emerald-500', close: 'border-yellow-400', wrong: 'border-red-500' }

function GuessList({ guesses, car, mode }) {
    if (guesses.length === 0) return null

    return (
        <section className="mt-6">
            <h2 className="mb-2 text-center text-sm text-zinc-500">Previous Guesses</h2>
            <ol className="space-y-2">
                {guesses.map(guess => (
                    <li key={guess.id} className="flex h-10 items-stretch overflow-hidden rounded bg-zinc-950">
                        <span className={`flex w-16 shrink-0 items-center justify-center border-r-2 bg-zinc-900 text-zinc-400 ${BORDER_COLORS[guessResult(guess, car, mode)]}`}>
                            {guess.year}
                        </span>
                        <span className="flex items-center truncate px-3">{`${guess.make} ${guess.model}`}</span>
                    </li>
                ))}
            </ol>
        </section>
    )
}

export default GuessList
