import { useEffect, useId } from 'react'
import { IoClose } from 'react-icons/io5'

function Modal({ title, onClose, children }) {
    const titleId = useId()

    useEffect(() => {
        const onKeyDown = e => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [onClose])

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                onClick={e => e.stopPropagation()}
                className="animate-fade-in max-h-full w-full max-w-xl overflow-y-auto rounded-2xl border border-white/10 bg-zinc-900 p-5 shadow-2xl sm:p-6"
            >
                <div className="flex items-start justify-between gap-4">
                    <h2 id={titleId} className="text-xl font-bold tracking-tight">{title}</h2>
                    <button onClick={onClose} aria-label="Close" autoFocus className="-m-1 cursor-pointer rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-white">
                        <IoClose size={20} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    )
}

export default Modal
