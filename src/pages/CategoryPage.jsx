import { Link, Navigate } from 'react-router-dom'
import Media from '../components/Media'
import ModelPreview from '../components/ModelPreview'
import Reveal from '../components/Reveal'
import Lineup from '../components/Lineup'
import { byCategory, categories } from '../data/projects'
import { getMedia } from '../data/media'
import { useContent } from '../hooks/useContent'

export default function CategoryPage({ id }) {
  const c = useContent()
  const cat = categories.find(k => k.id === id)
  if (!cat) return <Navigate to="/" replace />
  const items = byCategory(id)

  return (
    <main>
      <div className="catHead">
        <div>
          <Reveal as="p" className="eyebrow">{items.length ? `${items.length} project${items.length > 1 ? 's' : ''}` : 'Coming soon'}</Reveal>
          <Reveal as="h1" className="display" delay={0.08} style={{ fontSize: 'clamp(56px, 11vw, 160px)' }}>{cat.label}</Reveal>
        </div>
        <Reveal as="p" className="body" delay={0.16}>{cat.blurb}</Reveal>
      </div>
      <Lineup items={items} />

      {items.map(p => {
        const pc = c.projects[p.id] || {}
        const m = getMedia(p.id)
        return (
          <section className="panel" key={p.id}>
            <div className="panelMedia"><Media item={m.hero || m.gallery[0]} label={m.model ? '' : `src/media/${p.id}/hero.jpg`} /></div>
            {m.model && <ModelPreview model={m.model} fill={0.85} style={{ left: '38%', top: '12%', bottom: '12%', zIndex: 1 }} />}
            <div className="panelContent">
              <Reveal as="p" className="eyebrow">{p.kind} · {p.status}</Reveal>
              <Reveal as="h2" className="display" delay={0.08}>{pc.hero}</Reveal>
              <Reveal as="p" className="body" delay={0.16}>{pc.tagline}</Reveal>
              <Reveal delay={0.24}><Link className="btn" to={`/projects/${p.id}`}>Explore</Link></Reveal>
            </div>
          </section>
        )
      })}
    </main>
  )
}
