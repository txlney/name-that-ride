import { DAILY_LENGTH } from './chain'

function emptyPoolStats() {
    return { runs: 0, best: 0, total: 0 }
}

function emptyStats(pools) {
    return {
        // distribution[n] = dailies finished with n right
        daily: { played: 0, totalCorrect: 0, distribution: Array(DAILY_LENGTH + 1).fill(0), streak: 0, bestStreak: 0, lastPlayedDay: null },
        free: Object.fromEntries(pools.map(pool => [pool.value, emptyPoolStats()])),
    }
}

// Fills any gaps in saved stats so older or damaged saves still load
export function normalizeStats(saved, pools) {
    const stats = emptyStats(pools)
    if (!saved || typeof saved !== 'object') return stats
    Object.assign(stats.daily, saved.daily)
    for (const pool of pools) Object.assign(stats.free[pool.value], saved.free?.[pool.value])
    return stats
}

export const correctCount = run => run.guesses.filter(g => g.correct).length

export function recordRun(stats, run) {
    const correct = correctCount(run)

    if (run.kind === 'daily') {
        const prev = stats.daily
        const distribution = [...prev.distribution]
        distribution[correct]++
        // A streak of days played in a row
        const streak = prev.lastPlayedDay === run.day - 1 ? prev.streak + 1 : 1
        return {
            ...stats,
            daily: {
                played: prev.played + 1,
                totalCorrect: prev.totalCorrect + correct,
                distribution,
                streak,
                bestStreak: Math.max(prev.bestStreak, streak),
                lastPlayedDay: run.day,
            },
        }
    }

    const prev = stats.free[run.pool]
    return {
        ...stats,
        free: { ...stats.free, [run.pool]: { runs: prev.runs + 1, best: Math.max(prev.best, correct), total: prev.total + correct } },
    }
}

// A streak still counts until a whole day is missed
export function currentDailyStreak(daily, today) {
    return daily.lastPlayedDay !== null && daily.lastPlayedDay >= today - 1 ? daily.streak : 0
}
