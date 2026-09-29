# Name That Ride

Guess the hidden car before the photo is fully revealed.

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

Stats, the daily round and preferences are stored in the browser's localStorage (keys start with `ntr:`).

## Adding a car

1. Add a row to `src/cars.js`: `{ id: <unique>, year: "2020", make: "Ford", model: "Mustang Mach-E" }`
2. Save the photo as `src/assets/cars/<make>/<year>-<model>.jpg`. Use lowercase, turn spaces into `-` and hyphens into `=`,
   e.g. `src/assets/cars/ford/2020-mustang-mach=e.jpg`
3. Run `npm run optimize-images`. It resizes the photo to at most 1600px wide and converts it to WebP, which is about half the size.
   **It deletes the original**, so keep a copy if you want one. If WebP wouldn't make a photo smaller, the script leaves it as it is.

A `.jpg` or `.png` works in the game even before you run the script, so step 3 only makes it load faster.
If a car has no matching photo, the dev server logs a warning in the browser console. That car can still be guessed but is never chosen as the answer.

## Layout

- `src/game/useGame.js`: game state (reducer), the round clock, and saving the daily round
- `src/game/constants.js`, `scoring.js`: timings, points and guess colours
- `src/game/daily.js`: picks the daily car (a seeded shuffle, so it's the same everywhere). Adding cars changes which car comes up on future days.
- `src/game/deck.js`: deals free play cars in shuffled order with no repeats until every car has come up
- `src/game/stats.js`, `share.js`, `storage.js`: stats and streaks, the share text, and safe localStorage access
- `src/components/`: UI pieces
