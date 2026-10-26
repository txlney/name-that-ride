import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Served from https://txlney.github.io/name-that-ride/, so every URL needs this prefix
  base: '/name-that-ride/',
  plugins: [react(), tailwindcss()],
  build: {
    // One page per game, so each only loads its own photos: see src/games.jsx
    rolldownOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        pokemon: resolve(import.meta.dirname, 'pokemon/index.html'),
        'higher-lower': resolve(import.meta.dirname, 'higher-lower/index.html'),
      },
    },
  },
})
