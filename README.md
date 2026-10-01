# Name That Ride

Guess the hidden car before the photo is fully revealed.

The same game also runs as **Name That Pokémon** at `/pokemon/` (`http://localhost:5173/pokemon/` in dev), using official Pokémon artwork in a square frame.

## Running it

```
npm install     # first time only
npm run dev     # start at http://localhost:5173
npm run build   # production build into dist/
npm run preview # serve the production build locally
```

## How it plays

Press **Start** and the photo uncovers one tile at a time over 30 seconds. **Pause** (or press Space) to search and make a guess. You get 6 guesses.

- **Daily**: the same car for everyone each day, one attempt per day, with a daily streak. Progress is saved, so reloading the page doesn't give you a fresh look.
- **Free play**: unlimited random cars.
- **Regular / Hard**: Regular turns a guess yellow when the make is right and the model is wrong. Hard gives no hints.

Scoring goes up to 5000. **Photo points** (up to 4000) stay full for the first 3 seconds, then drain as the photo reveals. **Guess points** (up to 1000) drop by 200 for each extra guess.
The tuning values are in `src/game/constants.js`.

Stats, the daily round and preferences are stored in the browser's localStorage (keys start with `ntr:` for cars and `ntp:` for Pokémon, so each game keeps its own).

## Adding a car

1. Add a row to `src/cars.js`: `{ id: <unique>, year: "2020", make: "Ford", model: "Mustang Mach-E" }`
2. Save the photo as `src/assets/cars/<make>/<year>-<model>.jpg`. Use lowercase, turn spaces into `-` and hyphens into `=`,
   e.g. `src/assets/cars/ford/2020-mustang-mach=e.jpg`
3. Run `npm run optimize-images`. It resizes the photo to at most 1600px wide and converts it to WebP, which is about half the size.
   **It deletes the original**, so keep a copy if you want one. If WebP wouldn't make a photo smaller, the script leaves it as it is.

A `.jpg` or `.png` works in the game even before you run the script, so step 3 only makes it load faster.
If a car has no matching photo, the dev server logs a warning in the browser console. That car can still be guessed but is never chosen as the answer.

## Name That Pokémon

Columns are **Gen** and **Name**. In Regular, the gen turns yellow (with an arrow) when it's one generation away, and the name turns yellow when the guess shares a type with the answer. Free play can deal from every Pokémon or only **Gen 1–4**.

`npm run fetch-pokemon` downloads every Pokémon's name and types from [PokeAPI](https://pokeapi.co) into `src/pokemon.json`, and its official artwork into `src/assets/pokemon/<id>.webp`. Its output is committed, so you only need to run it again to pick up new Pokémon (raise `COUNT` in the script). It skips anything already downloaded.

## Variants

Everything that differs between the two games is a **variant** in `src/variants/` (`cars.jsx`, `pokemon.jsx`): the items, guess columns and hint rules, free play pools, frame shape, wording and storage prefix. Each game is its own page (`index.html`, `pokemon/index.html`, listed in `vite.config.js`) that renders `<App variant={...} />`, so it only loads its own photos. To add another game, write a variant, a data module and a page.

## Layout

- `src/game/useGame.js`: game state (reducer), the round clock, and saving the daily round
- `src/game/constants.js`, `scoring.js`: timings, points and guess colours
- `src/variants/`: the per-game settings described above. `src/game/variant.js` provides the current one to components
- `src/game/daily.js`: picks the daily answer (a seeded shuffle, so it's the same everywhere). Adding cars changes which car comes up on future days.
- `src/game/deck.js`: deals free play answers in shuffled order with no repeats until every one has come up
- `src/game/stats.js`, `share.js`, `storage.js`: stats and streaks, the share text, and safe localStorage access
- `src/components/`: UI pieces
