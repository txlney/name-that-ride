import { IoAlbumsOutline } from 'react-icons/io5'
import { MdCatchingPokemon } from 'react-icons/md'
import pokemon from '../pokemon'
import { createDaily } from '../game/daily'
import { createDeck } from '../game/deck'
import { getGame } from '../games'

const sameChain = (guess, answer) => guess.chain === answer.chain

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
        // Each type turns green on its own if the answer has it
        { key: 'types', label: 'Type' },
    ],
    columnsClass: 'grid-cols-[4.25rem_1fr_1fr] sm:grid-cols-[4.75rem_1fr_1fr]',
    hinted: { regular: ['gen', 'name', 'types'], hard: [] },
    // A wrong value that's still near the answer: one generation away, or a Pokémon in the same evolution line
    isClose: {
        gen: (guess, answer) => Math.abs(guess.gen - answer.gen) === 1,
        name: sameChain,
    },
    arrowColumn: 'gen',
    // Regular mode's yellow pip
    isCloseGuess: sameChain,
    regularTitle: 'Guessing a Pokémon from the same evolution line turns the guess yellow',

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
        close: 'Same evolution line, wrong Pokémon',
        hints: <>
            Each guess is split into generation, name and type. In Regular, the generation turns green when it's right, or yellow if it's
            one generation away, with an arrow pointing towards the answer. The name turns yellow if that Pokémon is in the same evolution
            line as the answer, and each type turns green if the answer has that type too.
        </>,
        daily: 'the same Pokémon for everyone',
        freePlay: <>
            unlimited random Pokémon. Switch it to <b className="text-white">Gen 1–4</b> for only the first 493.
        </>,
    },
}

export default pokemonVariant
