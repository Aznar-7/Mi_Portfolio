import { useState } from 'react'
import { Send, Check } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import { useSoundEffects } from '@/contexts/SoundContext'
import { copy } from '@/i18n/site'
import { site } from '@/data/site'

// Web3Forms relays the message to the inbox tied to this public access key; no backend needed.
// Without a key (local dev, forks) the form falls back to the visitor's mail app, prefilled.
const KEY = import.meta.env.VITE_WEB3FORMS_KEY

export function ContactForm() {
  const { lang } = useLang()
  const T = copy[lang].form
  const { playClick, playSuccess } = useSoundEffects()
  const [state, setState] = useState('idle') // idle | sending | sent | error

  const submit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))
    if (data.botcheck) return // honeypot: bots fill every field
    playClick()
    if (!KEY) {
      const body = `${data.message}\n\n${data.name} · ${data.email}`
      location.href = `mailto:${site.email}?subject=${encodeURIComponent(T.subject(data.name))}&body=${encodeURIComponent(body)}`
      return
    }
    setState('sending')
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ access_key: KEY, subject: T.subject(data.name), from_name: 'vicenteaznar.dev', name: data.name, email: data.email, message: data.message }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message)
      setState('sent'); playSuccess(); form.reset()
    } catch {
      setState('error')
    }
  }

  return (
    <form className="mail-form" onSubmit={submit} noValidate={false}>
      <div className="field">
        <label htmlFor="f-name">{T.name}</label>
        <input id="f-name" name="name" autoComplete="name" required maxLength={80} />
      </div>
      <div className="field">
        <label htmlFor="f-email">{T.email}</label>
        <input id="f-email" name="email" type="email" autoComplete="email" required maxLength={120} />
      </div>
      <div className="field wide">
        <label htmlFor="f-msg">{T.message}</label>
        <textarea id="f-msg" name="message" rows={4} required minLength={10} maxLength={4000} placeholder={T.placeholder} />
      </div>
      <input type="checkbox" name="botcheck" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <div className="form-foot wide">
        <button type="submit" className="btn" disabled={state === 'sending'}>
          {state === 'sent' ? <Check size={16} aria-hidden="true" /> : <Send size={16} aria-hidden="true" />}
          {state === 'sending' ? T.sending : state === 'sent' ? T.sent : T.send}
        </button>
        <p className={`form-msg ${state}`} role="status" aria-live="polite">
          {state === 'sent' ? T.okLine : state === 'error' ? T.errLine(site.email) : ''}
        </p>
      </div>
    </form>
  )
}
