import { useEffect, useState } from 'react'
import { dayNumber, msUntilTomorrow } from '../game/daily'

function format(ms) {
    const total = Math.floor(ms / 1000)
    const pad = n => String(n).padStart(2, '0')
    return `${pad(Math.floor(total / 3600))}:${pad(Math.floor(total / 60) % 60)}:${pad(total % 60)}`
}

// Time left until the next daily; calls onNewDay once the date rolls over
function Countdown({ day, onNewDay }) {
    const [now, setNow] = useState(() => Date.now())

    useEffect(() => {
        const id = setInterval(() => {
            const time = Date.now()
            setNow(time)
            if (dayNumber(new Date(time)) !== day) onNewDay()
        }, 1000)
        return () => clearInterval(id)
    }, [day, onNewDay])

    return <span className="tabular-nums">{format(msUntilTomorrow(new Date(now)))}</span>
}

export default Countdown
