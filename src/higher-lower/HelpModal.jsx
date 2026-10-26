import Modal from '../components/Modal'
import { DAILY_LENGTH } from './chain'

const kbd = 'rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-200'

function HelpModal({ onClose }) {
    return (
        <Modal title="How to play" onClose={onClose}>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-zinc-300">
                <p>
                    You're shown two cars. You can see the year of the first one. Is the second one{' '}
                    <b className="text-white">newer</b> or <b className="text-white">older</b>?
                </p>
                <p>
                    Once you've guessed, its year is revealed and it becomes the car to beat. The two cars are never from the same year.
                    They start decades apart and get closer together the further you go.
                </p>

                <div className="rounded-xl bg-zinc-950 p-4">
                    <div className="mb-2 font-semibold text-white">Daily and Endless</div>
                    <p>
                        <b className="text-white">Daily</b> is the same {DAILY_LENGTH} guesses for everyone, once a day. A wrong guess doesn't
                        end it, so you're scored out of {DAILY_LENGTH}. Play on consecutive days to build a streak, and share your result.
                    </p>
                    <p className="mt-2">
                        <b className="text-white">Endless</b> keeps going until your first wrong guess. Switch it to{' '}
                        <b className="text-white">Common</b> for only cars from well-known makes. Each has its own best streak.
                    </p>
                </div>

                <p className="text-zinc-500">
                    Tip: press <kbd className={kbd}>↑</kbd> for newer and <kbd className={kbd}>↓</kbd> for older.
                </p>
            </div>
        </Modal>
    )
}

export default HelpModal
