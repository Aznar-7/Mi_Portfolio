import { createContext, useContext, useState } from 'react'

const LanguageContext = createContext({ lang: 'es', toggle: () => {} })

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('es')
  return (
    <LanguageContext.Provider value={{ lang, toggle: () => setLang(l => l === 'es' ? 'en' : 'es') }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => useContext(LanguageContext)
