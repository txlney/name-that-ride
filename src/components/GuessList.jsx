import { IoArrowDown, IoArrowUp } from 'react-icons/io5'
import { COLUMNS, columnResults, yearDirection } from '../game/columns'

const CELL_COLORS = {
    correct: 'bg-emerald-500 text-emerald-950 font-medium',
    close: 'bg-yellow-400 text-yellow-950 font-medium',
    wrong: 'bg-red-500/80 text-white',
    unknown: 'bg-zinc-900 text-zinc-300',
}
const GRID = 'grid grid-cols-[4.25rem_1fr_1.5fr] gap-1 sm:grid-cols-[4.75rem_1fr_1.75fr]'

function YearArrow({ direction }) {
    const Icon = direction === 'up' ? IoArrowUp : IoArrowDown
    return <Icon size={14} className="ml-0.5 shrink-0" aria-label={direction === 'up' ? 'answer is newer' : 'answer is older'} />
}

function GuessList({ guesses, car, mode }) {
    if (guesses.length === 0) return null

    return (
        <section className="mt-8">
            <h2 className="mb-2 text-center text-sm text-zinc-500 hidden">Previous Guesses</h2>
            <div className={`${GRID} mb-1 px-px text-[10px] uppercase tracking-wider text-zinc-500`} aria-hidden="true">
                {COLUMNS.map(({ key, label }) => <span key={key} className="px-2">{label}</span>)}
            </div>
            <ol className="space-y-1">
                {guesses.map(guess => {
                    const results = columnResults(guess, car, mode)
                    return (
                        <li key={guess.id} className={GRID} aria-label={guess.label}>
                            {COLUMNS.map(({ key, label }) => (
                                <span
                                    key={key}
                                    title={label}
                                    className={`flex justify-between min-h-10 min-w-0 items-center rounded px-2 py-1.5 text-sm leading-tight break-words transition-colors ${CELL_COLORS[results[key]]}`}
                                >
                                    {guess[key]}
                                    {key === 'year' && results.year === 'close' && <YearArrow direction={yearDirection(guess, car)} />}
                                </span>
                            ))}
                        </li>
                    )
                })}
            </ol>
        </section>
    )
}

export default GuessList
