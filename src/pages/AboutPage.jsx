import { useState } from 'react'
import Reveal from '../components/Reveal'
import { GitHubProfile } from '../components/GitHubPanel'
import { resumeUrl } from '../data/media'
import { useContent } from '../hooks/useContent'

export default function AboutPage() {
  const c = useContent()
  const a = c.about
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard?.writeText(c.home.socials.email); setCopied(true); setTimeout(() => setCopied(false), 1600) }

  return (
    <main>
      <div className="catHead">
        <div style={{ maxWidth: 900 }}>
          {c.home.available && <Reveal as="span" className="chip" style={{ marginBottom: 28 }}><i />{c.home.available}</Reveal>}
          <Reveal as="h1" className="display" delay={0.08}>{c.home.name}</Reveal>
          <Reveal as="p" className="body" delay={0.16} style={{ marginTop: 28, fontSize: 20, maxWidth: 720, color: 'rgba(255,255,255,0.78)' }}>{a.intro}</Reveal>
        </div>
        <Reveal delay={0.24} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {resumeUrl && <a className="btn" href={resumeUrl} target="_blank" rel="noreferrer">Download resume</a>}
          <button className="btn" onClick={copy}>{copied ? 'Copied' : 'Copy email'}</button>
        </Reveal>
      </div>

      <section className="overview" style={{ paddingTop: 60, paddingBottom: 60 }}><Reveal as="h2" className="title">Experience</Reveal></section>
      <div className="timeline">
        {a.experience.map((e, i) => (
          <Reveal key={i} className="tlRow" delay={i * 0.05}>
            <span className="when">{e.when}</span>
            <h3>{e.role}<small>{e.org}</small></h3>
            <p>{e.text}</p>
          </Reveal>
        ))}
      </div>

      <section className="overview" style={{ paddingTop: 20, paddingBottom: 60 }}><Reveal as="h2" className="title">Skills</Reveal></section>
      <div className="skills">
        {Object.entries(a.skills).map(([group, list], i) => (
          <Reveal key={group} delay={i * 0.08}>
            <p className="eyebrow" style={{ marginBottom: 12, color: '#fff' }}>{group}</p>
            <ul>{list.map(s => <li key={s}>{s}</li>)}</ul>
          </Reveal>
        ))}
      </div>

      <GitHubProfile />
    </main>
  )
}
