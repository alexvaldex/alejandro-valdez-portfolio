import { Link, Navigate, useParams } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import Media from '../components/Media'
import Reveal from '../components/Reveal'
import ScrollModel from '../components/ScrollModel'
import { getProject, projects } from '../data/projects'
import { getMedia } from '../data/media'
import { RepoCard } from '../components/GitHubPanel'
import { useProjectContent } from '../hooks/useContent'

function Hero({ c, project, media }) {
  const ref = useRef()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <section className="panel" ref={ref}>
      <motion.div className="panelMedia" style={{ y }}>
        <Media item={media.hero} label={`src/media/${project.id}/hero.jpg or hero.mp4`} />
      </motion.div>
      <motion.div className="panelContent" style={{ opacity: fade }}>
        <Reveal as="p" className="eyebrow">{c.eyebrow} · {project.status}</Reveal>
        <Reveal as="h1" className="display" delay={0.1}>{c.hero}</Reveal>
        <Reveal as="p" className="body" delay={0.2}>{c.tagline}</Reveal>
      </motion.div>
      <div className="scrollCue" />
    </section>
  )
}

// Gallery: first item full-bleed, then pairs, then full-bleed, repeating
function Gallery({ items }) {
  const blocks = []
  for (let i = 0; i < items.length;) {
    if (blocks.length % 2 === 0 || i === items.length - 1) { blocks.push([items[i]]); i += 1 }
    else { blocks.push([items[i], items[i + 1]]); i += 2 }
  }
  return blocks.map((b, i) => b.length === 1
    ? <Reveal as="figure" key={i} className="mediaBlock"><Media item={b[0]} /><figcaption>{b[0].caption}</figcaption></Reveal>
    : <div key={i} className="mediaGrid">{b.map((it, j) => (
        <Reveal as="figure" key={j} delay={j * 0.1} className="mediaBlock"><Media item={it} /><figcaption>{it.caption}</figcaption></Reveal>
      ))}</div>)
}

export default function ProjectPage() {
  const { id } = useParams()
  const project = getProject(id)
  const c = useProjectContent(id)
  if (!project) return <Navigate to="/" replace />

  const media = getMedia(id)
  const next = projects[(projects.indexOf(project) + 1) % projects.length]
  const nextC = useProjectContent(next.id)
  const details = [1, 2, 3].map(n => [c[`detail${n}Title`], c[`detail${n}`]]).filter(([t]) => t)

  return (
    <main>
      <Hero c={c} project={project} media={media} />

      <div className="stats">
        {project.stats.map(([v, l], i) => (
          <Reveal key={i} delay={i * 0.1} className="stat">
            <div className="statValue">{v}</div>
            <div className="statLabel">{l}</div>
          </Reveal>
        ))}
      </div>

      <section className="overview">
        <Reveal as="h2" className="title">Overview</Reveal>
        <Reveal as="p" className="body" delay={0.1}>{c.overview}</Reveal>
      </section>

      {project.type === 'model' && (
        <ScrollModel title={c.hero} scenes={project.scenes} model={media.model} projectId={id} />
      )}

      <Gallery items={media.gallery} />

      <section className="overview" style={{ paddingBottom: 80 }}>
        <Reveal as="h2" className="title">Engineering</Reveal>
      </section>
      <div className="details">
        {details.map(([t, d], i) => (
          <Reveal key={i} delay={i * 0.1} className="detail"><h3>{t}</h3><p>{d}</p></Reveal>
        ))}
      </div>
      {c.tags?.length > 0 && <div className="tags">{c.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>}

      <RepoCard name={project.repo} />

      <Link to={`/projects/${next.id}`} className="next">
        <p className="eyebrow" style={{ marginBottom: 18 }}>Next project</p>
        <h2 className="display">{nextC.hero} →</h2>
      </Link>
    </main>
  )
}
