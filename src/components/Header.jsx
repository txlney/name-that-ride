import { IoHelpCircleOutline, IoStatsChart } from 'react-icons/io5'
import GameMenu from './GameMenu'

const iconButton = 'cursor-pointer rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white'

// gameId: the game this page plays, see src/games.jsx. Help and stats only show when given a handler.
function Header({ gameId, onHelp, onStats }) {
    return (
        <header className="flex items-center justify-between py-5">
            <GameMenu gameId={gameId} />
            <nav className="flex items-center gap-1">
                {onHelp && (
                    <button onClick={onHelp} aria-label="How to play" className={iconButton}>
                        <IoHelpCircleOutline size={22} />
                    </button>
                )}
                {onStats && (
                    <button onClick={onStats} aria-label="Statistics" className={iconButton}>
                        <IoStatsChart size={19} />
                    </button>
                )}
            </nav>
        </header>
    )
}

export default Header
