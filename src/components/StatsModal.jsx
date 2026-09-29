import { useState } from 'react'
import { IoFlame } from 'react-icons/io5'
import { currentDailyStreak } from '../game/stats'
import Modal from './Modal'
import SegmentedControl from './SegmentedControl'

const MODE_OPTIONS = [
    { value: 'regular', label: 'Regular' },
    { value: 'hard', label: 'Hard', activeClass: 'bg-red-500 text-white' },
]

// highlight: { mode, guesses } for the round just won, so its bar stands out
function StatsModal({ stats, today, initialMode, highlight, onClose }) {
    const [mode, setMode] = useState(initialMode)
    const s = stats[mode]
    const winRate = s.played ? Math.round((s.wins / s.played) * 100) : 0
    const average = s.played ? Math.round(s.totalScore / s.played) : 0
    const maxBar = Math.max(1, ...s.distribution)
    const dailyStreak = currentDailyStreak(stats.daily, today)

    return (
        <Modal title="Statistics" onClose={onClose}>
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-gradient-to-r from-orange-500/15 to-transparent p-3 ring-1 ring-orange-400/20">
                <IoFlame size={28} className={dailyStreak > 0 ? 'text-orange-400' : 'text-zinc-600'} />
                <div>
                    <div className="font-semibold">Daily streak: {dailyStreak}</div>
                    <div className="text-xs text-zinc-400">Best: {stats.daily.bestStreak}. Win the daily every day to keep it going.</div>
                </div>
            </div>

            <div className="mt-5 flex justify-center">
                <SegmentedControl label="Stats for mode" options={MODE_OPTIONS} value={mode} onChange={setMode} />
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                <Tile value={s.played} label="Played" />
                <Tile value={`${winRate}%`} label="Win rate" />
                <Tile value={s.streak} label="Streak" />
                <Tile value={s.bestStreak} label="Best streak" />
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <Tile value={s.bestScore.toLocaleString()} label="Best score" />
                <Tile value={average.toLocaleString()} label="Average score" />
                <Tile value={s.perfects} label="Perfects" />
            </div>

            <h3 className="mt-6 mb-2 text-sm font-semibold text-zinc-400">Guess distribution</h3>
            <div className="space-y-1.5">
                {s.distribution.map((count, i) => {
                    const lit = highlight?.mode === mode && highlight.guesses === i + 1
                    return (
                        <div key={i} className="flex items-center gap-2 text-sm">
                            <span className="w-3 text-zinc-500 tabular-nums">{i + 1}</span>
                            <div className="flex-1">
                                <div
                                    className={`min-w-7 rounded px-2 py-0.5 text-right font-semibold tabular-nums transition-[width] ${lit ? 'bg-emerald-500 text-emerald-950' : 'bg-zinc-800'}`}
                                    style={{ width: `${(count / maxBar) * 100}%` }}
                                >
                                    {count}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
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
