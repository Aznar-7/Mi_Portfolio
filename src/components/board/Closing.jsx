import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUpRight, Check, Copy, FileDown, Mail, Power } from 'lucide-react'
import { useSoundEffects } from '@/contexts/SoundContext'
import { GitHubIcon, LinkedInIcon } from '@/components/common/SocialIcons'
import { useLang } from '@/contexts/LanguageContext'
import { copy } from '@/i18n/site'
import { site } from '@/data/site'
import { findSecret, useSecretCount, SECRETS } from '@/lib/secrets'
import { powerOn } from '@/lib/power'
import { ContactForm } from './ContactForm'
import { PowerTitle } from './PowerTitle'

// Email first and large, the other channels as one clean list; the form sits in its own panel
export function Contact() {
  const { lang } = useLang()
  const T = copy[lang].contact
  const { playSuccess, playHover } = useSoundEffects()
  const [copied, setCopied] = useState(false)
  const doCopy = async () => {
    try { await navigator.clipboard.writeText(site.email); setCopied(true); playSuccess() } catch { /* the address stays selectable */ }
    setTimeout(() => setCopied(false), 2200)
  }
  const channels = [
    { href: site.linkedin, Icon: LinkedInIcon, label: 'LinkedIn', value: site.linkedin.split('/in/')[1], ext: true },
    { href: site.github, Icon: GitHubIcon, label: 'GitHub', value: site.github.split('github.com/')[1], ext: true },
    { href: site.resumes.es.url, Icon: FileDown, label: `${T.cv} · ${T.es}`, value: 'PDF', download: site.resumes.es.filename },
    { href: site.resumes.en.url, Icon: FileDown, label: `${T.cv} · ${T.en}`, value: 'PDF', download: site.resumes.en.filename },
  ]
  return (
    <section className="contact" id="contacto">
      <h2 className="sr-only">{T.title}</h2>
      <div className="contact-split">
        <div className="contact-left">
          <p className="big">{T.big}</p>
          <p className="sec-intro">{T.intro}</p>
          <div className="mail-line">
            <Mail size={20} aria-hidden="true" />
            <a className="mail-big" href={`mailto:${site.email}`}>{site.email}</a>
            <button className="copy-btn" onClick={doCopy} aria-label={T.copy}>
              {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
              <span aria-live="polite">{copied ? T.copied : T.copy}</span>
            </button>
          </div>
          <ul className="channels">
            {channels.map(({ href, Icon, label, value, ext, download }) => (
              <li key={label}>
                <a href={href} onPointerEnter={playHover} {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : { download })}>
                  <Icon size={17} aria-hidden="true" />
                  <span className="ch-label">{label}</span>
                  <span className="ch-value">{value}</span>
                  {ext ? <ArrowUpRight size={17} aria-hidden="true" className="ch-go" /> : <ArrowDown size={17} aria-hidden="true" className="ch-go" />}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="contact-right">
          <p className="form-title">{T.formTitle}</p>
          <ContactForm />
        </div>
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
