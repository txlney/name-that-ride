import { useState } from 'react'
import { IoFlame } from 'react-icons/io5'
import Modal from '../components/Modal'
import SegmentedControl from '../components/SegmentedControl'
import { DAILY_LENGTH } from './chain'
import { currentDailyStreak } from './stats'

const VIEW_OPTIONS = [
    { value: 'daily', label: 'Daily' },
    { value: 'free', label: 'Endless' },
]

// highlight: the daily score just finished, so its bar stands out
function StatsModal({ stats, today, pools, initialView, highlight, onClose }) {
    const [view, setView] = useState(initialView)
    const daily = stats.daily
    const dailyStreak = currentDailyStreak(daily, today)
    const average = daily.played ? (daily.totalCorrect / daily.played).toFixed(1) : '0'
    const maxBar = Math.max(1, ...daily.distribution)

    return (
        <Modal title="Statistics" onClose={onClose}>
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-gradient-to-r from-orange-500/15 to-transparent p-3 ring-1 ring-orange-400/20">
                <IoFlame size={28} className={dailyStreak > 0 ? 'text-orange-400' : 'text-zinc-600'} />
                <div>
                    <div className="font-semibold">Daily streak: {dailyStreak}</div>
                    <div className="text-xs text-zinc-400">Best: {daily.bestStreak}. Play the daily every day to keep it going.</div>
                </div>
            </div>

            <div className="mt-5 flex justify-center">
                <SegmentedControl label="Stats for" options={VIEW_OPTIONS} value={view} onChange={setView} />
            </div>

            {view === 'daily' ? (
                <>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                        <Tile value={daily.played} label="Played" />
                        <Tile value={average} label={`Average / ${DAILY_LENGTH}`} />
                        <Tile value={daily.distribution[DAILY_LENGTH]} label="Perfects" />
                    </div>

                    <h3 className="mt-6 mb-2 text-sm font-semibold text-zinc-400">Score distribution</h3>
                    <div className="space-y-1">
                        {daily.distribution.map((count, score) => ({ count, score })).reverse().map(({ count, score }) => (
                            <div key={score} className="flex items-center gap-2 text-sm">
                                <span className="w-5 text-right text-zinc-500 tabular-nums">{score}</span>
                                <div className="flex-1">
                                    <div
                                        className={`min-w-7 rounded px-2 py-0.5 text-right text-xs font-semibold tabular-nums transition-[width] ${
                                            highlight === score ? 'bg-emerald-500 text-emerald-950' : 'bg-zinc-800'
                                        }`}
                                        style={{ width: `${(count / maxBar) * 100}%` }}
                                    >
                                        {count}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="mt-4 space-y-3">
                    {pools.map(pool => {
                        const s = stats.free[pool.value]
                        return (
                            <div key={pool.value}>
                                <h3 className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-zinc-400">{pool.label}</h3>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <Tile value={s.runs} label="Runs" />
                                    <Tile value={s.best} label="Best streak" />
                                    <Tile value={s.runs ? (s.total / s.runs).toFixed(1) : '0'} label="Average" />
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </Modal>
    )
}

function Tile({ value, label }) {
    return (
        <div className="rounded-lg bg-zinc-950 px-1 py-3">
            <div className="text-xl font-bold tabular-nums">{value}</div>
            <div className="text-[11px] text-zinc-500">{label}</div>
        </div>
    )
}

export default StatsModal
