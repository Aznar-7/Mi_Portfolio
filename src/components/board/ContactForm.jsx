import { useState } from 'react'
import { Send, RotateCcw } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import { useSoundEffects } from '@/contexts/SoundContext'
import { copy } from '@/i18n/site'
import { site } from '@/data/site'

// The form reads as a short letter you fill in: the blanks are the fields. It is sent from the page,
// no mail app involved: Web3Forms when a key is set, otherwise FormSubmit straight to the inbox
// (FormSubmit asks the owner to confirm once, by a link in the first message it delivers).
const KEY = import.meta.env.VITE_WEB3FORMS_KEY
const FOLD = 900 // ms the letter takes to fold and fly off; the request runs meanwhile

async function deliver({ subject, name, email, topic, message }) {
  const res = KEY
    ? await fetch('https://api.web3forms.com/submit', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ access_key: KEY, subject, from_name: 'vicenteaznar.dev', name, email, topic, message }),
    })
    : await fetch(`https://formsubmit.co/ajax/${site.email}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ _subject: subject, _template: 'table', _captcha: 'false', _replyto: email, name, email, topic, message }),
    })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json.success === false || json.success === 'false') throw new Error(json.message || 'send failed')
}

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
    setState('sending')
    try {
      // the fold plays in full even if the network is faster, so the moment reads
      await Promise.all([
        deliver({ subject, name: data.name, email: data.email, topic: T.topics[topic], message: data.message }),
        new Promise((r) => setTimeout(r, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : FOLD)),
      ])
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
    <form className={`letter${state === 'sending' ? ' folding' : ''}`} onSubmit={submit}>
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
