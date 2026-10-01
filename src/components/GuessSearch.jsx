import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useVariant } from '../game/variant'

function GuessSearch({ items, guessedIds, onGuess, onGiveUp }) {
    const { searchPlaceholder, nounPlural } = useVariant()
    const [query, setQuery] = useState('')
    const [selected, setSelected] = useState(null)
    const [open, setOpen] = useState(false)
    const [active, setActive] = useState(0)
    const listRef = useRef(null)
    const listId = useId()

    // Every word typed must appear somewhere, so "mustang 2018" and "2018 ford" both match
    const matches = useMemo(() => {
        const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
        if (terms.length === 0) return []
        return items.filter(item => !guessedIds.has(item.id) && terms.every(term => item.searchText.includes(term)))
    }, [items, guessedIds, query])

    const showList = open && query.trim() !== ''

    useEffect(() => {
        listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' })
    }, [active])

    function choose(item) {
        setSelected(item)
        setQuery(item.label)
        setOpen(false)
    }

    function submit() {
        if (!selected) return
        onGuess(selected)
        setSelected(null)
        setQuery('')
    }

    function handleKeyDown(e) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            if (matches.length === 0) return
            e.preventDefault()
            const step = e.key === 'ArrowDown' ? 1 : -1
            setOpen(true)
            setActive(i => (i + step + matches.length) % matches.length)
        } else if (e.key === 'Enter') {
            e.preventDefault()
            if (showList && matches[active]) choose(matches[active])
            else submit()
        } else if (e.key === 'Escape') {
            setOpen(false)
        }
    }

    return (
        <div className="mt-4">
            <div className="relative flex gap-2">
                <input
                    type="text"
                    autoFocus
                    role="combobox"
                    aria-expanded={showList}
                    aria-controls={listId}
                    aria-activedescendant={showList && matches[active] ? `${listId}-${active}` : undefined}
                    placeholder={searchPlaceholder}
                    value={query}
                    onChange={e => {
                        setQuery(e.target.value)
                        setSelected(null)
                        setOpen(true)
                        setActive(0)
                    }}
                    onKeyDown={handleKeyDown}
                    onBlur={() => setOpen(false)}
                    className="h-10 min-w-0 flex-1 rounded border-2 border-transparent bg-white px-3 text-zinc-900 focus:border-blue-300 focus:outline-none"
                />
                <button
                    onClick={submit}
                    disabled={!selected}
                    className="h-10 rounded bg-blue-400 px-4 font-medium text-blue-950 transition enabled:cursor-pointer enabled:hover:-translate-y-px enabled:hover:bg-blue-300 disabled:opacity-50"
                >
                    Guess
                </button>

                {showList && (
                    <ul
                        id={listId}
                        ref={listRef}
                        role="listbox"
                        className="absolute top-full z-10 mt-1 max-h-60 w-full overflow-y-auto rounded bg-white text-zinc-900 shadow-lg"
                    >
                        {matches.length === 0 && <li className="px-3 py-2 text-zinc-500">No matching {nounPlural}</li>}
                        {matches.map((item, i) => (
                            <li
                                key={item.id}
                                id={`${listId}-${i}`}
                                role="option"
                                aria-selected={i === active}
                                // mousedown fires before the input's blur closes the list
                                onMouseDown={e => { e.preventDefault(); choose(item) }}
                                onMouseEnter={() => setActive(i)}
                                className={`cursor-pointer px-3 py-1.5 ${i === active ? 'bg-blue-100' : ''}`}
                            >
                                {item.label}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="mt-3 flex justify-center">
                <button
                    onClick={onGiveUp}
                    className="cursor-pointer rounded border-2 border-red-500 px-3 py-1 text-sm text-red-500 transition hover:-translate-y-px hover:bg-red-500 hover:text-white"
                >
                    Give Up
                </button>
            </div>
        </div>
    )
}

export default GuessSearch
