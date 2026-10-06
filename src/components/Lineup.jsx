import { Link } from 'react-router-dom'
import Media from './Media'
import Reveal from './Reveal'
import { getMedia } from '../data/media'
import { useContent } from '../hooks/useContent'

// SpaceX vehicles-style row of tall cards
export default function Lineup({ items }) {
  const c = useContent()
  return (
    <div className="lineup">
      {items.map((p, i) => {
        const m = getMedia(p.id)
        return (
          <Reveal key={p.id} delay={i * 0.07}>
            <Link to={`/projects/${p.id}`} className="lineCard">
              <div className="lineMedia"><Media item={m.hero || m.gallery[0]} label="" /></div>
              <span className="arrow">→</span>
              <div>
                <small>{p.kind} · {p.year}</small>
                <h3>{c.projects[p.id]?.hero}</h3>
                <em>{p.status}</em>
              </div>
            </Link>
          </Reveal>
        )
      })}
    </div>
  )
}
