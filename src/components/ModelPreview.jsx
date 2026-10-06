import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Model, Studio } from './ScrollModel'

// Slowly turning product shot for cards. Only mounts its WebGL canvas while
// on screen, since browsers cap how many 3D canvases a page can run at once.
// Sways side to side (a full spin would swing a long rocket's nose into the lens).
// Measures the loaded model and backs the camera off until it fits the card.
function Turntable({ children, hover, fill }) {
  const ref = useRef()
  const t = useRef(0)
  const amp = useRef(0.45)
  const dims = useRef(null)
  const { camera, size } = useThree()

  useFrame((_, dt) => {
    const g = ref.current
    if (!g) return
    t.current += dt * (hover ? 1.1 : 0.45)
    amp.current = THREE.MathUtils.damp(amp.current, hover ? 0.8 : 0.45, 3, dt)

    if (!dims.current) {
      g.updateMatrixWorld(true)
      const box = new THREE.Box3()
      g.traverse(o => { if (o.isMesh && o.visible) box.union(new THREE.Box3().setFromObject(o)) })
      if (box.isEmpty()) return
      dims.current = box.getSize(new THREE.Vector3())
      camera.position.z = 40
    }
    g.rotation.y = -0.45 + Math.sin(t.current) * amp.current
    g.rotation.x = 0.22

    const d = dims.current
    const vFov = THREE.MathUtils.degToRad(camera.fov)
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * (size.width / size.height))
    const halfW = Math.max(d.x, d.z) / 2
    const halfH = d.y / 2 + Math.min(d.x, d.z) * 0.25
    const fit = Math.max(halfW / Math.tan(hFov / 2), halfH / Math.tan(vFov / 2)) / fill + Math.max(d.x, d.z) * 0.3
    camera.position.z = THREE.MathUtils.damp(camera.position.z, fit, 5, dt)
    camera.position.y = fit * 0.08
    camera.lookAt(0, 0, 0)
  })
  return <group ref={ref}>{children}</group>
}

export default function ModelPreview({ model, fill = 0.8, hover = false, style, className }) {
  const box = useRef()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '200px 0px' })
    io.observe(box.current)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={box} className={className} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', ...style }}>
      {visible && model && (
        <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0.8, 12], fov: 30 }}
          gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
          style={{ position: 'absolute', inset: 0 }}>
          <Studio />
          <Suspense fallback={null}>
            <Turntable hover={hover} fill={fill}><Model model={model} /></Turntable>
          </Suspense>
        </Canvas>
      )}
    </div>
  )
}
