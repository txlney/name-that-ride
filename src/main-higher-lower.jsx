import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import HigherLower from './higher-lower/HigherLower'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HigherLower />
  </StrictMode>
)
