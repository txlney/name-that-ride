import { useEffect, useReducer, useState } from 'react'
import carsVariant from '../variants/cars'
import { dayNumber } from '../game/daily'
import { load, save } from '../game/storage'
import { DAILY_LENGTH, dailyChain, extendChain, isNewer, poolCars } from './chain'
import { correctCount, normalizeStats, recordRun } from './stats'

// How long the answer shows before the next pair slides in
export const REVEAL_MS = 1400
// A new endless best only gets confetti once it's at least this long
const CELEBRATE_BEST = 5

export const pools = carsVariant.pools
const keys = { pool: 'hl:pool', view: 'hl:view', daily: 'hl:daily', stats: 'hl:stats' }
const DIRECTIONS = ['newer', 'older']

// ---- runs ------------------------------------------------------------------
// A run is a chain of cars. Each guess compares chain[step + 1] with chain[step].
// phase: guessing -> revealing -> guessing ... -> over

let freeRunCount = 0

const findPool = value => pools.find(p => p.value === value)

function createFreeRun(pool) {
    // Two cars to play plus one more, so the next photo can load while this pair is on screen
    return { key: `free-${freeRunCount++}`, kind: 'free', pool, chain: extendChain([], 3, poolCars(findPool(pool))), guesses: [], phase: 'guessing' }
}

function judge(chain, step, direction) {
    return { direction, correct: (direction === 'newer') === isNewer(chain[step + 1], chain[step]) }
}

function createDailyRun(day) {
    return { key: `daily-${day}`, kind: 'daily', day, chain: dailyChain(day), guesses: [], phase: 'guessing' }
}

// Brings back today's daily exactly as it was left, so reloading can't be used for a second go
function restoreDailyRun(day) {
    const fresh = createDailyRun(day)
    const saved = load(keys.daily, null)
    if (!saved || saved.day !== day || saved.firstId !== fresh.chain[0].id || !Array.isArray(saved.directions)) return fresh
    const directions = saved.directions.filter(d => DIRECTIONS.includes(d)).slice(0, DAILY_LENGTH)
    const guesses = directions.map((direction, step) => judge(fresh.chain, step, direction))
    // A run left mid-reveal finishes revealing, so a final guess still gets counted in the stats
    const phase = saved.phase === 'revealing' && guesses.length > 0 ? 'revealing' : guesses.length >= DAILY_LENGTH ? 'over' : 'guessing'
    return { ...fresh, guesses, phase }
}

function serializeDaily(run) {
    return { day: run.day, firstId: run.chain[0].id, directions: run.guesses.map(g => g.direction), phase: run.phase }
}

function loadPool() {
    const pool = load(keys.pool, 'all')
    return findPool(pool) ? pool : 'all'
}

function initState(pool) {
    return {
        view: load(keys.view, 'daily') === 'free' ? 'free' : 'daily',
        free: createFreeRun(pool),
        daily: restoreDailyRun(dayNumber(new Date())),
        stats: normalizeStats(load(keys.stats, null), pools),
        lastFinished: null,
    }
}

// ---- game state --------------------------------------------------------------
// Daily and endless each keep their own run, so switching tabs doesn't lose either

function reducer(state, action) {
    switch (action.type) {
        case 'setView':
            return { ...state, view: action.view, ...(action.daily && { daily: action.daily }) }

        case 'newFreeRun':
            return { ...state, free: action.run }

        case 'setDaily':
            return { ...state, daily: action.run }

        case 'guess': {
            const run = state[state.view]
            if (run.phase !== 'guessing') return state
            const guess = judge(run.chain, run.guesses.length, action.direction)
            const chain = action.extra ? [...run.chain, action.extra] : run.chain
            return { ...state, [state.view]: { ...run, chain, guesses: [...run.guesses, guess], phase: 'revealing' } }
        }

        case 'advance': {
            const view = ['daily', 'free'].find(v => state[v].key === action.key)
            const run = view && state[view]
            if (!run || run.phase !== 'revealing') return state
            const over = run.kind === 'daily' ? run.guesses.length >= DAILY_LENGTH : !run.guesses.at(-1).correct
            if (!over) return { ...state, [view]: { ...run, phase: 'guessing' } }

            const correct = correctCount(run)
            const newBest = run.kind === 'free' && correct > 0 && correct > state.stats.free[run.pool].best
            const finished = { ...run, phase: 'over', newBest }
            // Recording stats here (not in an effect) guarantees each run is counted exactly once
            return {
                ...state,
                [view]: finished,
                stats: recordRun(state.stats, finished),
                lastFinished: { key: run.key, celebrate: (newBest && correct >= CELEBRATE_BEST) || (run.kind === 'daily' && correct === DAILY_LENGTH) },
            }
        }

        default:
            return state
    }
}

export function useHigherLower() {
    const [preferredPool, setPreferredPool] = useState(loadPool)
    const [state, dispatch] = useReducer(reducer, preferredPool, initState)
    const run = state[state.view]
    const step = run.guesses.length

    // Show the answer for a moment, then move on to the next pair (or end the run)
    useEffect(() => {
        if (run.phase !== 'revealing') return
        const timeout = setTimeout(() => dispatch({ type: 'advance', key: run.key }), REVEAL_MS)
        return () => clearTimeout(timeout)
    }, [run.phase, run.key, step])

    useEffect(() => save(keys.daily, serializeDaily(state.daily)), [state.daily])
    useEffect(() => save(keys.stats, state.stats), [state.stats])
    useEffect(() => save(keys.view, state.view), [state.view])

    function guess(direction) {
        if (run.phase !== 'guessing') return
        // Endless picks its next car now (randomness stays out of the reducer), keeping one ready to preload
        const extra = run.kind === 'free' ? extendChain(run.chain, 1, poolCars(findPool(run.pool))).at(-1) : null
        dispatch({ type: 'guess', direction, extra })
    }

    function changePool(pool) {
        if (pool === preferredPool) return
        setPreferredPool(pool)
        save(keys.pool, pool)
        // An unfinished run restarts with cars from the new pool; a finished one keeps showing its result
        if (state.free.phase !== 'over') dispatch({ type: 'newFreeRun', run: createFreeRun(pool) })
    }

    function switchView(view) {
        if (view === state.view) return
        const today = dayNumber(new Date())
        const daily = view === 'daily' && state.daily.day !== today ? createDailyRun(today) : null
        dispatch({ type: 'setView', view, daily })
    }

    // While revealing, the pair on screen is the one just guessed
    const pairStep = run.phase === 'guessing' ? step : step - 1

    return {
        view: state.view,
        run,
        dailyRun: state.daily,
        stats: state.stats,
        lastFinished: state.lastFinished,
        preferredPool,
        reference: run.chain[pairStep],
        challenger: run.chain[pairStep + 1],
        // Shown on screen next, so it can start loading now
        upcoming: run.chain[pairStep + 2],
        lastGuess: run.phase === 'guessing' ? null : run.guesses.at(-1),
        guess,
        changePool,
        switchView,
        playAgain: () => dispatch({ type: 'newFreeRun', run: createFreeRun(preferredPool) }),
        refreshDaily: () => {
            const today = dayNumber(new Date())
            if (state.daily.day !== today) dispatch({ type: 'setDaily', run: createDailyRun(today) })
        },
    }
}
