import { useEffect, useRef, useState } from 'react'
import { animate, useInView } from 'framer-motion'

// Counts up from 0 the first time it scrolls into view
export default function CountUp({ to, duration = 1.6 }) {
  const ref = useRef()
  const inView = useInView(ref, { once: true })
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!inView) return
    const c = animate(0, Number(to) || 0, { duration, ease: [0.22, 1, 0.36, 1], onUpdate: n => setV(Math.round(n)) })
    return () => c.stop()
  }, [inView, to, duration])
  return <span ref={ref}>{v}</span>
}
