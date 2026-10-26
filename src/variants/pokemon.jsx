import { IoAlbumsOutline } from 'react-icons/io5'
import { MdCatchingPokemon } from 'react-icons/md'
import pokemon from '../pokemon'
import { createDaily } from '../game/daily'
import { createDeck } from '../game/deck'
import { getGame } from '../games'

const sharesType = (guess, answer) => guess.types.some(type => answer.types.includes(type))

const pools = [
    { value: 'all', label: <><IoAlbumsOutline size={15} /> All gens</>, title: 'Every Pokémon, Gen 1–9' },
    {
        value: 'classic',
        caption: 'Gen 1–4',
        label: <><MdCatchingPokemon size={16} /> Gen 1–4</>,
        title: 'Only Pokémon from Red/Blue to Diamond/Pearl',
        activeClass: 'bg-amber-400 text-amber-950',
        filter: p => p.gen <= 4,
    },
]

const pokemonVariant = {
    id: 'pokemon',
    storagePrefix: 'ntp',
    title: getGame('pokemon').title,

    items: pokemon,
    noun: 'Pokémon',
    nounPlural: 'Pokémon',
    reveal: { won: 'It was', lost: 'The hidden Pokémon was' },
    searchPlaceholder: 'Search e.g. Pikachu',

    pools,
    deck: createDeck(pokemon, pools),
    daily: createDaily(pokemon, 20260151),

    // Guess list columns, and which of them hint in each mode
    columns: [
        { key: 'gen', label: 'Gen' },
        { key: 'name', label: 'Name' },
    ],
    columnsClass: 'grid-cols-[4.25rem_1fr] sm:grid-cols-[4.75rem_1fr]',
    hinted: { regular: ['gen', 'name'], hard: [] },
    // A wrong value that's still near the answer: one generation away, or a Pokémon sharing a type
    isClose: {
        gen: (guess, answer) => Math.abs(guess.gen - answer.gen) === 1,
        name: sharesType,
    },
    arrowColumn: 'gen',
    // Regular mode's yellow pip
    isCloseGuess: sharesType,
    regularTitle: 'Guessing a Pokémon that shares a type turns the guess yellow',

    // Official artwork has a transparent background, so it sits whole on a lighter backdrop
    frame: {
        aspect: 'aspect-square',
        image: 'object-contain p-[8%]',
        backdrop: 'bg-[radial-gradient(circle,#4b5a73_0%,#253044_70%)]',
        width: 'mx-auto max-w-md',
        modalWidth: 'mx-auto max-w-xs',
    },

    help: {
        intro: "A Pokémon's official artwork",
        correct: 'Correct Pokémon',
        close: 'Shares a type, wrong Pokémon',
        hints: <>
            Each guess is split into generation and name. In Regular, the generation turns green when it's right, or yellow if it's
            one generation away, with an arrow pointing towards the answer. The name turns yellow if that Pokémon shares a type with the answer.
        </>,
        daily: 'the same Pokémon for everyone',
        freePlay: <>
            unlimited random Pokémon. Switch it to <b className="text-white">Gen 1–4</b> for only the first 493.
        </>,
    },
}

export default pokemonVariant
