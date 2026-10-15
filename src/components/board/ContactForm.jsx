import { useState } from 'react'
import { Send, RotateCcw } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import { useSoundEffects } from '@/contexts/SoundContext'
import { copy } from '@/i18n/site'
import { site } from '@/data/site'

// The form reads as a short letter you fill in: the blanks are the fields.
// Web3Forms relays it to the inbox tied to this public access key; no backend needed.
// Without a key (local dev, forks) it falls back to the visitor's mail app, prefilled.
const KEY = import.meta.env.VITE_WEB3FORMS_KEY

export function ContactForm() {
  const { lang } = useLang()
  const T = copy[lang].form
  const { playClick, playSuccess, playTyping } = useSoundEffects()
  const [state, setState] = useState('idle') // idle | sending | sent | error
  const [topic, setTopic] = useState(0)
  const [who, setWho] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))
    if (data.botcheck) return // honeypot: bots fill every field
    playClick()
    const subject = `${T.subject(data.name)} · ${T.topics[topic]}`
    if (!KEY) {
      const body = `${data.message}\n\n${data.name} · ${data.email}`
      location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      return
    }
    setState('sending')
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ access_key: KEY, subject, from_name: 'vicenteaznar.dev', name: data.name, email: data.email, topic: T.topics[topic], message: data.message }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message)
      setWho(data.name.split(' ')[0]); setState('sent'); playSuccess(); form.reset()
    } catch {
      setState('error')
    }
  }

  if (state === 'sent') {
    return (
      <div className="letter-sent" role="status">
        <span className="sent-plane" aria-hidden="true"><Send size={26} /></span>
        <p className="sent-title">{T.sentTitle(who)}</p>
        <p>{T.okLine}</p>
        <button type="button" className="btn ghost" onClick={() => setState('idle')}><RotateCcw size={15} aria-hidden="true" />{T.another}</button>
      </div>
    )
  }

  const type = (e) => { if (e.key.length === 1) playTyping() }
  return (
    <form className="letter" onSubmit={submit}>
      <p className="letter-line">
        {T.l1}{' '}
        <label className="sr-only" htmlFor="f-name">{T.name}</label>
        <input id="f-name" name="name" autoComplete="name" required maxLength={80} placeholder={T.namePh} onKeyDown={type} />
        {T.l2}{' '}
        <label className="sr-only" htmlFor="f-email">{T.email}</label>
        <input id="f-email" name="email" type="email" autoComplete="email" required maxLength={120} placeholder={T.emailPh} onKeyDown={type} />
        {T.l3}{' '}
        <label className="sr-only" htmlFor="f-topic">{T.about}</label>
        <select id="f-topic" value={topic} onChange={(e) => { playClick(); setTopic(Number(e.target.value)) }}>
          {T.topics.map((tp, i) => <option key={tp} value={i}>{tp.toLowerCase()}</option>)}
        </select>.
      </p>
      <label className="sr-only" htmlFor="f-msg">{T.message}</label>
      <textarea id="f-msg" name="message" rows={3} required minLength={10} maxLength={4000} placeholder={T.placeholders[topic]} onKeyDown={type} />
      <input type="checkbox" name="botcheck" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <div className="letter-foot">
        <button type="submit" className="btn" disabled={state === 'sending'}>
          <Send size={16} aria-hidden="true" />{state === 'sending' ? T.sending : T.send}
        </button>
        <p className={`form-msg ${state}`} role="status" aria-live="polite">{state === 'error' ? T.errLine(site.email) : T.note}</p>
      </div>
    </form>
  )
}
