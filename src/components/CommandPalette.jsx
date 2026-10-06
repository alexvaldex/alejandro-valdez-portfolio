import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { categories, projects } from '../data/projects'
import { resumeUrl } from '../data/media'
import { useContent } from '../hooks/useContent'

// ⌘K / Ctrl+K: jump to any page or run an action
export default function CommandPalette({ open, setOpen }) {
  const c = useContent()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const [toast, setToast] = useState('')
  const input = useRef()

  const items = useMemo(() => {
    const s = c.home.socials
    return [
      ...projects.map(p => ({ group: categories.find(k => k.id === p.category)?.label, label: c.projects[p.id]?.hero, hint: p.kind, run: () => nav(`/projects/${p.id}`) })),
      ...categories.map(k => ({ group: 'Pages', label: k.label, hint: k.blurb, run: () => nav(`/${k.id}`) })),
      { group: 'Pages', label: 'About & experience', hint: 'Timeline, skills', run: () => nav('/about') },
      { group: 'Actions', label: 'Copy email address', hint: s.email, run: () => { navigator.clipboard?.writeText(s.email); setToast('Email copied') } },
      { group: 'Actions', label: 'Open GitHub', hint: 'github.com/alexvaldex', run: () => window.open(s.github, '_blank') },
      { group: 'Actions', label: 'Open LinkedIn', hint: 'alejandro-valdez15', run: () => window.open(s.linkedin, '_blank') },
      ...(resumeUrl ? [{ group: 'Actions', label: 'Download resume', hint: 'PDF', run: () => window.open(resumeUrl, '_blank') }] : []),
    ]
  }, [c, nav])

  const results = items.filter(i => `${i.label} ${i.hint} ${i.group}`.toLowerCase().includes(q.toLowerCase()))

  useEffect(() => {
    const onKey = e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen(o => !o) }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setOpen])
  useEffect(() => { if (open) { setQ(''); setSel(0); setTimeout(() => input.current?.focus(), 50) } }, [open])
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 1800); return () => clearTimeout(t) }, [toast])

  const run = i => { i.run(); setOpen(false) }
  const onKeyDown = e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(s + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => Math.max(s - 1, 0)) }
    if (e.key === 'Enter' && results[sel]) run(results[sel])
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div className="paletteScrim" onClick={() => setOpen(false)}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="palette" onClick={e => e.stopPropagation()}
              initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }}>
              <input ref={input} value={q} onChange={e => { setQ(e.target.value); setSel(0) }} onKeyDown={onKeyDown}
                placeholder="Search projects, pages, actions…" />
              <ul>
                {results.map((r, i) => (
                  <li key={r.group + r.label} className={i === sel ? 'on' : ''} onMouseEnter={() => setSel(i)} onClick={() => run(r)}>
                    <small>{r.group}</small><span>{r.label}</span><em>{r.hint}</em>
                  </li>
                ))}
                {results.length === 0 && <li className="empty">No matches</li>}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {toast && <motion.div className="toast" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}>{toast}</motion.div>}
      </AnimatePresence>
    </>
  )
}
