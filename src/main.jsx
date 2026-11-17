import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/board.css'
import App from './App.jsx'

// A reload should land on the hero (the board boots there), not wherever the last visit stopped.
// Deep links (#proyectos) still work: the browser scrolls to the hash after this.
// 'instant' because html{scroll-behavior:smooth} would animate this and leave the page mid-scroll.
history.scrollRestoration = 'manual'
if (!location.hash) scrollTo({ top: 0, behavior: 'instant' })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
