import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Reveal from './Reveal'
import CountUp from './CountUp'
import { useRepoTree } from '../hooks/useGitHub'
import { GITHUB_USER } from '../data/projects'

// Open-source build kit: pulls the repo tree live from GitHub and lays out
// the CAD, BOM, code, and photos so visitors can browse or download them.

const KINDS = [
  { id: 'cad', label: 'CAD', test: /\.(sldprt|sldasm|step|stp|stl|f3d|iges?|obj|glb)$/i },
  { id: 'image', label: 'Image', test: /\.(png|jpe?g|gif|webp)$/i },
  { id: 'video', label: 'Video', test: /\.(mov|mp4|webm)$/i },
  { id: 'doc', label: 'Doc', test: /\.(pdf|md|txt|docx?|xlsx?|csv)$/i },
  { id: 'code', label: 'Code', test: /\.(c|h|cpp|hpp|py|js|ts|ino|idx|cmake|txt)$/i },
]
const kindOf = path => KINDS.find(k => k.test.test(path))?.id || 'other'
const enc = p => p.split('/').map(encodeURIComponent).join('/')
const size = n => (n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1e3))} KB`)
const clean = name => name.replace(/\.[^.]+$/, '').replace(/[_]+/g, ' ')

export default function RepoExplorer({ name }) {
  const { data, error } = useRepoTree(name)
  const [open, setOpen] = useState(null)
  const [lightbox, setLightbox] = useState(null)
  const base = `https://github.com/${GITHUB_USER}/${name}`

  const view = useMemo(() => {
    if (!data) return null
    const { files, branch } = data
    const raw = p => `https://raw.githubusercontent.com/${GITHUB_USER}/${name}/${branch}/${enc(p)}`
    const blob = p => `${base}/blob/${branch}/${enc(p)}`
    const folders = {}
    files.forEach(f => {
      const top = f.path.includes('/') ? f.path.split('/')[0] : 'Root'
      ;(folders[top] ||= []).push({ ...f, kind: kindOf(f.path), name: f.path.split('/').pop() })
    })
    const count = k => files.filter(f => kindOf(f.path) === k).length
    const bom = files.find(f => /bom/i.test(f.path) && /\.pdf$/i.test(f.path))
    const assembly = files
      .filter(f => /\.(step|stp)$/i.test(f.path) && /assembly/i.test(f.path))
      .sort((a, b) => b.size - a.size)[0]
    const images = files
      .filter(f => kindOf(f.path) === 'image')
      .sort((a, b) => (/cad photos/i.test(b.path) ? 1 : 0) - (/cad photos/i.test(a.path) ? 1 : 0))
      .map(f => ({ src: raw(f.path), caption: clean(f.path.split('/').pop()).replace(/^[0-9A-F-]{20,}.*$/i, '') || f.path.split('/')[0].replace(/ Folder$/i, '') }))
    return { folders, branch, raw, blob, bom, assembly, images, cad: count('cad'), total: files.length,
      totalSize: files.reduce((s, f) => s + (f.size || 0), 0) }
  }, [data, name, base])

  if (!name) return null

  return (
    <section className="kit">
      <div className="kitHead">
        <div>
          <Reveal as="p" className="eyebrow">Open source · build it yourself</Reveal>
          <Reveal as="h2" className="display" delay={0.08}>The full build kit</Reveal>
          <Reveal as="p" className="body" delay={0.16} style={{ marginTop: 20 }}>
            Every CAD file, the bill of materials, and the flight code are public on GitHub.
          </Reveal>
        </div>
        <Reveal delay={0.2} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a className="btn" href={base} target="_blank" rel="noreferrer">View repository</a>
          <a className="btn" href={`${base}/archive/refs/heads/${view?.branch || 'main'}.zip`}>Download all (.zip)</a>
        </Reveal>
      </div>

      {error && <p className="body" style={{ padding: '0 var(--gutter)' }}>GitHub is busy right now. <a href={base} style={{ textDecoration: 'underline' }}>Open the repository directly.</a></p>}

      {view && <>
        <div className="stats">
          <div className="stat"><div className="statValue"><CountUp to={view.cad} /></div><div className="statLabel">CAD files</div></div>
          <div className="stat"><div className="statValue"><CountUp to={view.total} /></div><div className="statLabel">Files in the repo</div></div>
          <div className="stat"><div className="statValue">{size(view.totalSize)}</div><div className="statLabel">Of design data</div></div>
        </div>

        {/* Key downloads */}
        <div className="kitKey">
          {view.assembly && (
            <a href={view.raw(view.assembly.path)} className="kitKeyCard">
              <small>CAD · STEP · {size(view.assembly.size)}</small>
              <h3>Full assembly</h3>
              <p>{clean(view.assembly.path.split("/").pop())}. Opens in Fusion 360, SolidWorks, Onshape, or any CAD tool.</p>
              <span>Download ↓</span>
            </a>
          )}
          {view.bom && (
            <a href={view.blob(view.bom.path)} target="_blank" rel="noreferrer" className="kitKeyCard">
              <small>PDF · {size(view.bom.size)}</small>
              <h3>Bill of materials</h3>
              <p>Every part, quantity, and supplier needed to build the payload.</p>
              <span>Open ↗</span>
            </a>
          )}
          <a href={`${base}/tree/${view.branch}/${enc(Object.keys(view.folders).find(f => /software/i.test(f)) || '')}`} target="_blank" rel="noreferrer" className="kitKeyCard">
            <small>Code</small>
            <h3>Flight software</h3>
            <p>ESP-IDF firmware on FreeRTOS: IMU, tracking, and logging tasks under a flight state machine.</p>
            <span>Browse ↗</span>
          </a>
        </div>

        {/* Folder browser */}
        <div className="kitFolders">
          {Object.entries(view.folders).filter(([f]) => f !== 'Root').map(([folder, files]) => {
            const isOpen = open === folder
            const kinds = KINDS.map(k => [k.label, files.filter(f => f.kind === k.id).length]).filter(([, n]) => n)
            return (
              <div key={folder} className={`kitFolder ${isOpen ? 'open' : ''}`}>
                <button onClick={() => setOpen(isOpen ? null : folder)} aria-expanded={isOpen}>
                  <span className="kitFolderName">{folder.replace(/ Folder$/i, '')}</span>
                  <span className="kitFolderMeta">{kinds.map(([l, n]) => `${n} ${l}`).join(' · ')}</span>
                  <i>+</i>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
                      {files.sort((a, b) => a.path.localeCompare(b.path)).map(f => (
                        <li key={f.path}>
                          <a href={view.blob(f.path)} target="_blank" rel="noreferrer">
                            <em className={`tagKind k-${f.kind}`}>{f.path.split('.').pop().toUpperCase()}</em>
                            <span>{f.path.split('/').slice(1).join(' / ')}</span>
                            <small>{size(f.size)}</small>
                          </a>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        {/* Photos straight from the repo */}
        {view.images.length > 0 && <>
          <div className="kitHead" style={{ paddingTop: 120, paddingBottom: 40 }}>
            <Reveal as="h2" className="title">From the repository</Reveal>
            <p className="eyebrow">{view.images.length} images · click to enlarge</p>
          </div>
          <div className="kitGallery">
            {view.images.map((im, i) => (
              <button key={im.src} onClick={() => setLightbox(i)}>
                <img src={im.src} alt={im.caption} loading="lazy" />
                {im.caption && <span>{im.caption}</span>}
              </button>
            ))}
          </div>
        </>}
      </>}

      <AnimatePresence>
        {lightbox !== null && view && (
          <motion.div className="lightbox" onClick={() => setLightbox(null)}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <img src={view.images[lightbox].src} alt="" onClick={e => { e.stopPropagation(); setLightbox((lightbox + 1) % view.images.length) }} />
            <p className="eyebrow">{lightbox + 1} / {view.images.length} · click image for next · click outside to close</p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
