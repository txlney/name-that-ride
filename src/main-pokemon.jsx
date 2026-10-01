import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import pokemonVariant from './variants/pokemon'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App variant={pokemonVariant} />
  </StrictMode>
)
