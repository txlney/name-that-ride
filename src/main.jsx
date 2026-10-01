import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import carsVariant from './variants/cars'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App variant={carsVariant} />
  </StrictMode>
)
