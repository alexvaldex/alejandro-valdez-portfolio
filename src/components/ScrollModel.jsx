// Apple-style product scroll: the stage pins to the screen while you scroll,
// the model turns and the camera pushes in, captions fade through.
// The canvas never captures the wheel, so page scrolling is always smooth.

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows, OrbitControls, useGLTF, useProgress } from '@react-three/drei'
import { motion, useScroll, useTransform } from 'framer-motion'
import * as THREE from 'three'
import { STLLoader } from 'three/addons/loaders/STLLoader.js'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js'

export const FIT = 5 // world units the model's longest side is scaled to

// CAD exports sometimes include loose bodies parked away from the assembly.
// Group meshes whose (slightly padded) boxes touch, keep the biggest group,
// and hide the rest so the camera frames the real product.
function mainAssemblyBox(object) {
  object.updateMatrixWorld(true)
  const meshes = []
  object.traverse(o => { if (o.isMesh) meshes.push({ o, box: new THREE.Box3().setFromObject(o) }) })
  const all = new THREE.Box3().setFromObject(object)
  if (meshes.length < 2) return all

  const pad = all.getSize(new THREE.Vector3()).length() * 0.02
  const parent = meshes.map((_, i) => i)
  const find = i => (parent[i] === i ? i : (parent[i] = find(parent[i])))
  const padded = meshes.map(m => m.box.clone().expandByScalar(pad))
  for (let i = 0; i < meshes.length; i++)
    for (let j = i + 1; j < meshes.length; j++)
      if (padded[i].intersectsBox(padded[j])) parent[find(i)] = find(j)

  const groups = {}
  meshes.forEach((m, i) => {
    const g = (groups[find(i)] ||= { box: new THREE.Box3(), items: [], vol: 0 })
    g.box.union(m.box); g.items.push(m.o)
    const v = m.box.getSize(new THREE.Vector3()); g.vol += v.x * v.y * v.z
  })
  const sorted = Object.values(groups).sort((a, b) => b.vol - a.vol)
  sorted.slice(1).forEach(g => g.items.forEach(o => { o.visible = false; o.userData.detached = true }))
  return sorted[0].box
}

function assemblyBox(root) {
  const box = new THREE.Box3()
  root.traverse(o => { if (o.isMesh && !o.userData.detached) box.union(new THREE.Box3().setFromObject(o)) })
  return box
}

// Center, scale, and lay elongated models (rockets) on their side like a product shot
function normalize(object) {
  const box = mainAssemblyBox(object)
  const size = box.getSize(new THREE.Vector3())
  const wrap = new THREE.Group()
  const inner = new THREE.Group()
  inner.add(object)
  object.position.sub(box.getCenter(new THREE.Vector3()))

  const longest = Math.max(size.x, size.y, size.z)
  const others = [size.x, size.y, size.z].sort((a, b) => b - a)[1]
  if (longest / others > 1.8) {
    if (size.y === longest) inner.rotation.z = Math.PI / 2
    else if (size.z === longest) inner.rotation.y = Math.PI / 2
  }
  wrap.add(inner)
  wrap.scale.setScalar(FIT / longest)
  return wrap
}

// Keep the CAD colors, swap the flat Phong look for physically based shading
function upgradeMaterials(object, fallbackColor) {
  object.traverse(o => {
    if (!o.isMesh) return
    o.castShadow = o.receiveShadow = true
    const mats = Array.isArray(o.material) ? o.material : [o.material]
    const next = mats.map(m => {
      if (m?.isMeshStandardMaterial) { m.envMapIntensity = 1.2; return m }
      return new THREE.MeshStandardMaterial({
        color: m?.color && !fallbackColor ? m.color.clone() : new THREE.Color(fallbackColor || '#c9ccd1'),
        map: m?.map || null,
        transparent: m?.transparent || (m?.opacity ?? 1) < 1,
        opacity: m?.opacity ?? 1,
        metalness: 0.35,
        roughness: 0.42,
        side: THREE.DoubleSide,
      })
    })
    o.material = Array.isArray(o.material) ? next : next[0]
  })
  return object
}

function useReady(object, onReady) {
  useEffect(() => { onReady?.(object) }, [object, onReady])
  return object
}

function GLB({ url, onReady }) {
  const { scene } = useGLTF(url)
  const object = useMemo(() => normalize(upgradeMaterials(scene.clone(true))), [scene])
  return <primitive object={useReady(object, onReady)} />
}

function OBJWithMTL({ url, mtl, onReady }) {
  const materials = useLoader(MTLLoader, mtl)
  const obj = useLoader(OBJLoader, url, l => { materials.preload(); l.setMaterials(materials) })
  const object = useMemo(() => normalize(upgradeMaterials(obj.clone(true))), [obj])
  return <primitive object={useReady(object, onReady)} />
}

function OBJPlain({ url, onReady }) {
  const obj = useLoader(OBJLoader, url)
  const object = useMemo(() => normalize(upgradeMaterials(obj.clone(true), '#c9ccd1')), [obj])
  return <primitive object={useReady(object, onReady)} />
}

function STL({ url, onReady }) {
  const geo = useLoader(STLLoader, url)
  const object = useMemo(() => {
    geo.computeVertexNormals()
    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: '#c9ccd1', metalness: 0.55, roughness: 0.32 }))
    return normalize(upgradeMaterials(mesh))
  }, [geo])
  return <primitive object={useReady(object, onReady)} />
}

// Shown when no model has been dropped in yet
function PlaceholderRocket({ onReady }) {
  const ref = useRef()
  useEffect(() => { if (ref.current) onReady?.(upgradeMaterials(ref.current)) }, [onReady])
  const body = { color: '#d8d8d8', metalness: 0.5, roughness: 0.3 }
  return (
    <group ref={ref} rotation={[0, 0, -Math.PI / 2]} scale={FIT / 4.5}>
      <mesh castShadow><cylinderGeometry args={[0.32, 0.32, 3.4, 64]} /><meshStandardMaterial {...body} /></mesh>
      <mesh position={[0, 2.25, 0]} castShadow><coneGeometry args={[0.32, 1.1, 64]} /><meshStandardMaterial {...body} /></mesh>
      <mesh position={[0, 0.6, 0]}><cylinderGeometry args={[0.325, 0.325, 0.05, 64]} /><meshStandardMaterial color="#111" /></mesh>
      {[0, 1, 2, 3].map(i => (
        <mesh key={i} position={[Math.sin(i * Math.PI / 2) * 0.48, -1.35, Math.cos(i * Math.PI / 2) * 0.48]} rotation={[0, i * Math.PI / 2, 0]} castShadow>
          <boxGeometry args={[0.03, 0.75, 0.38]} /><meshStandardMaterial color="#111" metalness={0.3} roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export function Model({ model, onReady }) {
  if (!model) return <PlaceholderRocket onReady={onReady} />
  if (model.ext === 'glb' || model.ext === 'gltf') return <GLB url={model.url} onReady={onReady} />
  if (model.ext === 'obj') return model.mtl ? <OBJWithMTL url={model.url} mtl={model.mtl} onReady={onReady} /> : <OBJPlain url={model.url} onReady={onReady} />
  return <STL url={model.url} onReady={onReady} />
}

// ─── Explore mode: zoom, click-to-remove parts, explode, cutaway ───
// Prepares every mesh once: own material (so one part can highlight alone),
// clipping plane, and an explode direction pointing away from the model center.
function prepareParts(root, plane) {
  root.updateMatrixWorld(true)
  const rootCenter = assemblyBox(root).getCenter(new THREE.Vector3())
  const parts = []
  root.traverse(o => {
    if (!o.isMesh || o.userData.detached) return
    o.material = Array.isArray(o.material) ? o.material.map(m => m.clone()) : o.material.clone()
    ;[].concat(o.material).forEach(m => { m.clippingPlanes = [plane]; m.clipShadows = true; m.side = THREE.DoubleSide })
    const worldCenter = new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3())
    const inv = new THREE.Matrix4().copy(o.parent.matrixWorld).invert()
    const a = worldCenter.clone().applyMatrix4(inv)
    const b = rootCenter.clone().applyMatrix4(inv)
    parts.push({ mesh: o, base: o.position.clone(), dir: a.sub(b) })
  })
  return parts
}

function setHighlight(mesh, on) {
  ;[].concat(mesh.material).forEach(m => m.emissive?.set(on ? '#3a3a3a' : '#000'))
}

function Explorer({ groupRef, root, active, cut, explode, zoomReq, onHide }) {
  const { camera, gl, controls } = useThree()
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, -1), 1e4), [])
  const parts = useMemo(() => (root ? prepareParts(root, plane) : []), [root, plane])
  const extent = useMemo(() => {
    if (!root || !groupRef.current) return [-3, 3]
    const g = groupRef.current
    const saved = g.rotation.clone()
    g.rotation.set(0, 0, 0); g.updateMatrixWorld(true)
    const box = assemblyBox(root)
    g.rotation.copy(saved); g.updateMatrixWorld(true)
    return [box.min.z, box.max.z]
  }, [root, groupRef])

  useEffect(() => { gl.localClippingEnabled = true }, [gl])

  // Zoom buttons
  useEffect(() => {
    if (!zoomReq.n) return
    const target = controls?.target || new THREE.Vector3()
    const offset = camera.position.clone().sub(target).multiplyScalar(zoomReq.factor)
    const d = THREE.MathUtils.clamp(offset.length(), 1.2, 30)
    camera.position.copy(target).add(offset.setLength(d))
    controls?.update()
  }, [zoomReq, camera, controls])

  // Leaving explore mode puts every part back
  useEffect(() => {
    if (active) return
    parts.forEach(p => { p.mesh.visible = true; p.mesh.position.copy(p.base); setHighlight(p.mesh, false) })
  }, [active, parts])

  const smooth = useRef({ cut: 0, explode: 0 })
  useFrame((_, dt) => {
    const s = smooth.current
    s.cut = THREE.MathUtils.damp(s.cut, active ? cut : 0, 8, dt)
    s.explode = THREE.MathUtils.damp(s.explode, active ? explode : 0, 6, dt)
    // cutaway plane lives in the model's own frame so it turns with it
    const [zMin, zMax] = extent
    const c = s.cut < 0.001 ? 1e4 : zMax - s.cut * (zMax - zMin)
    if (groupRef.current) {
      const m = groupRef.current.matrixWorld
      plane.set(new THREE.Vector3(0, 0, -1), c).applyMatrix4(m)
    }
    parts.forEach(p => p.mesh.position.copy(p.base).addScaledVector(p.dir, s.explode * 1.6))
  })

  return null
}

// Drives model rotation + camera push from scroll progress, smoothed with damping
function Rig({ progress, interactive, groupRef, children }) {
  const group = groupRef
  const smooth = useRef(0)
  const { camera, size } = useThree()

  useFrame((_, dt) => {
    smooth.current = THREE.MathUtils.damp(smooth.current, progress.get(), 4, dt)
    const s = smooth.current
    if (!interactive && group.current) {
      group.current.rotation.y = -0.5 + s * Math.PI * 2
      group.current.rotation.x = 0.18 + Math.sin(s * Math.PI) * 0.22
    }
    // distance that fits the model's width on screen, then push in mid-scroll
    const aspect = size.width / size.height
    const vFov = THREE.MathUtils.degToRad(camera.fov)
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect)
    const fit = (FIT * 0.9) / Math.tan(Math.min(hFov, vFov * 1.6) / 2)
    if (!interactive) {
      const target = fit * (1 - 0.24 * Math.sin(s * Math.PI))
      camera.position.z = THREE.MathUtils.damp(camera.position.z, target, 3, dt)
      camera.position.y = THREE.MathUtils.damp(camera.position.y, 0.6, 3, dt)
      camera.position.x = THREE.MathUtils.damp(camera.position.x, 0, 3, dt)
      camera.lookAt(0, 0, 0)
    }
  })

  return <group ref={group}>{children}</group>
}

export function Studio() {
  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[6, 9, 6]} intensity={2.2} castShadow shadow-mapSize={[2048, 2048]} />
      <directionalLight position={[-8, 3, -4]} intensity={1.1} />
      {/* Built-in studio softboxes, no network fetch */}
      <Environment resolution={256}>
        <Lightformer intensity={2.4} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[12, 4, 1]} />
        <Lightformer intensity={1.6} position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer intensity={1.6} position={[6, 1, 2]} rotation-y={-Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer intensity={0.8} position={[0, 0, -8]} scale={[12, 6, 1]} />
      </Environment>
    </>
  )
}

function LoadingOverlay() {
  const { active, progress } = useProgress()
  if (!active) return null
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', zIndex: 5, pointerEvents: 'none' }}>
      <div className="eyebrow">Loading model {Math.round(progress)}%</div>
    </div>
  )
}

function Caption({ progress, range, scene, index }) {
  const [a, b] = range
  const pad = (b - a) * 0.22
  const opacity = useTransform(progress, [a, a + pad, b - pad, b], [0, 1, 1, 0])
  const y = useTransform(progress, [a, b], [60, -60])
  const right = index % 2 === 1
  return (
    <motion.div style={{
      opacity, y, position: 'absolute', bottom: '12vh', maxWidth: 440, zIndex: 3, pointerEvents: 'none',
      [right ? 'right' : 'left']: 'var(--gutter)', textAlign: right ? 'right' : 'left',
    }}>
      <p className="eyebrow" style={{ marginBottom: 14 }}>{String(index + 1).padStart(2, '0')} / {scene[0]}</p>
      <h3 className="title" style={{ marginBottom: 16 }}>{scene[1]}</h3>
      <p className="body" style={{ marginLeft: right ? 'auto' : 0 }}>{scene[2]}</p>
    </motion.div>
  )
}

const toolBtn = {
  background: 'none', border: '1px solid rgba(255,255,255,0.35)', color: '#fff', cursor: 'pointer',
  font: '600 12px var(--font)', letterSpacing: '0.16em', textTransform: 'uppercase', padding: '10px 14px', minWidth: 40,
}

function Slider({ label, value, onChange }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span className="eyebrow" style={{ fontSize: 11, color: '#fff' }}>{label}</span>
      <input type="range" min="0" max="1" step="0.01" value={value} onChange={e => onChange(+e.target.value)}
        style={{ width: 110, accentColor: '#fff' }} />
    </label>
  )
}

export default function ScrollModel({ title, scenes = [], model, projectId }) {
  const ref = useRef()
  const groupRef = useRef()
  const [explore, setExplore] = useState(false)
  const [root, setRoot] = useState(null)
  const [cut, setCut] = useState(0)
  const [explode, setExplode] = useState(0)
  const [hidden, setHidden] = useState([])
  const [zoomReq, setZoomReq] = useState({ n: 0, factor: 1 })
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  const segments = scenes.length + 1
  const titleOpacity = useTransform(scrollYProgress, [0, 0.5 / segments, 1 / segments], [1, 1, 0])
  const titleScale = useTransform(scrollYProgress, [0, 1 / segments], [1, 0.92])
  const bar = useTransform(scrollYProgress, [0, 1], [0, 1])
  const partCount = useMemo(() => { let n = 0; root?.traverse(o => { if (o.isMesh && !o.userData.detached) n++ }); return n }, [root])

  const exit = () => { setExplore(false); setCut(0); setExplode(0); setHidden([]); document.body.style.cursor = '' }
  const resetParts = () => { hidden.forEach(m => { m.visible = true }); setHidden([]) }
  const zoom = factor => setZoomReq(z => ({ n: z.n + 1, factor }))

  // leave explore mode when the section scrolls away, or on Escape
  useEffect(() => scrollYProgress.on('change', v => { if (v <= 0 || v >= 1) exit() }), [scrollYProgress])
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') exit() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handlers = explore ? {
    onPointerOver: e => { e.stopPropagation(); setHighlight(e.object, true); document.body.style.cursor = 'pointer' },
    onPointerOut: e => { setHighlight(e.object, false); document.body.style.cursor = '' },
    onClick: e => {
      if (e.delta > 5 || partCount < 2) return // drag, or nothing to take apart
      e.stopPropagation(); setHighlight(e.object, false); e.object.visible = false
      setHidden(h => [...h, e.object])
    },
  } : {}

  return (
    <section ref={ref} style={{ height: `${segments * 100 + 60}vh`, position: 'relative', background: '#000' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
        <Canvas
          shadows dpr={[1, 2]}
          camera={{ position: [0, 0.6, 9], fov: 32 }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
          style={{ position: 'absolute', inset: 0, pointerEvents: explore ? 'auto' : 'none' }}
        >
          <color attach="background" args={['#000']} />
          <Studio />
          <Suspense fallback={null}>
            <Rig progress={scrollYProgress} interactive={explore} groupRef={groupRef}>
              <group {...handlers}>
                <Model model={model} onReady={setRoot} />
              </group>
            </Rig>
          </Suspense>
          <Explorer groupRef={groupRef} root={root} active={explore} cut={cut} explode={explode} zoomReq={zoomReq} />
          <ContactShadows position={[0, -1.9, 0]} opacity={explore ? 0.25 : 0.55} scale={14} blur={2.6} far={4} />
          {explore && <OrbitControls enablePan={false} enableZoom enableDamping minDistance={1.2} maxDistance={30} zoomSpeed={0.8} makeDefault />}
        </Canvas>

        <LoadingOverlay />

        {!explore && <>
          <motion.div style={{ opacity: titleOpacity, scale: titleScale, position: 'absolute', top: '16vh', left: 0, right: 0, textAlign: 'center', zIndex: 3, pointerEvents: 'none' }}>
            <p className="eyebrow" style={{ marginBottom: 16 }}>Scroll to explore</p>
            <h2 className="display">{title}</h2>
          </motion.div>
          {scenes.map((s, i) => (
            <Caption key={i} progress={scrollYProgress} scene={s} index={i}
              range={[(i + 1) / segments - 0.04, (i + 2) / segments - 0.02]} />
          ))}
        </>}

        {!model && (
          <p className="eyebrow" style={{ position: 'absolute', top: 104, right: 'var(--gutter)', fontSize: 11, opacity: 0.4, zIndex: 3 }}>
            Placeholder · drop a .glb / .obj+.mtl / .stl in src/media/{projectId}/
          </p>
        )}

        {explore ? (
          <div style={{
            position: 'absolute', left: '50%', bottom: 32, transform: 'translateX(-50%)', zIndex: 6,
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 18,
            padding: '14px 20px', background: 'rgba(0,0,0,0.75)', border: '1px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', maxWidth: 'calc(100vw - 32px)',
          }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <button style={toolBtn} onClick={() => zoom(0.75)} aria-label="Zoom in">+</button>
              <button style={toolBtn} onClick={() => zoom(1.33)} aria-label="Zoom out">−</button>
            </div>
            <Slider label="Cutaway" value={cut} onChange={setCut} />
            {partCount > 1 && <Slider label="Explode" value={explode} onChange={setExplode} />}
            {hidden.length > 0 && <button style={toolBtn} onClick={resetParts}>Restore {hidden.length} part{hidden.length > 1 ? 's' : ''}</button>}
            <button style={{ ...toolBtn, background: '#fff', color: '#000' }} onClick={exit}>Done</button>
          </div>
        ) : (
          <button className="btn" onClick={() => setExplore(true)} style={{ position: 'absolute', right: 'var(--gutter)', top: 110, zIndex: 4, minWidth: 0, padding: '12px 20px' }}>
            Explore in 3D
          </button>
        )}

        {explore && (
          <p className="eyebrow" style={{ position: 'absolute', top: 110, left: 0, right: 0, textAlign: 'center', zIndex: 4, fontSize: 11, pointerEvents: 'none' }}>
            Drag to rotate · scroll or pinch to zoom{partCount > 1 ? ' · click a part to remove it' : ''}
          </p>
        )}

        <motion.div style={{ scaleX: bar, transformOrigin: 'left', position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, background: '#fff', zIndex: 4 }} />
      </div>
    </section>
  )
}
