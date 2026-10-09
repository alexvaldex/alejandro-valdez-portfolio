import Reveal from './Reveal'
import { useContent } from '../hooks/useContent'

// Paste any LinkedIn post link (or its "Embed this post" code) into
// home.linkedinPosts in content.json or /admin. Each becomes a live embedded post.
function toEmbed(raw) {
  if (!raw) return null
  const src = raw.match(/src="([^"]+)"/)?.[1] || raw
  if (/linkedin\.com\/embed\//.test(src)) return src.split('?')[0]
  const urn = src.match(/urn:li:(activity|share|ugcPost):(\d{10,})/)
  if (urn) return `https://www.linkedin.com/embed/feed/update/urn:li:${urn[1]}:${urn[2]}`
  const act = src.match(/activity[-:](\d{10,})/)
  if (act) return `https://www.linkedin.com/embed/feed/update/urn:li:activity:${act[1]}`
  return null
}

export default function LinkedInFeed() {
  const home = useContent('home')
  const posts = (home.linkedinPosts || []).map(toEmbed).filter(Boolean)

  return (
    <section className="li">
      <div className="kitHead" style={{ paddingTop: 140 }}>
        <div>
          <Reveal as="p" className="eyebrow">Build log</Reveal>
          <Reveal as="h2" className="title" delay={0.06} style={{ marginTop: 14 }}>From my LinkedIn</Reveal>
        </div>
        <Reveal delay={0.1}><a className="btn" href={home.socials.linkedin} target="_blank" rel="noreferrer">Follow on LinkedIn</a></Reveal>
      </div>
      {posts.length > 0 ? (
        <div className="liRow">
          {posts.map(src => (
            <div key={src} className="liPost">
              <iframe src={src} title="LinkedIn post" loading="lazy" allowFullScreen />
            </div>
          ))}
        </div>
      ) : (
        <a className="liEmpty" href={home.socials.linkedin} target="_blank" rel="noreferrer">
          <small>linkedin.com/in/alejandro-valdez15</small>
          <span>Launch updates, build progress, and what I'm working on next →</span>
        </a>
      )}
    </section>
  )
}
