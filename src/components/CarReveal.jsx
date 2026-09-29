import { useMemo } from 'react'
import { FaPlay } from 'react-icons/fa'
import { GRID_SIZE } from '../game/constants'

function CarReveal({ car, tileOrder, revealedCount, status, imageReady, onImageLoad, onStart, caption }) {
    // revealRank[tile] = the order in which that tile uncovers
    const revealRank = useMemo(() => {
        const rank = []
        tileOrder.forEach((tile, order) => { rank[tile] = order })
        return rank
    }, [tileOrder])

    const finished = status === 'won' || status === 'lost'

    return (
        <div className="relative aspect-video w-full overflow-hidden rounded-t-2xl bg-zinc-950">
            <img
                src={car.image}
                alt={finished ? car.label : 'Hidden car'}
                onLoad={() => onImageLoad(car.image)}
                draggable={false}
                className="h-full w-full object-cover select-none"
            />

            <div
                className="absolute inset-0 grid"
                style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)` }}
                aria-hidden="true"
            >
                {revealRank.map((rank, tile) => (
                    <div
                        key={tile}
                        // the outline covers sub-pixel seams between neighbouring tiles
                        style={{ outline: '1px solid var(--color-zinc-950)' }}
                        className={`bg-zinc-950 transition-opacity duration-500 ${rank < revealedCount ? 'opacity-0' : ''}`}
                    />
                ))}
            </div>

            {status === 'ready' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-[radial-gradient(ellipse_at_center,rgba(96,165,250,0.12),transparent_65%)] px-4 text-center">
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300/80">{caption}</div>
                        <div className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">Guess the hidden car</div>
                    </div>
                    <button
                        onClick={onStart}
                        disabled={!imageReady}
                        className="flex cursor-pointer items-center gap-3 rounded-full bg-blue-400 px-7 py-3 font-semibold text-blue-950 shadow-lg shadow-blue-500/25 transition enabled:hover:-translate-y-px enabled:hover:bg-blue-300 disabled:cursor-wait disabled:opacity-50"
                    >
                        <FaPlay size={14} />
                        {imageReady ? 'Start' : 'Loading…'}
                    </button>
                </div>
            )}
        </div>
    )
}

export default CarReveal
