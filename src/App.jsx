import { useCallback, useEffect, useMemo, useState } from 'react'
import { IoCalendarOutline, IoCarSportOutline, IoInfinite, IoStarOutline } from 'react-icons/io5'
import cars from './cars'
import { ROUND_MS } from './game/constants'
import { peekCar } from './game/deck'
import { guessPoints, photoPoints } from './game/scoring'
import { load, save } from './game/storage'
import { useGame } from './game/useGame'
import CarReveal from './components/CarReveal'
import Confetti from './components/Confetti'
import GuessList from './components/GuessList'
import GuessPips from './components/GuessPips'
import GuessSearch from './components/GuessSearch'
import Header from './components/Header'
import HelpModal from './components/HelpModal'
import ModeToggle from './components/ModeToggle'
import ResultModal from './components/ResultModal'
import RoundSummary from './components/RoundSummary'
import SegmentedControl from './components/SegmentedControl'
import StatsModal from './components/StatsModal'
import TimerBar from './components/TimerBar'

const HELP_SEEN_KEY = 'ntr:help-seen'
const commonCars = cars.filter(car => car.common)

const POOL_OPTIONS = [
    { value: 'all', label: <><IoCarSportOutline size={16} /> All cars</>, title: 'Every car in the game' },
    {
        value: 'common',
        label: <><IoStarOutline size={15} /> Common</>,
        title: 'Only cars from well-known makes',
        activeClass: 'bg-amber-400 text-amber-950',
    },
]

function App() {
    const game = useGame()
    const { round, finished } = game
    const { car, status, guesses } = round

    const [loadedImage, setLoadedImage] = useState(null)
    const imageReady = loadedImage === car.image
    const canToggle = imageReady && !finished

    // 'help' | 'stats' | 'result' | null
    const [modal, setModal] = useState(() => (load(HELP_SEEN_KEY, false) ? null : 'help'))
    const closeModal = useCallback(() => {
        if (modal === 'help') save(HELP_SEEN_KEY, true)
        setModal(null)
    }, [modal])

    const guessedIds = useMemo(() => new Set(guesses.map(g => g.id)), [guesses])

    // Let the last tiles fade out before the result pops up
    useEffect(() => {
        if (!game.lastFinished) return
        const timeout = setTimeout(() => setModal('result'), 900)
        return () => clearTimeout(timeout)
    }, [game.lastFinished])

    // Start loading the next free play photo while this round's result is showing
    useEffect(() => {
        if (finished && round.kind === 'free') new Image().src = peekCar(game.preferredPool).image
    }, [finished, round.kind, game.preferredPool])

    // Space starts/pauses, unless the player is typing or a button already has focus
    useEffect(() => {
        const onKeyDown = e => {
            if (e.code !== 'Space' || modal || e.target.closest('input, textarea, button')) return
            e.preventDefault()
            if (canToggle) game.toggle()
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    })

    function nextFreeRound() {
        setModal(null)
        game.nextFreeRound()
    }

    const refreshDaily = game.refreshDaily
    const dailyDone = game.dailyRound.status === 'won' || game.dailyRound.status === 'lost'
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
        { value: 'free', label: <><IoInfinite size={17} /> Free play</> },
    ]

    const points = finished ? round.score : photoPoints(round.elapsed) + guessPoints(guesses.length + 1)

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,#1c2433_0%,#111111_55%)]">
            <main className="mx-auto w-full max-w-3xl px-4 pb-20">
                <Header onHelp={() => setModal('help')} onStats={() => setModal('stats')} />

                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <SegmentedControl label="Game type" options={viewOptions} value={game.view} onChange={game.switchView} />
                        {game.view === 'free' && (
                            <SegmentedControl label="Cars" options={POOL_OPTIONS} value={game.preferredPool} onChange={game.changePool} />
                        )}
                    </div>
                    <ModeToggle
                        mode={game.preferredMode}
                        inProgress={game.inProgress}
                        locked={game.modeLocked}
                        onChange={game.changeMode}
                    />
                </div>

                <section className="rounded-2xl shadow-2xl shadow-black/50 ring-1 ring-white/10">
                    <CarReveal
                        // remount per round so tiles start opaque instead of fading back in over the new photo
                        key={round.key}
                        car={car}
                        tileOrder={round.tileOrder}
                        revealedCount={game.revealedCount}
                        status={status}
                        imageReady={imageReady}
                        onImageLoad={setLoadedImage}
                        onStart={game.toggle}
                        caption={round.kind === 'daily' ? `Daily #${round.day}` : round.pool === 'common' ? 'Free play · Common' : 'Free play'}
                    />
                    <TimerBar remaining={1 - round.elapsed / ROUND_MS} />
                    <GuessPips
                        guesses={guesses}
                        car={car}
                        mode={round.mode}
                        running={status === 'running'}
                        canToggle={canToggle}
                        onToggle={game.toggle}
                        points={points}
                        pointsLabel={finished ? 'score' : 'pts now'}
                    />
                </section>

                {status === 'running' && (
                    <p className="mt-4 text-center text-sm text-zinc-500">
                        Pause to make a guess{' '}
                        <kbd className="ml-1 rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-300">Space</kbd>
                    </p>
                )}
                {status === 'paused' && (
                    <GuessSearch cars={round.pool === 'common' ? commonCars : cars} guessedIds={guessedIds} onGuess={game.guess} onGiveUp={game.giveUp} />
                )}
                {finished && (
                    <RoundSummary
                        round={round}
                        onShowResult={() => setModal('result')}
                        onNextCar={nextFreeRound}
                        onNewDay={refreshDaily}
                    />
                )}

                <GuessList guesses={guesses} car={car} mode={round.mode} />
            </main>

            {game.lastFinished?.won && (
                <Confetti key={game.lastFinished.key} count={game.lastFinished.perfect ? 180 : 90} />
            )}

            {modal === 'result' && finished && (
                <ResultModal round={round} onClose={closeModal} onNextCar={nextFreeRound} onNewDay={refreshDaily} />
            )}
            {modal === 'stats' && (
                <StatsModal
                    stats={game.stats}
                    today={game.dailyRound.day}
                    initialMode={game.preferredMode}
                    highlight={status === 'won' ? { mode: round.mode, guesses: guesses.length } : null}
                    onClose={closeModal}
                />
            )}
            {modal === 'help' && <HelpModal onClose={closeModal} />}
        </div>
    )
}

export default App
