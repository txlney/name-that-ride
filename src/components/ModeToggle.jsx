import { useVariant } from '../game/variant'
import SegmentedControl from './SegmentedControl'

function ModeToggle({ mode, inProgress, locked, onChange }) {
    const { regularTitle } = useVariant()
    const options = [
        { value: 'regular', label: 'Regular', title: regularTitle },
        { value: 'hard', label: 'Hard', title: 'No hints', activeClass: 'bg-red-500 text-white' },
    ]

    return (
        <div className="flex items-center justify-end gap-3">
            {locked && <span className="text-xs text-zinc-500">Locked for today's daily</span>}
            {inProgress && !locked && <span className="hidden text-xs text-zinc-500 sm:inline">Switching restarts</span>}
            <SegmentedControl label="Game mode" options={options} value={mode} onChange={onChange} disabled={locked} />
        </div>
    )
}

export default ModeToggle
