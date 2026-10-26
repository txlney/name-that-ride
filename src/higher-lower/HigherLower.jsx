import { useCallback, useEffect, useState } from 'react'
import { IoArrowDown, IoArrowUp, IoCalendarOutline, IoInfinite } from 'react-icons/io5'
import Confetti from '../components/Confetti'
import Header from '../components/Header'
import SegmentedControl from '../components/SegmentedControl'
import { load, save } from '../game/storage'
import CarCard from './CarCard'
import HelpModal from './HelpModal'
import Progress from './Progress'
import RunSummary from './RunSummary'
import StatsModal from './StatsModal'
import { pools, useHigherLower } from './useHigherLower'

const HELP_SEEN_KEY = 'hl:help-seen'
const KEY_DIRECTIONS = { ArrowUp: 'newer', ArrowDown: 'older' }

function HigherLower() {
    const game = useHigherLower()
    const { run, reference, challenger, upcoming, lastGuess } = game
    const pool = pools.find(p => p.value === run.pool)
    const guessing = run.phase === 'guessing'
    const over = run.phase === 'over'

    // 'help' | 'stats' | null
    const [modal, setModal] = useState(() => (load(HELP_SEEN_KEY, false) ? null : 'help'))
    const closeModal = useCallback(() => {
        if (modal === 'help') save(HELP_SEEN_KEY, true)
        setModal(null)
    }, [modal])

    // Start loading the next car's photo while this pair is on screen
    useEffect(() => {
        if (upcoming) new Image().src = upcoming.image
    }, [upcoming])

    // ↑ newer, ↓ older, unless the player is in the game menu or typing
    useEffect(() => {
        const onKeyDown = e => {
            const direction = KEY_DIRECTIONS[e.key]
            if (!direction || !guessing || modal || e.target.closest('input, textarea, [role=menu], [aria-haspopup]')) return
            e.preventDefault()
            game.guess(direction)
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    })

    const dailyDone = game.dailyRun.phase === 'over'
    const viewOptions = [
        {
            value: 'daily',
            label: (
                <>
                    <IoCalendarOutline size={15} /> Daily
                    {!dailyDone && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" aria-label="not played yet" />}
                </>
            ),
        },
        { value: 'free', label: <><IoInfinite size={17} /> Endless</> },
    ]

    const caption = run.kind === 'daily' ? `Daily #${run.day}` : pool?.caption ? `Endless · ${pool.caption}` : 'Endless'
    const result = lastGuess ? (lastGuess.correct ? 'correct' : 'wrong') : null

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,#1c2433_0%,#111111_55%)]">
            {/* Wider on desktop, where the guess buttons sit between the two cars */}
            <main className="mx-auto w-full max-w-3xl px-4 pb-20 lg:max-w-6xl">
                <Header gameId="higher-lower" onHelp={() => setModal('help')} onStats={() => setModal('stats')} />

                <div className="mb-3 flex flex-wrap items-center gap-2">
                    <SegmentedControl label="Game type" options={viewOptions} value={game.view} onChange={game.switchView} />
                    {game.view === 'free' && (
                        <SegmentedControl label="Pool" options={pools} value={game.preferredPool} onChange={game.changePool} />
                    )}
                </div>

                <div className="mb-2 text-xs font-semibold tracking-[0.2em] text-blue-300/80 uppercase sm:mb-3">{caption}</div>

                <section className="grid gap-2.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-[1fr_9rem_1fr] lg:items-center lg:gap-5" aria-label="Cars">
                    {[
                        <CarCard key={reference.id} car={reference} badge="Year to beat" />,
                        <div key="guess" className="hidden flex-col gap-3 lg:flex">
                            {over ? (
                                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-zinc-900 text-sm font-extrabold tracking-wider text-zinc-500 ring-1 ring-white/10">
                                    VS
                                </span>
                            ) : (
                                <>
                                    <GuessButton direction="newer" stacked disabled={!guessing} onGuess={game.guess} />
                                    <GuessButton direction="older" stacked disabled={!guessing} onGuess={game.guess} />
                                </>
                            )}
                        </div>,
                        <CarCard
                            key={challenger.id}
                            car={challenger}
                            badge="Newer or older?"
                            hideYear
                            result={result}
                            revealFrom={reference.yearNumber}
                        />,
                    ]}
                </section>

                <div className="mt-3 sm:mt-4">
                    <Progress run={run} best={run.kind === 'free' ? game.stats.free[run.pool].best : 0} />
                </div>

                <div className="mt-3 sm:mt-4">
                    {over ? (
                        <RunSummary
                            run={run}
                            pool={pool}
                            onShowStats={() => setModal('stats')}
                            onPlayAgain={game.playAgain}
                            onNewDay={game.refreshDaily}
                        />
                    ) : (
                        <>
                            <p className="mb-2.5 text-center text-sm text-zinc-400 sm:mb-3 lg:text-lg" aria-live="polite">
                                {lastGuess ? (
                                    <span className={lastGuess.correct ? 'font-semibold text-emerald-400' : 'font-semibold text-red-400'}>
                                        {lastGuess.correct ? 'Correct!' : 'Wrong!'} The {challenger.make} {challenger.model} is from {challenger.year}.
                                    </span>
                                ) : (
                                    <>Is the <b className="text-white">{challenger.make} {challenger.model}</b> newer or older than {reference.year}?</>
                                )}
                            </p>
                            <div className="grid grid-cols-2 gap-3 lg:hidden">
                                <GuessButton direction="older" disabled={!guessing} onGuess={game.guess} />
                                <GuessButton direction="newer" disabled={!guessing} onGuess={game.guess} />
                            </div>
                        </>
                    )}
                </div>
            </main>

            {game.lastFinished?.celebrate && <Confetti key={game.lastFinished.key} count={120} />}

            {modal === 'stats' && (
                <StatsModal
                    stats={game.stats}
                    today={game.dailyRun.day}
                    pools={pools}
                    initialView={game.view}
                    highlight={run.kind === 'daily' && over ? run.guesses.filter(g => g.correct).length : null}
                    onClose={closeModal}
                />
            )}
            {modal === 'help' && <HelpModal onClose={closeModal} />}
        </div>
    )
}

const BUTTONS = {
    older: { label: 'Older', Icon: IoArrowDown },
    newer: { label: 'Newer', Icon: IoArrowUp },
}

// stacked: the tall version that sits between the cars on desktop
function GuessButton({ direction, stacked = false, disabled, onGuess }) {
    const { label, Icon } = BUTTONS[direction]
    const layout = stacked ? 'flex-col gap-2 rounded-2xl py-8 text-lg' : 'gap-2 rounded-xl py-3 text-base sm:py-3.5'
    return (
        <button
            onClick={() => onGuess(direction)}
            disabled={disabled}
            className={`flex items-center justify-center bg-zinc-800 font-semibold text-white ring-1 ring-white/5 transition enabled:cursor-pointer enabled:hover:bg-blue-400 enabled:hover:text-blue-950 disabled:opacity-40 ${layout} ${
                stacked ? '' : 'enabled:hover:-translate-y-px'
            }`}
        >
            <Icon size={stacked ? 32 : 18} /> {label}
        </button>
    )
}

export default HigherLower
