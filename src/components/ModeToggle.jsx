import SegmentedControl from './SegmentedControl'

const OPTIONS = [
    { value: 'regular', label: 'Regular', title: 'Guessing the right make turns the guess yellow' },
    { value: 'hard', label: 'Hard', title: 'No hints', activeClass: 'bg-red-500 text-white' },
]

function ModeToggle({ mode, inProgress, locked, onChange }) {
    return (
        <div className="flex items-center justify-end gap-3">
            {locked && <span className="text-xs text-zinc-500">Locked for today's daily</span>}
            {inProgress && !locked && <span className="hidden text-xs text-zinc-500 sm:inline">Switching restarts</span>}
            <SegmentedControl label="Game mode" options={OPTIONS} value={mode} onChange={onChange} disabled={locked} />
        </div>
    )
}

export default ModeToggle
