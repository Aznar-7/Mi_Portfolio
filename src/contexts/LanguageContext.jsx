import { createContext, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'portfolio-language'
const LanguageContext = createContext({ lang: 'es', setLang: () => {}, toggle: () => {} })

function getInitialLanguage() {
  if (typeof window === 'undefined') return 'es'

  // a shared link can ask for a language (?lang=en); then the visitor's own choice; crawlers get the
  // Spanish page the meta tags describe; everyone else, their browser's language
  const asked = new URLSearchParams(location.search).get('lang')
  if (asked === 'es' || asked === 'en') return asked
  let saved = null
  try { saved = localStorage.getItem(STORAGE_KEY) } catch { /* storage blocked: fall through */ }
  if (saved === 'es' || saved === 'en') return saved
  if (/bot|crawl|spider|slurp|facebookexternalhit|linkedin/i.test(navigator.userAgent)) return 'es'

  const preferredLanguages = navigator.languages?.length ? navigator.languages : [navigator.language]
  return preferredLanguages
    .map((language) => language?.toLowerCase().split('-')[0])
    .find((language) => language === 'es' || language === 'en') ?? 'en'
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(getInitialLanguage)

  const setLang = (nextLang) => {
    if (nextLang !== 'es' && nextLang !== 'en') return
    try { localStorage.setItem(STORAGE_KEY, nextLang) } catch { /* storage blocked: this visit only */ }
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

// eslint-disable-next-line react-refresh/only-export-components -- hook lives next to its provider
export const useLang = () => useContext(LanguageContext)
