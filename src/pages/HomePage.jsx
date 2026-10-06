import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Media from '../components/Media'
import Reveal from '../components/Reveal'
import Lineup from '../components/Lineup'
import CountUp from '../components/CountUp'
import { GitHubProfile } from '../components/GitHubPanel'
import { byCategory, categories, projects } from '../data/projects'
import { getMedia, resumeUrl } from '../data/media'
import { useContent } from '../hooks/useContent'

const rise = (d = 0) => ({
  initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 },
  transition: { duration: 1.1, delay: d, ease: [0.22, 1, 0.36, 1] },
})

const FEATURED = ['odysseus', 'sunflower', 'monkeybar']

export default function HomePage() {
  const c = useContent()
  const home = getMedia('home')

  return (
    <main>
      <section className="panel">
        <div className="panelMedia"><Media item={home.hero} label="src/media/home/hero.mp4 or hero.jpg" /></div>
        <div className="panelContent">
          {c.home.available && <motion.span className="chip" {...rise(0.1)}><i />{c.home.available}</motion.span>}
          <motion.p className="eyebrow" {...rise(0.2)}>{c.home.eyebrow}</motion.p>
          <motion.h1 className="display" {...rise(0.35)}>{c.home.headline}</motion.h1>
          <motion.p className="body" {...rise(0.5)}>{c.home.bio}</motion.p>
          <motion.div {...rise(0.65)} style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 10 }}>
            <Link className="btn" to="/rockets">See the rockets</Link>
            {resumeUrl
              ? <a className="btn" href={resumeUrl} target="_blank" rel="noreferrer">Resume</a>
              : <a className="btn" href={`mailto:${c.home.socials.email}`}>Get in touch</a>}
          </motion.div>
        </div>
        <div className="scrollCue" />
      </section>

      {/* By the numbers */}
      <div className="stats">
        <Reveal className="stat"><div className="statValue"><CountUp to={projects.length} /></div><div className="statLabel">Engineering projects</div></Reveal>
        <Reveal className="stat" delay={0.1}><div className="statValue"><CountUp to={byCategory('rockets').length} /></div><div className="statLabel">Flight hardware programs</div></Reveal>
        <Reveal className="stat" delay={0.2}><div className="statValue"><CountUp to={2} /></div><div className="statLabel">Organizations founded</div></Reveal>
      </div>

      {/* Featured, full screen */}
      {FEATURED.map(id => {
        const p = projects.find(x => x.id === id)
        const pc = c.projects[id] || {}
        const m = getMedia(id)
        return (
          <section className="panel" key={id}>
            <div className="panelMedia"><Media item={m.hero || m.gallery[0]} label={`src/media/${id}/hero.jpg`} /></div>
            <div className="panelContent">
              <Reveal as="p" className="eyebrow">{p.kind} · {p.status}</Reveal>
              <Reveal as="h2" className="display" delay={0.08}>{pc.hero}</Reveal>
              <Reveal as="p" className="body" delay={0.16}>{pc.tagline}</Reveal>
              <Reveal delay={0.24}><Link className="btn" to={`/projects/${id}`}>Explore</Link></Reveal>
            </div>
          </section>
        )
      })}

      {/* Every category, SpaceX vehicles style */}
      {categories.map(cat => (
        <section key={cat.id}>
          <div className="catHead" style={{ paddingTop: 140, paddingBottom: 56 }}>
            <div>
              <Reveal as="p" className="eyebrow">{cat.blurb}</Reveal>
              <Reveal as="h2" className="display" delay={0.08}>{cat.label}</Reveal>
            </div>
            <Link className="btn" to={`/${cat.id}`}>View all</Link>
          </div>
          <Lineup items={byCategory(cat.id)} />
        </section>
      ))}

      <GitHubProfile />

      <section className="cta">
        <Reveal as="p" className="eyebrow">Let's build something</Reveal>
        <Reveal as="h2" className="display" delay={0.08}>Get in touch</Reveal>
        <Reveal delay={0.16} style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <a className="btn" href={`mailto:${c.home.socials.email}`}>Email me</a>
          <a className="btn" href={c.home.socials.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          <a className="btn" href={c.home.socials.github} target="_blank" rel="noreferrer">GitHub</a>
        </Reveal>
      </section>
    </main>
  )
}
