import { useEffect, useState } from 'react'
import Reveal from './Reveal'
import { GITHUB_USER } from '../data/projects'

const REPO = 'Valdex_Telemetry'
const RELEASES = `https://github.com/${GITHUB_USER}/${REPO}/releases`

// Which installer belongs to which OS
const PLATFORMS = [
  { id: 'mac', label: 'macOS', sub: 'Universal · Apple Silicon + Intel', match: /\.dmg$/i },
  { id: 'win', label: 'Windows', sub: '64-bit installer', match: /setup\.exe$/i },
  { id: 'linux', label: 'Linux', sub: 'AppImage · .deb · .rpm', match: /\.AppImage$/i },
]

function detectOS() {
  const ua = navigator.userAgent
  if (/Mac/i.test(ua) && !/iPhone|iPad/i.test(ua)) return 'mac'
  if (/Win/i.test(ua)) return 'win'
  if (/Linux/i.test(ua) && !/Android/i.test(ua)) return 'linux'
  return null
}

function useLatestRelease() {
  const [rel, setRel] = useState(null)
  useEffect(() => {
    const key = 'gh:vx-release'
    try { const hit = JSON.parse(sessionStorage.getItem(key) || 'null'); if (hit) { setRel(hit); return } } catch { /* ignore */ }
    fetch(`https://api.github.com/repos/${GITHUB_USER}/${REPO}/releases/latest`)
      .then(r => (r.ok ? r.json() : null))
      .then(j => {
        if (!j) return
        const v = { tag: j.tag_name, date: j.published_at, assets: j.assets.map(a => ({ name: a.name, url: a.browser_download_url, size: a.size })) }
        setRel(v)
        try { sessionStorage.setItem(key, JSON.stringify(v)) } catch { /* ignore */ }
      })
      .catch(() => {})
  }, [])
  return rel
}

const FEATURES = [
  ['Mission control', 'Mission clock, flight-phase track, GO/NO-GO board, live apogee prediction, and touchdown ETA.'],
  ['Your rocket, live in 3D', 'Load your own CAD. It flies from real attitude data and animates staging and every deploy.'],
  ['Smart event detection', 'Accel-gated liftoff and a debounced fused-velocity apogee. One bad baro reading never fools it.'],
  ['Kalman-filtered', 'Baro and accelerometer fusion gives smoothed altitude and the velocity your board never sends.'],
  ['Master caution', 'Audio alarms, flashing banners, voice callouts, and custom alert rules on any field.'],
  ['Spectator mode', 'One laptop on the radio, everyone on the same Wi-Fi watches live. Built for the big screen at the pad.'],
  ['Real motor curves', 'Import a thrustcurve.org motor file and the simulator flies the actual thrust curve, not an average.'],
  ['Share any flight', 'Export a self-contained replay or a link that carries the whole flight in the URL. Nothing uploaded.'],
  ['TVC, canards, air brakes', 'Dedicated widgets for active control: gimbal tracking error, roll authority, apogee convergence.'],
]

const CONTRACT = `{"v":1,"t_ms":123456,"alt_m":102.4,"vel_mps":58.1,
 "q_w":1,"q_x":0,"q_y":0,"q_z":0,"batt_v":7.9,
 "lat":28.6,"lon":-80.6,"event":"LIFTOFF"}*1A2B`

const BOARDS = [
  ['Board A', 'Flight Computer', 'Baro, 9-DoF IMU, high-g accel, and GPS, each mapped 1:1 to a telemetry field, downlinking over LoRa.'],
  ['Board B', 'Ground Receiver', 'A USB LoRa dongle that streams straight into VX. Works with any SX1262 flight computer, not just mine.'],
  ['Board C', 'Pyro Deck', 'A stackable 8-channel recovery deck on its own isolated battery, for L3 and two-stage flights.'],
]

export default function VXShowcase() {
  const rel = useLatestRelease()
  const [os, setOS] = useState(null)
  useEffect(() => setOS(detectOS()), [])
  const assetFor = p => rel?.assets.find(a => p.match.test(a.name))

  return (
    <section className="vx">
      {/* Download */}
      <div className="vxDownload">
        <div>
          <Reveal as="p" className="eyebrow">{rel ? `${rel.tag} · released ${new Date(rel.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Latest release'}</Reveal>
          <Reveal as="h2" className="display" delay={0.08}>Download VX</Reveal>
          <Reveal as="p" className="body" delay={0.14} style={{ marginTop: 18 }}>Free. Runs offline. Hit Simulator and watch a full flight before you ever plug anything in.</Reveal>
        </div>
        <div className="vxPlatforms">
          {PLATFORMS.map((p, i) => {
            const a = assetFor(p)
            return (
              <Reveal key={p.id} delay={0.1 + i * 0.06}>
                <a className={`vxPlatform ${os === p.id ? 'mine' : ''}`} href={a?.url || RELEASES}>
                  <small>{os === p.id ? 'Your system' : p.sub}</small>
                  <span>{p.label}</span>
                  <em>{a ? `${(a.size / 1e6).toFixed(1)} MB ↓` : 'Releases ↗'}</em>
                </a>
              </Reveal>
            )
          })}
        </div>
      </div>

      {/* Features */}
      <div className="vxHead">
        <Reveal as="p" className="eyebrow">What it does</Reveal>
        <Reveal as="h2" className="title" delay={0.06}>Everything a launch day needs</Reveal>
      </div>
      <div className="vxFeatures">
        {FEATURES.map(([t, d], i) => (
          <Reveal key={t} delay={(i % 3) * 0.06} className="vxFeature">
            <span className="vxNum">{String(i + 1).padStart(2, '0')}</span>
            <h3>{t}</h3>
            <p>{d}</p>
          </Reveal>
        ))}
      </div>

      {/* Contract + architecture */}
      <div className="vxSplit">
        <Reveal>
          <p className="eyebrow">The contract</p>
          <h3 className="title" style={{ margin: '14px 0 18px' }}>One line per frame</h3>
          <p className="body">Send JSON lines over serial. That's it. Only <code>t_ms</code> is required, common aliases map automatically, and an optional CRC-16 suffix drops corrupt packets and counts them.</p>
        </Reveal>
        <Reveal delay={0.1}><pre className="vxCode"><code>{CONTRACT}</code></pre></Reveal>
      </div>

      <div className="vxPipe">
        <p className="eyebrow">Architecture · one direction, the UI never touches hardware</p>
        <div>
          {['Transport', 'Ingest', 'Store', 'UI'].map((s, i, a) => (
            <Reveal key={s} delay={i * 0.08} className="vxStage">
              <span>{s}</span>
              <small>{['Serial · Tauri · Simulator · WebSocket', 'Parse · normalize · validate', 'Allocation-free ring buffer', 'Widgets subscribe at 16 Hz'][i]}</small>
              {i < a.length - 1 && <i>→</i>}
            </Reveal>
          ))}
        </div>
      </div>

      {/* Hardware */}
      <div className="vxHead">
        <Reveal as="p" className="eyebrow">Next · the VX hardware line</Reveal>
        <Reveal as="h2" className="title" delay={0.06}>Software first. Boards next.</Reveal>
        <Reveal as="p" className="body" delay={0.12} style={{ marginTop: 14 }}>Reference designs in progress, where every sensor maps straight to a field in the telemetry contract.</Reveal>
      </div>
      <div className="vxBoards">
        {BOARDS.map(([id, name, d], i) => (
          <Reveal key={id} delay={i * 0.08} className="vxBoard">
            <small>{id}</small>
            <h3>{name}</h3>
            <p>{d}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
