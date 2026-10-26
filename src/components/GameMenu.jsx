import { useEffect, useId, useRef, useState } from 'react'
import { IoCheckmark, IoChevronDown } from 'react-icons/io5'
import { games, getGame } from '../games'

// The logo and title, which open a menu of every game on the site
function GameMenu({ gameId }) {
    const current = getGame(gameId)
    const [open, setOpen] = useState(false)
    const menuId = useId()
    const rootRef = useRef(null)
    const buttonRef = useRef(null)
    const itemRefs = useRef([])

    function close() {
        setOpen(false)
        buttonRef.current.focus()
    }

    // Focus the current game when the menu opens, and close it on a click anywhere else
    useEffect(() => {
        if (!open) return
        itemRefs.current[games.indexOf(current)]?.focus()
        const onPointerDown = e => { if (!rootRef.current.contains(e.target)) setOpen(false) }
        document.addEventListener('pointerdown', onPointerDown)
        return () => document.removeEventListener('pointerdown', onPointerDown)
    }, [open, current])

    function onButtonKeyDown(e) {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
        e.preventDefault()
        setOpen(true)
    }

    function onMenuKeyDown(e) {
        const items = itemRefs.current
        const index = items.indexOf(document.activeElement)
        const focusAt = i => items[(i + items.length) % items.length].focus()
        switch (e.key) {
            case 'ArrowDown': focusAt(index + 1); break
            case 'ArrowUp': focusAt(index - 1); break
            case 'Home': focusAt(0); break
            case 'End': focusAt(items.length - 1); break
            case 'Escape': close(); break
            // Links only open on Enter, so Space needs doing by hand
            case ' ': items[index]?.click(); break
            // Let focus move on as usual, just without the menu
            case 'Tab': setOpen(false); return
            default: return
        }
        e.preventDefault()
        // Keep keys meant for the menu away from the page, e.g. Space starting a round
        e.stopPropagation()
    }

    return (
        <div ref={rootRef} className="relative">
            <button
                ref={buttonRef}
                onClick={() => setOpen(o => !o)}
                onKeyDown={onButtonKeyDown}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls={open ? menuId : undefined}
                aria-label={`${current.title.lead} ${current.title.accent}, switch game`}
                className="group -ml-2 flex cursor-pointer items-center gap-2.5 rounded-xl px-2 py-1.5 transition hover:bg-zinc-900 aria-expanded:bg-zinc-900"
            >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-300 to-blue-500 text-blue-950 shadow-lg shadow-blue-500/20">
                    <current.Icon size={20} />
                </span>
                <h1 className="text-lg font-extrabold tracking-tight sm:text-xl">
                    {current.title.lead} <span className="text-blue-400">{current.title.accent}</span>
                </h1>
                <IoChevronDown
                    size={16}
                    className="text-zinc-500 transition group-hover:text-zinc-300 group-aria-expanded:rotate-180 group-aria-expanded:text-zinc-300"
                />
            </button>

            {open && (
                <div
                    id={menuId}
                    role="menu"
                    aria-label="Games"
                    onKeyDown={onMenuKeyDown}
                    className="animate-fade-in absolute top-full left-0 z-40 mt-2 w-80 max-w-[calc(100vw-2rem)] origin-top-left rounded-2xl border border-white/10 bg-zinc-900 p-1.5 shadow-2xl shadow-black/60"
                >
                    {games.map((game, i) => {
                        const isCurrent = game === current
                        return (
                            <a
                                key={game.id}
                                ref={el => { itemRefs.current[i] = el }}
                                href={game.href}
                                role="menuitem"
                                tabIndex={-1}
                                aria-current={isCurrent ? 'page' : undefined}
                                // Already here, so just close instead of reloading the page
                                onClick={isCurrent ? e => { e.preventDefault(); close() } : undefined}
                                className={`flex items-center gap-3 rounded-xl px-2.5 py-2 outline-none transition hover:bg-zinc-800 focus-visible:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-blue-400/60 ${
                                    isCurrent ? 'bg-zinc-800/60' : ''
                                }`}
                            >
                                <span
                                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                                        isCurrent ? 'bg-gradient-to-br from-blue-300 to-blue-500 text-blue-950' : 'bg-zinc-800 text-zinc-300'
                                    }`}
                                >
                                    <game.Icon size={19} />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="flex items-center gap-2 text-sm font-semibold text-white">
                                        {game.title.lead} {game.title.accent}
                                        {game.badge && (
                                            <span className="rounded-full bg-amber-400/15 px-1.5 py-px text-[10px] font-semibold tracking-wide text-amber-300 uppercase">
                                                {game.badge}
                                            </span>
                                        )}
                                    </span>
                                    <span className="block text-xs text-zinc-400">{game.blurb}</span>
                                </span>
                                {isCurrent && <IoCheckmark size={18} className="shrink-0 text-blue-400" aria-hidden />}
                            </a>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default GameMenu
