import { useEffect, useState } from 'react'

// Counts from one year to another when the answer is revealed; jumps straight there for reduced-motion users
function useYearReveal(from, to, active, duration = 600) {
    const [value, setValue] = useState(from)

    useEffect(() => {
        if (!active) return
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const start = performance.now()
        let frame
        const step = now => {
            const t = reduced ? 1 : Math.min(1, (now - start) / duration)
            setValue(Math.round(from + (to - from) * (1 - (1 - t) ** 3)))
            if (t < 1) frame = requestAnimationFrame(step)
        }
        frame = requestAnimationFrame(step)
        return () => cancelAnimationFrame(frame)
    }, [from, to, active, duration])

    return active ? value : from
}

const RESULT_STYLES = {
    correct: { ring: 'ring-2 ring-emerald-500', year: 'text-emerald-400' },
    wrong: { ring: 'ring-2 ring-red-500', year: 'text-red-400' },
}

// badge: the label in the corner. hideYear: show "?" until it's revealed.
// result: 'correct' | 'wrong' once revealed, and the year counts up from revealFrom.
function CarCard({ car, badge, hideYear = false, result = null, revealFrom }) {
    const [loaded, setLoaded] = useState(false)
    const year = useYearReveal(revealFrom ?? car.yearNumber, car.yearNumber, result !== null)
    const styles = RESULT_STYLES[result]

    return (
        <article
            className={`animate-fade-in relative aspect-[2/1] overflow-hidden sm:aspect-video lg:aspect-[3/2] rounded-2xl bg-zinc-950 shadow-2xl shadow-black/50 transition ${
                styles?.ring ?? 'ring-1 ring-white/10'
            }`}
        >
            <img
                src={car.image}
                alt={car.label}
                onLoad={() => setLoaded(true)}
                draggable={false}
                className={`h-full w-full object-cover select-none transition-opacity duration-300 ${loaded ? '' : 'opacity-0'}`}
            />
            {!loaded && <div className="absolute inset-0 animate-pulse bg-zinc-900" aria-hidden />}

            <span className="absolute top-2.5 left-2.5 rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-semibold tracking-wider text-zinc-200 uppercase backdrop-blur-sm">
                {badge}
            </span>

            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-3.5 pt-10 pb-3 sm:px-4">
                <div className="min-w-0">
                    <div className="truncate text-xs font-medium text-zinc-300 sm:text-sm">{car.make}</div>
                    <div className="truncate text-base font-bold sm:text-lg">{car.model}</div>
                </div>
                {hideYear && result === null ? (
                    <span
                        className="grid h-9 w-16 shrink-0 place-items-center rounded-lg border-2 border-dashed border-zinc-500 text-xl font-extrabold text-zinc-400 sm:h-10 sm:w-20 sm:text-2xl"
                        aria-label="Year hidden"
                    >
                        ?
                    </span>
                ) : (
                    <span className={`shrink-0 text-3xl font-extrabold tracking-tight tabular-nums sm:text-4xl ${styles?.year ?? ''}`}>
                        {year}
                    </span>
                )}
            </div>
        </article>
    )
}

export default CarCard
