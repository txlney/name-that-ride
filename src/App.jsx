import { useCallback, useEffect, useMemo, useState } from 'react'
import { IoCalendarOutline, IoInfinite } from 'react-icons/io5'
import { ROUND_MS } from './game/constants'
import { guessPoints, photoPoints } from './game/scoring'
import { load, save } from './game/storage'
import { useGame } from './game/useGame'
import { VariantContext } from './game/variant'
import Confetti from './components/Confetti'
import GuessList from './components/GuessList'
import GuessPips from './components/GuessPips'
import GuessSearch from './components/GuessSearch'
import Header from './components/Header'
import HelpModal from './components/HelpModal'
import ModeToggle from './components/ModeToggle'
import PhotoReveal from './components/PhotoReveal'
import ResultModal from './components/ResultModal'
import RoundSummary from './components/RoundSummary'
import SegmentedControl from './components/SegmentedControl'
import StatsModal from './components/StatsModal'
import TimerBar from './components/TimerBar'

// variant: which game this page plays, see src/variants
function App({ variant }) {
    const game = useGame(variant)
    const { round, finished } = game
    const { answer, status, guesses } = round
    const pool = variant.pools.find(p => p.value === round.pool)

    const [loadedImage, setLoadedImage] = useState(null)
    const imageReady = loadedImage === answer.image
    const canToggle = imageReady && !finished

    // 'help' | 'stats' | 'result' | null
    const helpSeenKey = `${variant.storagePrefix}:help-seen`
    const [modal, setModal] = useState(() => (load(helpSeenKey, false) ? null : 'help'))
    const closeModal = useCallback(() => {
        if (modal === 'help') save(helpSeenKey, true)
        setModal(null)
    }, [modal, helpSeenKey])

    const guessedIds = useMemo(() => new Set(guesses.map(g => g.id)), [guesses])
    // Free play only searches the pool it deals from
    const searchItems = useMemo(() => (pool?.filter ? variant.items.filter(pool.filter) : variant.items), [variant, pool])

    // Let the last tiles fade out before the result pops up
    useEffect(() => {
        if (!game.lastFinished) return
        const timeout = setTimeout(() => setModal('result'), 900)
        return () => clearTimeout(timeout)
    }, [game.lastFinished])

    // Start loading the next free play photo while this round's result is showing
    useEffect(() => {
        if (finished && round.kind === 'free') new Image().src = variant.deck.peek(game.preferredPool).image
    }, [finished, round.kind, game.preferredPool, variant])

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
        <VariantContext.Provider value={variant}>
            <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,#1c2433_0%,#111111_55%)]">
                <main className="mx-auto w-full max-w-3xl px-4 pb-20">
                    <Header onHelp={() => setModal('help')} onStats={() => setModal('stats')} />

                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <SegmentedControl label="Game type" options={viewOptions} value={game.view} onChange={game.switchView} />
                            {game.view === 'free' && (
                                <SegmentedControl label="Pool" options={variant.pools} value={game.preferredPool} onChange={game.changePool} />
                            )}
                        </div>
                        <ModeToggle
                            mode={game.preferredMode}
                            inProgress={game.inProgress}
                            locked={game.modeLocked}
                            onChange={game.changeMode}
                        />
                    </div>

                    <section className={`rounded-2xl shadow-2xl shadow-black/50 ring-1 ring-white/10 ${variant.frame.width}`}>
                        <PhotoReveal
                            // remount per round so tiles start opaque instead of fading back in over the new photo
                            key={round.key}
                            answer={answer}
                            tileOrder={round.tileOrder}
                            revealedCount={game.revealedCount}
                            status={status}
                            imageReady={imageReady}
                            onImageLoad={setLoadedImage}
                            onStart={game.toggle}
                            caption={round.kind === 'daily' ? `Daily #${round.day}` : pool?.caption ? `Free play · ${pool.caption}` : 'Free play'}
                        />
                        <TimerBar remaining={1 - round.elapsed / ROUND_MS} />
                        <GuessPips
                            guesses={guesses}
                            answer={answer}
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
                        <GuessSearch items={searchItems} guessedIds={guessedIds} onGuess={game.guess} onGiveUp={game.giveUp} />
                    )}
                    {finished && (
                        <RoundSummary
                            round={round}
                            onShowResult={() => setModal('result')}
                            onNext={nextFreeRound}
                            onNewDay={refreshDaily}
                        />
                    )}

                    <GuessList guesses={guesses} answer={answer} mode={round.mode} />
                </main>

                {game.lastFinished?.won && (
                    <Confetti key={game.lastFinished.key} count={game.lastFinished.perfect ? 180 : 90} />
                )}

                {modal === 'result' && finished && (
                    <ResultModal round={round} onClose={closeModal} onNext={nextFreeRound} onNewDay={refreshDaily} />
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
        </VariantContext.Provider>
    )
}

export default App
