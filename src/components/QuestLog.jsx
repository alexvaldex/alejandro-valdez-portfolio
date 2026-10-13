import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Reveal from './Reveal'
import { getMedia } from '../data/media'
import { useContent } from '../hooks/useContent'

// Side Quests index: a numbered log. Hovering a row floats its photo next to the cursor.
export default function QuestLog({ items }) {
  const c = useContent()
  const [hover, setHover] = useState(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const media = Object.fromEntries(items.map(p => [p.id, getMedia(p.id)]))

  return (
    <div className="quest" onMouseMove={e => setPos({ x: e.clientX, y: e.clientY })} onMouseLeave={() => setHover(null)}>
      {items.map((p, i) => {
        const pc = c.projects[p.id] || {}
        const m = media[p.id]
        return (
          <Reveal key={p.id} delay={i * 0.04}>
            <Link to={`/projects/${p.id}`} className="questRow" onMouseEnter={() => setHover(p.id)}>
              <span className="questNum">{String(i + 1).padStart(2, '0')}</span>
              <span className="questName">{pc.hero}</span>
              <span className="questKind">{p.kind}</span>
              <span className="questEra">{p.year}</span>
              <span className="questCount">{m.gallery.length} shots</span>
              <span className="questArrow">→</span>
              {m.hero && <img className="questThumb" src={m.hero.url} alt="" loading="lazy" />}
            </Link>
          </Reveal>
        )
      })}
      <AnimatePresence>
        {hover && media[hover]?.hero && (
          <motion.img key={hover} className="questFloat" src={media[hover].hero.url} alt=""
            initial={{ opacity: 0, scale: 0.9, rotate: -3 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25 }} style={{ left: pos.x + 28, top: pos.y - 120 }} />
        )}
      </AnimatePresence>
    </div>
  )
}
