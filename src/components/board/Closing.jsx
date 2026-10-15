import { useEffect, useRef, useState } from 'react'
import { useLang } from '@/contexts/LanguageContext'
import { copy } from '@/i18n/site'
import { site } from '@/data/site'
import { findSecret, useSecretCount, SECRETS } from '@/lib/secrets'
import { powerOn } from '@/lib/power'

// J2: every way to reach me is a pin on one connector; copying the email solders it
export function Contact() {
  const { lang } = useLang()
  const T = copy[lang].contact
  const [copied, setCopied] = useState(null) // null | 'ok' | 'fail'
  const doCopy = async () => {
    try { await navigator.clipboard.writeText(site.email); setCopied('ok') } catch { setCopied('fail') }
    setTimeout(() => setCopied((c) => (c === 'ok' ? 'done' : null)), 2200)
  }
  return (
    <section className="contact" id="contacto">
      <h2>{T.title}</h2>
      <p className="big">{T.big}</p>
      <p className="sec-intro">{T.intro}</p>
      <ul className="conn">
        <li className="conn-silk" aria-hidden="true">{T.silk}</li>
        <li className={`pin primary${copied === 'ok' || copied === 'done' ? ' done' : ''}`}>
          <span className="pin-n" aria-hidden="true">1</span>
          <span className="pin-k">Email</span>
          <a className="pin-v" href={`mailto:${site.email}`}>{site.email}</a>
          <button className="copy-btn" onClick={doCopy} aria-live="polite">{copied === 'ok' ? T.copied : copied === 'fail' ? T.copyFail : T.copy}</button>
        </li>
        <li className="pin">
          <span className="pin-n" aria-hidden="true">2</span>
          <span className="pin-k">LinkedIn</span>
          <a className="pin-v" href={site.linkedin} target="_blank" rel="noopener noreferrer">{site.linkedin.split('/in/')[1]}</a>
        </li>
        <li className="pin">
          <span className="pin-n" aria-hidden="true">3</span>
          <span className="pin-k">GitHub</span>
          <a className="pin-v" href={site.github} target="_blank" rel="noopener noreferrer">{site.github.split('github.com/')[1]}</a>
        </li>
        <li className="pin">
          <span className="pin-n" aria-hidden="true">4</span>
          <span className="pin-k">{T.cv}</span>
          <span className="pin-v">
            <a href={site.resumes.es.url} download={site.resumes.es.filename}>{T.es}</a> · <a href={site.resumes.en.url} download={site.resumes.en.filename}>{T.en}</a>
          </span>
        </li>
      </ul>
    </section>
  )
}

// J3: a real prompt. ssh, Power on, mellon or Konami power the board down into the Ubuntu simulator
export function Console() {
  const { lang } = useLang()
  const T = copy[lang].console
  // the last reply belongs to the language it was written in; switching language shows the hint again
  const [out, setOut] = useState(null)
  const input = useRef(null)
  const shown = out?.lang === lang ? out : { text: T.hint }
  const say = (text, elvish = false) => setOut({ text, elvish, lang })
  const COMMANDS = {
    '': () => { say(T.booting); powerOn() },
    'ssh vicente': () => { say(T.booting); powerOn() },
    mellon: () => { findSecret('mellon'); say(T.mellon, true); setTimeout(powerOn, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1400) },
    'sudo hire': () => { findSecret('hire'); say(T.hire); setTimeout(() => { location.href = `mailto:${site.email}?subject=Hola%20Vicente` }, 900) },
    help: () => say(T.help),
    ls: () => say(T.ls),
    'cat .secretos': () => say(T.secrets),
    'cat .secrets': () => say(T.secrets),
    'execute order 66': () => { findSecret('order66'); say(T.order66); document.dispatchEvent(new CustomEvent('board:order66')) },
    'orden 66': () => COMMANDS['execute order 66'](),
  }
  const submit = (e) => {
    e.preventDefault()
    const cmd = input.current.value.trim().toLowerCase().replace(/\s+/g, ' ')
    const run = COMMANDS[cmd]
    run ? run() : say(T.notFound(cmd.split(' ')[0]))
  }

  return (
    <section className="power" id="consola">
      <div className="power-in">
        <span className="conn-silk" aria-hidden="true">{T.silk}</span>
        <h2>{T.title}</h2>
        <p className="sec-intro">{T.intro}</p>
        <form className="term" onSubmit={submit} autoComplete="off">
          <label htmlFor="cmd" className="prompt">{T.prompt}</label>
          <input id="cmd" ref={input} spellCheck="false" placeholder="ssh vicente" aria-describedby="term-out" autoCapitalize="off" />
          <button type="submit" className="power-btn">{T.button}</button>
        </form>
        <p className={`term-out${shown.elvish ? ' elvish' : ''}`} id="term-out" aria-live="polite">{shown.text}</p>
      </div>
    </section>
  )
}

export function Footer() {
  const { lang } = useLang()
  const T = copy[lang].footer
  const count = useSecretCount()
  return (
    <footer className="silk-foot">
      <span>{T.rev}</span>
      <span className="eggs">{T.secrets(count, SECRETS.length)}</span>
      <span>{T.made}</span>
    </footer>
  )
}

// Announces each secret found, bottom left
export function SecretToast() {
  const { lang } = useLang()
  const T = copy[lang].secrets
  const [msg, setMsg] = useState(null)
  useEffect(() => {
    let t
    const on = (e) => { setMsg(e.detail); clearTimeout(t); t = setTimeout(() => setMsg((m) => m && { ...m, hide: true }), 4200) }
    document.addEventListener('secret', on)
    return () => { document.removeEventListener('secret', on); clearTimeout(t) }
  }, [])
  return (
    <div className={`egg-toast${msg && !msg.hide ? ' on' : ''}`} role="status" aria-live="polite">
      {msg && <><b>{msg.fresh ? T.found : T.again} {msg.count}/{SECRETS.length} · {T.names[msg.id]}</b>{T.lines[msg.id]}</>}
    </div>
  )
}
