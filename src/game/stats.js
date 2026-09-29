import { MAX_GUESSES, MAX_SCORE, MODES } from './constants'

function emptyModeStats() {
    return {
        played: 0,
        wins: 0,
        streak: 0,
        bestStreak: 0,
        bestScore: 0,
        totalScore: 0,
        perfects: 0,
        distribution: Array(MAX_GUESSES).fill(0),
    }
}

function emptyStats() {
    return {
        regular: emptyModeStats(),
        hard: emptyModeStats(),
        daily: { streak: 0, bestStreak: 0, lastWonDay: null },
    }
}

// Fills any gaps in saved stats so older or damaged saves still load
export function normalizeStats(saved) {
    const stats = emptyStats()
    if (!saved || typeof saved !== 'object') return stats
    for (const mode of MODES) Object.assign(stats[mode], saved[mode])
    Object.assign(stats.daily, saved.daily)
    return stats
}

export function recordRound(stats, round) {
    const won = round.status === 'won'
    const prev = stats[round.mode]
    const streak = won ? prev.streak + 1 : 0
    const distribution = [...prev.distribution]
    if (won) distribution[round.guesses.length - 1]++

    const next = {
        ...stats,
        [round.mode]: {
            played: prev.played + 1,
            wins: prev.wins + (won ? 1 : 0),
            streak,
            bestStreak: Math.max(prev.bestStreak, streak),
            bestScore: Math.max(prev.bestScore, round.score),
            totalScore: prev.totalScore + round.score,
            perfects: prev.perfects + (round.score === MAX_SCORE ? 1 : 0),
            distribution,
        },
    }

    if (round.kind === 'daily') {
        const daily = stats.daily
        const dailyStreak = won ? (daily.lastWonDay === round.day - 1 ? daily.streak + 1 : 1) : 0
        next.daily = {
            streak: dailyStreak,
            bestStreak: Math.max(daily.bestStreak, dailyStreak),
            lastWonDay: won ? round.day : daily.lastWonDay,
        }
    }

    return next
}

// A streak still counts until a whole day is missed
export function currentDailyStreak(daily, today) {
    return daily.lastWonDay !== null && daily.lastWonDay >= today - 1 ? daily.streak : 0
}
