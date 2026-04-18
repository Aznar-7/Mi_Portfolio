import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/animations.css'
import App from './App.jsx'

// Developer Easter Egg
console.info(
  "%c⚡ Vicente Aznar %c| Full Stack Developer\n%c================================================\n%c¿Revisando cómo está hecho esto? ¡Excelente!\n%cEl código fuente de este portfolio está estructurado para escalar, \ncon React 19, Vite, y un sistema de ventanas procedural en CSS/Motion.\n\n%c📫 Hablemos: %cvicente@aznar.dev %c| %clinkedin.com/in/vicente-aznar\n%c================================================",
  "color: #7c6af7; font-size: 20px; font-weight: 900;",
  "color: #a8a8b0; font-size: 16px; font-weight: normal;",
  "color: #333;",
  "color: #e8e8f0; font-size: 14px; font-weight: bold;",
  "color: #8888aa; font-size: 12px; line-height: 1.5;",
  "color: #e8e8f0; font-size: 14px; font-weight: bold;",
  "color: #7c6af7; font-size: 14px; text-decoration: none;",
  "color: #8888aa; font-size: 14px;",
  "color: #7c6af7; font-size: 14px; text-decoration: none;",
  "color: #333;"
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
