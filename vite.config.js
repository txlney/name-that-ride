import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // One page per game, so each only loads its own photos: / is Name That Ride, /pokemon/ is Name That Pokémon
    rolldownOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        pokemon: resolve(import.meta.dirname, 'pokemon/index.html'),
      },
    },
  },
})
