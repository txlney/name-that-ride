import { IoHelpCircleOutline, IoStatsChart } from 'react-icons/io5'
import { useVariant } from '../game/variant'

const iconButton = 'cursor-pointer rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white'

function Header({ onHelp, onStats }) {
    const { title, Icon, otherGame } = useVariant()

    return (
        <header className="flex items-center justify-between py-5">
            <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-300 to-blue-500 text-blue-950 shadow-lg shadow-blue-500/20">
                    <Icon size={20} />
                </span>
                <h1 className="text-lg font-extrabold tracking-tight sm:text-xl">
                    {title.lead} <span className="text-blue-400">{title.accent}</span>
                </h1>
            </div>
            <nav className="flex items-center gap-1">
                <a
                    href={otherGame.href}
                    title={otherGame.label}
                    aria-label={otherGame.label}
                    className="mr-1 flex items-center gap-1.5 rounded-full bg-zinc-900 px-2 py-1.5 text-sm font-medium text-zinc-300 ring-1 ring-white/5 transition hover:bg-zinc-800 hover:text-white sm:px-3"
                >
                    <otherGame.Icon size={17} />
                    <span className="hidden sm:inline">{otherGame.label}</span>
                </a>
                <button onClick={onHelp} aria-label="How to play" className={iconButton}>
                    <IoHelpCircleOutline size={22} />
                </button>
                <button onClick={onStats} aria-label="Statistics" className={iconButton}>
                    <IoStatsChart size={19} />
                </button>
            </nav>
        </header>
    )
}

export default Header
