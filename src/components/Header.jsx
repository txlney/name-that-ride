import { IoCarSport, IoHelpCircleOutline, IoStatsChart } from 'react-icons/io5'

const iconButton = 'cursor-pointer rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white'

function Header({ onHelp, onStats }) {
    return (
        <header className="flex items-center justify-between py-5">
            <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-300 to-blue-500 text-blue-950 shadow-lg shadow-blue-500/20">
                    <IoCarSport size={20} />
                </span>
                <h1 className="text-lg font-extrabold tracking-tight sm:text-xl">
                    Name That <span className="text-blue-400">Ride</span>
                </h1>
            </div>
            <nav className="flex items-center gap-1">
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
