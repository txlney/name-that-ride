import { useEffect, useReducer, useState } from 'react'
import cars from '../cars'
import { range, shuffle } from '../utils'
import { MAX_GUESSES, MAX_SCORE, MODES, ROUND_MS, TILE_COUNT } from './constants'
import { dailyCar, dailyTileOrder, dayNumber } from './daily'
import { drawCar } from './deck'
import { guessPoints, photoPoints } from './scoring'
import { normalizeStats, recordRound } from './stats'
import { load, save } from './storage'

const TICK_MS = 100
const KEYS = { mode: 'ntr:mode', view: 'ntr:view', daily: 'ntr:daily', stats: 'ntr:stats' }
const STATUSES = ['ready', 'running', 'paused', 'won', 'lost']
const carsById = new Map(cars.map(car => [car.id, car]))

export const isFinished = round => round.status === 'won' || round.status === 'lost'
export const isInProgress = round => round.status === 'running' || round.status === 'paused'

// ---- rounds ----------------------------------------------------------------
// status: ready -> running <-> paused -> won | lost

function baseRound(fields) {
    return { guesses: [], elapsed: 0, status: 'ready', score: 0, photoPoints: 0, guessPoints: 0, ...fields }
}

let freeRoundCount = 0

function createFreeRound(mode) {
    return baseRound({
        key: `free-${freeRoundCount++}`,
        kind: 'free',
        mode,
        car: drawCar(),
        tileOrder: shuffle(range(TILE_COUNT)),
    })
}

function createDailyRound(day, mode) {
    return baseRound({
        key: `daily-${day}`,
        kind: 'daily',
        day,
        mode,
        car: dailyCar(day),
        tileOrder: dailyTileOrder(day),
    })
}

// Brings back today's daily exactly as it was left, so reloading can't be used for a fresh look
function restoreDailyRound(day, mode) {
    const fresh = createDailyRound(day, mode)
    const saved = load(KEYS.daily, null)
    if (!saved || saved.day !== day || saved.carId !== fresh.car.id) return fresh
    if (!MODES.includes(saved.mode) || !STATUSES.includes(saved.status)) return fresh
    return {
        ...fresh,
        mode: saved.mode,
        guesses: saved.guessIds.map(id => carsById.get(id)).filter(Boolean),
        elapsed: saved.elapsed,
        status: saved.status === 'running' ? 'paused' : saved.status,
        score: saved.score,
        photoPoints: saved.photoPoints,
        guessPoints: saved.guessPoints,
    }
}

function serializeDaily(round) {
    return {
        day: round.day,
        carId: round.car.id,
        mode: round.mode,
        guessIds: round.guesses.map(g => g.id),
        elapsed: round.elapsed,
        status: round.status,
        score: round.score,
        photoPoints: round.photoPoints,
        guessPoints: round.guessPoints,
    }
}

function roundReducer(round, action) {
    switch (action.type) {
        case 'toggle':
            if (round.status === 'running') return { ...round, status: 'paused' }
            if (round.status === 'ready' || round.status === 'paused') return { ...round, status: 'running' }
            return round

        case 'tick': {
            if (round.status !== 'running') return round
            const elapsed = Math.min(round.elapsed + action.delta, ROUND_MS)
            return { ...round, elapsed, status: elapsed >= ROUND_MS ? 'lost' : 'running' }
        }

        case 'guess': {
            if (round.status !== 'paused') return round
            const guesses = [...round.guesses, action.car]
            if (action.car.id === round.car.id) {
                const photo = photoPoints(round.elapsed)
                const guess = guessPoints(guesses.length)
                return { ...round, guesses, status: 'won', photoPoints: photo, guessPoints: guess, score: photo + guess }
            }
            return { ...round, guesses, status: guesses.length >= MAX_GUESSES ? 'lost' : 'paused' }
        }

        case 'giveUp':
            return round.status === 'paused' ? { ...round, status: 'lost' } : round

        default:
            return round
    }
}

// ---- game state --------------------------------------------------------------
// Daily and free play each keep their own round, so switching tabs doesn't lose either

function reducer(state, action) {
    switch (action.type) {
        case 'setView': {
            const current = state[state.view]
            const paused = current.status === 'running' ? { ...current, status: 'paused' } : current
            return { ...state, [state.view]: paused, view: action.view, ...(action.daily && { daily: action.daily }) }
        }

        case 'newFreeRound':
            return { ...state, free: action.round }

        case 'setDaily':
            return { ...state, daily: action.round }

        // Rounds that haven't started take the new mode; in-progress rounds are handled by the caller
        case 'setMode': {
            const adopt = round => (round.status === 'ready' ? { ...round, mode: action.mode } : round)
            return { ...state, free: adopt(state.free), daily: adopt(state.daily) }
        }

        default: {
            const before = state[state.view]
            const after = roundReducer(before, action)
            if (after === before) return state
            const next = { ...state, [state.view]: after }
            // Recording stats here (not in an effect) guarantees each round is counted exactly once
            if (!isFinished(before) && isFinished(after)) {
                next.stats = recordRound(state.stats, after)
                next.lastFinished = { key: after.key, won: after.status === 'won', perfect: after.score === MAX_SCORE }
            }
            return next
        }
    }
}

function loadMode() {
    const mode = load(KEYS.mode, 'regular')
    return MODES.includes(mode) ? mode : 'regular'
}

function initState(mode) {
    return {
        view: load(KEYS.view, 'daily') === 'free' ? 'free' : 'daily',
        free: createFreeRound(mode),
        daily: restoreDailyRound(dayNumber(new Date()), mode),
        stats: normalizeStats(load(KEYS.stats, null)),
        lastFinished: null,
    }
}

export function useGame() {
    const [preferredMode, setPreferredMode] = useState(loadMode)
    const [state, dispatch] = useReducer(reducer, preferredMode, initState)
    const round = state[state.view]
    const running = round.status === 'running'

    // A single clock drives both the tile reveal and the timer bar.
    // Uses real elapsed time so throttled intervals don't slow the round down.
    useEffect(() => {
        if (!running) return
        let last = performance.now()
        const id = setInterval(() => {
            const now = performance.now()
            dispatch({ type: 'tick', delta: now - last })
            last = now
        }, TICK_MS)
        return () => clearInterval(id)
    }, [running])

    useEffect(() => save(KEYS.daily, serializeDaily(state.daily)), [state.daily])
    useEffect(() => save(KEYS.stats, state.stats), [state.stats])
    useEffect(() => save(KEYS.view, state.view), [state.view])

    const finished = isFinished(round)
    const inProgress = isInProgress(round)

    function changeMode(mode) {
        // Replaying today's daily car would give away the answer, so its mode is locked once started
        if (mode === preferredMode || (round.kind === 'daily' && inProgress)) return
        setPreferredMode(mode)
        save(KEYS.mode, mode)
        dispatch({ type: 'setMode', mode })
        // Switching mid-round in free play restarts with a new car
        if (round.kind === 'free' && inProgress) dispatch({ type: 'newFreeRound', round: createFreeRound(mode) })
    }

    function switchView(view) {
        if (view === state.view) return
        const today = dayNumber(new Date())
        const daily = view === 'daily' && state.daily.day !== today ? createDailyRound(today, preferredMode) : null
        dispatch({ type: 'setView', view, daily })
    }

    return {
        view: state.view,
        round,
        dailyRound: state.daily,
        stats: state.stats,
        lastFinished: state.lastFinished,
        preferredMode,
        finished,
        inProgress,
        modeLocked: round.kind === 'daily' && inProgress,
        revealedCount: finished ? TILE_COUNT : Math.floor((round.elapsed / ROUND_MS) * TILE_COUNT),
        toggle: () => dispatch({ type: 'toggle' }),
        guess: car => dispatch({ type: 'guess', car }),
        giveUp: () => dispatch({ type: 'giveUp' }),
        nextFreeRound: () => dispatch({ type: 'newFreeRound', round: createFreeRound(preferredMode) }),
        refreshDaily: () => {
            const today = dayNumber(new Date())
            if (state.daily.day !== today) dispatch({ type: 'setDaily', round: createDailyRound(today, preferredMode) })
        },
        changeMode,
        switchView,
    }
}
