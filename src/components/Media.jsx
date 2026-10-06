import { useEffect, useRef } from 'react'

// Renders an image or a muted autoplaying looped video. Videos only play while on screen.
export default function Media({ item, label }) {
  const ref = useRef()

  useEffect(() => {
    const v = ref.current
    if (!v || item?.type !== 'video') return
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.15 })
    io.observe(v)
    return () => io.disconnect()
  }, [item])

  if (!item) {
    return <div className="placeholder"><span>{label}</span></div>
  }
  if (item.type === 'video') {
    return <video ref={ref} src={item.url} muted loop playsInline preload="metadata" />
  }
  return <img src={item.url} alt={item.caption} loading="lazy" />
}
