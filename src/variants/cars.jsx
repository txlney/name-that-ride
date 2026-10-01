import { IoCarSport, IoCarSportOutline, IoStarOutline } from 'react-icons/io5'
import { MdCatchingPokemon } from 'react-icons/md'
import cars from '../cars'
import { createDaily } from '../game/daily'
import { createDeck } from '../game/deck'

const CLOSE_YEARS = 5

const pools = [
    { value: 'all', label: <><IoCarSportOutline size={16} /> All cars</>, title: 'Every car in the game' },
    {
        value: 'common',
        caption: 'Common',
        label: <><IoStarOutline size={15} /> Common</>,
        title: 'Only cars from well-known makes',
        activeClass: 'bg-amber-400 text-amber-950',
        // makes marked common in src/makes.js
        filter: car => car.common,
    },
]

const carsVariant = {
    id: 'cars',
    // Kept from before there were other games, so existing players keep their stats
    storagePrefix: 'ntr',
    title: { lead: 'Name That', accent: 'Ride' },
    Icon: IoCarSport,
    otherGame: { href: '/pokemon/', label: 'Try Name That Pokémon', Icon: MdCatchingPokemon },

    items: cars,
    noun: 'car',
    nounPlural: 'cars',
    reveal: { won: 'It was the', lost: 'The hidden car was the' },
    searchPlaceholder: 'Search e.g. Ford Ka',

    pools,
    deck: createDeck(cars, pools),
    daily: createDaily(cars, 20260101),

    // Guess list columns, and which of them hint in each mode
    columns: [
        { key: 'year', label: 'Year' },
        { key: 'make', label: 'Make' },
        { key: 'model', label: 'Model' },
    ],
    columnsClass: 'grid-cols-[4.25rem_1fr_1.5fr] sm:grid-cols-[4.75rem_1fr_1.75fr]',
    hinted: { regular: ['year', 'make'], hard: [] },
    // A wrong value that's still near the answer, e.g. a make from the same country
    isClose: {
        year: (guess, car) => Math.abs(guess.year - car.year) <= CLOSE_YEARS,
        make: (guess, car) => guess.country === car.country,
    },
    arrowColumn: 'year',
    // Regular mode's yellow pip
    isCloseGuess: (guess, car) => guess.make === car.make,
    regularTitle: 'Guessing the right make turns the guess yellow',

    frame: {
        aspect: 'aspect-video',
        image: 'object-cover',
        backdrop: 'bg-zinc-950',
        width: '',
        modalWidth: '',
    },

    help: {
        intro: 'A photo of a car',
        correct: 'Correct car',
        close: 'Right make, wrong model',
        hints: <>
            Each guess is split into year, make and model. In Regular, the year and make turn green when they're right.
            The year turns yellow if it's within {CLOSE_YEARS} years, with an arrow pointing towards the answer, and the make turns
            yellow if it's from the same country.
        </>,
        daily: 'the same car for everyone',
        freePlay: <>
            unlimited random cars. Switch it to <b className="text-white">Common</b> for only cars from well-known makes.
        </>,
    },
}

export default carsVariant
