function TimerBar({ remaining }) {
    const percent = Math.max(0, remaining) * 100

    return (
        <div
            className="h-1.5 w-full bg-zinc-900"
            role="progressbar"
            aria-label="Time remaining"
            aria-valuenow={Math.round(percent)}
            aria-valuemin={0}
            aria-valuemax={100}
        >
            <div
                className={`h-full transition-[width] duration-100 ease-linear ${percent < 20 ? 'bg-red-500' : 'bg-emerald-500'}`}
                style={{ width: `${percent}%` }}
            />
        </div>
    )
}

export default TimerBar
