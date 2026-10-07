import { useState } from 'react'
import { Link } from 'react-router-dom'
import ModelPreview from './ModelPreview'
import Media from './Media'
import Reveal from './Reveal'
import { getMedia } from '../data/media'
import { useContent } from '../hooks/useContent'

// SpaceX vehicles-style row of tall cards
export default function Lineup({ items }) {
  const c = useContent()
  if (!items.length) {
    return (
      <div className="lineup">
        <div className="lineCard lineEmpty">
          <div className="lineText">
            <small>Classified · in the shop</small>
            <h3>First build incoming</h3>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="lineup">
      {items.map((p, i) => <Card key={p.id} p={p} i={i} c={c} />)}
    </div>
  )
}

function Card({ p, i, c }) {
  const [hover, setHover] = useState(false)
  const m = getMedia(p.id)
  return (
          <Reveal delay={i * 0.07}>
            <Link to={`/projects/${p.id}`} className="lineCard" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
              <div className="lineMedia"><Media item={m.model ? null : m.hero || m.gallery[0]} label="" /></div>
              {m.model && <ModelPreview model={m.model} hover={hover} fill={0.82} className="modelLayer" style={{ bottom: '24%' }} />}
              <span className="arrow">→</span>
              <div className="lineText">
                <small>{p.kind} · {p.year}</small>
                <h3>{c.projects[p.id]?.hero}</h3>
                <em>{p.status}</em>
              </div>
            </Link>
          </Reveal>
  )
}
