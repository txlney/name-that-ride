// A pill-shaped radio group. Each option: { value, label, title?, activeClass? }
function SegmentedControl({ label, options, value, onChange, disabled = false }) {
    return (
        <div role="radiogroup" aria-label={label} className="flex rounded-full bg-zinc-900 p-1 text-sm ring-1 ring-white/5">
            {options.map(option => {
                const active = option.value === value
                return (
                    <button
                        key={option.value}
                        role="radio"
                        aria-checked={active}
                        title={option.title}
                        disabled={disabled}
                        onClick={() => onChange(option.value)}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-medium transition enabled:cursor-pointer disabled:cursor-not-allowed ${
                            active
                                ? option.activeClass ?? 'bg-blue-400 text-blue-950'
                                : 'text-zinc-400 enabled:hover:text-white disabled:opacity-40'
                        }`}
                    >
                        {option.label}
                    </button>
                )
            })}
        </div>
    )
}

export default SegmentedControl
