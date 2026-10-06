import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { byCategory, categories, getProject } from '../data/projects'
import { useContent } from '../hooks/useContent'

export default function Nav({ onOpenPalette }) {
  const c = useContent()
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const [solid, setSolid] = useState(false)
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)
  const { pathname } = useLocation()

  useEffect(() => { setOpen(false); setMenu(null) }, [pathname])
  useEffect(() => {
    if (!open) return
    const id = pathname.split('/')[2]
    setExpanded(getProject(id)?.category || categories.find(k => `/${k.id}` === pathname)?.id || categories[0].id)
  }, [open, pathname])
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setSolid(y > 60)
      setHidden(y > 400 && y > lastY.current)
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header className={`nav ${solid || menu ? 'solid' : ''} ${hidden && !open && !menu ? 'hidden' : ''}`}
        onMouseLeave={() => setMenu(null)}>
        <Link to="/" className="logo">{c.home.name}</Link>
        <nav className="navLinks">
          {categories.map(cat => (
            <NavLink key={cat.id} to={`/${cat.id}`} onMouseEnter={() => setMenu(cat.id)}>{cat.label}</NavLink>
          ))}
          <NavLink to="/about" onMouseEnter={() => setMenu(null)}>About</NavLink>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <button className="kbd" onClick={onOpenPalette} aria-label="Search">⌘K</button>
          <button className={`burger ${open ? 'open' : ''}`} onClick={() => setOpen(o => !o)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>

        {/* SpaceX-style dropdown: category -> its projects */}
        <AnimatePresence>
          {menu && (
            <motion.div className="mega" key={menu}
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}>
              {byCategory(menu).length === 0 && <span className="megaEmpty">First build incoming</span>}
              {byCategory(menu).map(p => (
                <Link key={p.id} to={`/projects/${p.id}`}>
                  <small>{p.kind}</small>
                  <span>{c.projects[p.id]?.hero}</span>
                  <em>{p.status}</em>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {open && <>
          <motion.div className="scrim" onClick={() => setOpen(false)}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside className="drawer"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
            <Link to="/" className="drawerTop">Home</Link>
            {categories.map(cat => {
              const items = byCategory(cat.id)
              const isOpen = expanded === cat.id
              return (
                <div key={cat.id} className={`drawerGroup ${isOpen ? 'open' : ''}`}>
                  <button className="drawerHead" onClick={() => setExpanded(isOpen ? null : cat.id)} aria-expanded={isOpen}>
                    <span>{cat.label}</span>
                    <small>{items.length}</small>
                    <i aria-hidden>+</i>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div className="drawerItems"
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
                        <Link to={`/${cat.id}`} className="drawerAll">All {cat.label.toLowerCase()} →</Link>
                        {items.length === 0 && <span className="drawerEmpty">First build incoming</span>}
                        {items.map(p => (
                          <Link key={p.id} to={`/projects/${p.id}`} className={pathname === `/projects/${p.id}` ? 'active' : ''}>
                            <small>{p.kind}</small>
                            {c.projects[p.id]?.hero}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
            <Link to="/about" className="drawerTop">About</Link>
            <a href={`mailto:${c.home.socials.email}`} className="drawerTop">Contact</a>
          </motion.aside>
        </>}
      </AnimatePresence>
    </>
  )
}
