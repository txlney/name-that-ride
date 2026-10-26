import { IoCarSport, IoSwapVertical } from 'react-icons/io5'
import { MdCatchingPokemon } from 'react-icons/md'

// Every game on the site, in the order the game menu lists them. Each is its own page, listed in vite.config.js.
// badge: an optional label shown next to the game in the menu, e.g. for one that isn't finished
export const games = [
    {
        id: 'cars',
        title: { lead: 'Name That', accent: 'Ride' },
        blurb: 'Guess the car from a hidden photo',
        Icon: IoCarSport,
        href: import.meta.env.BASE_URL,
    },
    {
        id: 'pokemon',
        title: { lead: 'Name That', accent: 'Pokémon' },
        blurb: 'Guess the Pokémon from its artwork',
        Icon: MdCatchingPokemon,
        href: `${import.meta.env.BASE_URL}pokemon/`,
    },
    {
        id: 'higher-lower',
        title: { lead: 'Higher or', accent: 'Lower' },
        blurb: 'Is the next car newer or older?',
        Icon: IoSwapVertical,
        href: `${import.meta.env.BASE_URL}higher-lower/`,
    },
]

export function getGame(id) {
    return games.find(game => game.id === id)
}
