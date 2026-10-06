import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// Launch countdown on the first visit of a session. Click to skip.
const STEPS = ['T-3', 'T-2', 'T-1', 'Liftoff']

export default function Intro() {
  const [i, setI] = useState(() => {
    try { return sessionStorage.getItem('av_intro') ? -1 : 0 } catch { return -1 }
  })

  useEffect(() => {
    if (i < 0) return
    try { sessionStorage.setItem('av_intro', '1') } catch { /* ignore */ }
    const t = setTimeout(() => setI(n => (n + 1 < STEPS.length ? n + 1 : -1)), i === STEPS.length - 1 ? 650 : 420)
    return () => clearTimeout(t)
  }, [i])

  return (
    <AnimatePresence>
      {i >= 0 && (
        <motion.div className="intro" onClick={() => setI(-1)}
          exit={{ y: '-100%' }} transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}>
          <AnimatePresence mode="wait">
            <motion.span key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.18 }}>{STEPS[i]}</motion.span>
          </AnimatePresence>
          <div className="introBar"><motion.i initial={{ scaleX: 0 }} animate={{ scaleX: (i + 1) / STEPS.length }} /></div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
