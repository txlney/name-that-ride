import { useState } from 'react'
import { range } from '../utils'

const COLORS = ['#60a5fa', '#34d399', '#facc15', '#f87171', '#c084fc', '#ffffff']

function makePieces(count) {
    return range(count).map(i => ({
        left: Math.random() * 100,
        size: 6 + Math.random() * 6,
        delay: Math.random() * 0.4,
        duration: 2 + Math.random() * 1.5,
        drift: (Math.random() - 0.5) * 240,
        spin: (Math.random() - 0.5) * 1440,
        color: COLORS[i % COLORS.length],
    }))
}

// One-shot burst; remount with a new key to play it again. Hidden for reduced-motion users.
function Confetti({ count = 90 }) {
    const [pieces] = useState(() => makePieces(count))

    return (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[60] overflow-hidden motion-reduce:hidden">
            {pieces.map((p, i) => (
                <span
                    key={i}
                    className="animate-confetti absolute -top-4 block rounded-[2px]"
                    style={{
                        left: `${p.left}%`,
                        width: p.size,
                        height: p.size * 0.6,
                        backgroundColor: p.color,
                        animationDelay: `${p.delay}s`,
                        animationDuration: `${p.duration}s`,
                        '--drift': `${p.drift}px`,
                        '--spin': `${p.spin}deg`,
                    }}
                />
            ))}
        </div>
    )
}

export default Confetti
