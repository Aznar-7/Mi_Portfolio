import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { site } from './data/site.js'

// Note for curious developers opening the console
console.info(
  `%c${site.name}%c  ${site.role}\n\n%cReact 19, Vite y Motion. Si estás leyendo esto, hablemos:\n${site.email}  ${site.linkedin.replace(/^https?:\/\/(www\.)?/, '')}`,
  'color:#ededf2;font-size:18px;font-weight:600;',
  'color:#a3a3b5;font-size:13px;',
  'color:#8b7bff;font-size:12px;line-height:1.6;',
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
