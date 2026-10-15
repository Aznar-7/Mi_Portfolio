import { useEffect, useRef, useState } from 'react'
import { Check, Copy, FileDown, Mail, Power } from 'lucide-react'
import { useSoundEffects } from '@/contexts/SoundContext'
import { GitHubIcon, LinkedInIcon } from '@/components/common/SocialIcons'
import { useLang } from '@/contexts/LanguageContext'
import { copy } from '@/i18n/site'
import { site } from '@/data/site'
import { findSecret, useSecretCount, SECRETS } from '@/lib/secrets'
import { powerOn } from '@/lib/power'
import { ContactForm } from './ContactForm'
import { PowerTitle } from './PowerTitle'

// J2: every way to reach me is a pin on one connector; copying the email solders it
export function Contact() {
  const { lang } = useLang()
  const T = copy[lang].contact
  const { playSuccess, playHover } = useSoundEffects()
  const [copied, setCopied] = useState(null) // null | 'ok' | 'fail'
  const doCopy = async () => {
    try { await navigator.clipboard.writeText(site.email); setCopied('ok'); playSuccess() } catch { setCopied('fail') }
    setTimeout(() => setCopied((c) => (c === 'ok' ? 'done' : null)), 2200)
  }
  return (
    <section className="contact" id="contacto">
      <h2 className="sr-only">{T.title}</h2>
      <p className="big">{T.big}</p>
      <p className="sec-intro">{T.intro}</p>
      <div className="contact-grid">
      <ContactForm />
      <ul className="conn">
        <li className="conn-silk" aria-hidden="true">{T.silk}</li>
        <li onPointerEnter={playHover} className={`pin primary${copied === 'ok' || copied === 'done' ? ' done' : ''}`}>
          <span className="pin-k"><Mail size={14} aria-hidden="true" />Email</span>
          <a className="pin-v" href={`mailto:${site.email}`}>{site.email}</a>
          <button className="copy-btn" onClick={doCopy} aria-live="polite">{copied === 'ok' ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}{copied === 'ok' ? T.copied : copied === 'fail' ? T.copyFail : T.copy}</button>
        </li>
        <li className="pin" onPointerEnter={playHover}>
          <span className="pin-k"><LinkedInIcon size={14} />LinkedIn</span>
          <a className="pin-v" href={site.linkedin} target="_blank" rel="noopener noreferrer">{site.linkedin.split('/in/')[1]}</a>
        </li>
        <li className="pin" onPointerEnter={playHover}>
          <span className="pin-k"><GitHubIcon size={14} />GitHub</span>
          <a className="pin-v" href={site.github} target="_blank" rel="noopener noreferrer">{site.github.split('github.com/')[1]}</a>
        </li>
        <li className="pin" onPointerEnter={playHover}>
          <span className="pin-k"><FileDown size={14} aria-hidden="true" />{T.cv}</span>
          <span className="pin-v">
            <a href={site.resumes.es.url} download={site.resumes.es.filename}>{T.es}</a> · <a href={site.resumes.en.url} download={site.resumes.en.filename}>{T.en}</a>
          </span>
        </li>
      </ul>
      </div>
    </section>
  )
}

// J3: a real prompt. ssh, Power on, mellon or Konami power the board down into the Ubuntu simulator
export function Console() {
  const { lang } = useLang()
  const T = copy[lang].console
  const { playTyping, playClick } = useSoundEffects()
  // the last reply belongs to the language it was written in; switching language shows the hint again
  const [out, setOut] = useState(null)
  const input = useRef(null)
  const shown = out?.lang === lang ? out : { text: T.hint }
  const say = (text, elvish = false) => setOut({ text, elvish, lang })
  const COMMANDS = {
    '': () => { say(T.booting); powerOn() },
    'ssh vicente': () => { say(T.booting); powerOn() },
    mellon: () => { findSecret('mellon'); say(T.mellon, true); setTimeout(powerOn, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 3300) },
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
    playClick()
    run ? run() : say(T.notFound(cmd.split(' ')[0]))
  }

  return (
    <section className="power" id="consola">
      <div className="power-in">
        <span className="conn-silk" aria-hidden="true">{T.silk}</span>
        <PowerTitle text={T.title} />
        <p className="sec-intro">{T.intro}</p>
        <form className="term" onSubmit={submit} autoComplete="off">
          <label htmlFor="cmd" className="prompt">{T.prompt}</label>
          <input id="cmd" ref={input} spellCheck="false" placeholder="ssh vicente" aria-describedby="term-out" autoCapitalize="off" onKeyDown={(e) => e.key.length === 1 && playTyping()} />
          <button type="submit" className="power-btn"><Power size={15} aria-hidden="true" />{T.button}</button>
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
  const { playUnlock } = useSoundEffects()
  const [msg, setMsg] = useState(null)
  const unlock = useRef(playUnlock)
  useEffect(() => { unlock.current = playUnlock })
  useEffect(() => {
    let t
    const on = (e) => { if (e.detail.fresh) unlock.current(); setMsg(e.detail); clearTimeout(t); t = setTimeout(() => setMsg((m) => m && { ...m, hide: true }), 4200) }
    document.addEventListener('secret', on)
    return () => { document.removeEventListener('secret', on); clearTimeout(t) }
  }, [])
  return (
    <div className={`egg-toast${msg && !msg.hide ? ' on' : ''}`} role="status" aria-live="polite">
      {msg && <><b>{msg.fresh ? T.found : T.again} {msg.count}/{SECRETS.length} · {T.names[msg.id]}</b>{T.lines[msg.id]}</>}
    </div>
  )
}
