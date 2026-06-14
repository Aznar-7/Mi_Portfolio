import { createContext, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'portfolio-language'
const LanguageContext = createContext({ lang: 'es', setLang: () => {}, toggle: () => {} })

function getInitialLanguage() {
  if (typeof window === 'undefined') return 'es'

  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (saved === 'es' || saved === 'en') return saved

  const preferredLanguages = navigator.languages?.length ? navigator.languages : [navigator.language]
  return preferredLanguages
    .map((language) => language?.toLowerCase().split('-')[0])
    .find((language) => language === 'es' || language === 'en') ?? 'en'
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(getInitialLanguage)

  const setLang = (nextLang) => {
    if (nextLang !== 'es' && nextLang !== 'en') return
    window.localStorage.setItem(STORAGE_KEY, nextLang)
    setLangState(nextLang)
  }

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle: () => setLang(lang === 'es' ? 'en' : 'es') }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => useContext(LanguageContext)
