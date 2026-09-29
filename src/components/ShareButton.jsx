import { useEffect, useState } from 'react'
import { IoCheckmark, IoShareSocialOutline } from 'react-icons/io5'
import { shareText } from '../game/share'

function ShareButton({ round, className = '' }) {
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (!copied) return
        const timeout = setTimeout(() => setCopied(false), 2000)
        return () => clearTimeout(timeout)
    }, [copied])

    async function share() {
        const text = shareText(round)
        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
        } catch {
            // Clipboard can be blocked; fall back to the system share sheet where there is one
            navigator.share?.({ text }).catch(() => {})
        }
    }

    return (
        <button onClick={share} className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg font-semibold transition ${className}`}>
            {copied ? <IoCheckmark size={18} /> : <IoShareSocialOutline size={18} />}
            {copied ? 'Copied!' : 'Share'}
        </button>
    )
}

export default ShareButton
