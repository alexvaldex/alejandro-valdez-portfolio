import { useEffect, useState } from 'react'
import Reveal from './Reveal'
import Media from './Media'
import flightVideo from '../assets/vx/flight.mp4'
import flight3dVideo from '../assets/vx/flight-3d.mp4'
import shotTemplates from '../assets/vx/templates.jpg'
import shotMission from '../assets/vx/mission-control.jpg'
import shotTvc from '../assets/vx/tvc.jpg'
import shotCanard from '../assets/vx/canard.jpg'
import shotAirbrake from '../assets/vx/airbrake.jpg'
import shotSim from '../assets/vx/simulator.jpg'
import shotPresent from '../assets/vx/present-3d.jpg'
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

// Screens captured from VX Telemetry v1.1.1 running its built-in simulator
const TOUR = [
  { id: 'mission', label: 'Mission control', img: shotMission, text: "The main board seconds from apogee: the T+ clock, the flight-phase track from pad to landing, a GO board for link, telemetry, power, GPS, and RF, and the mission model tracing the real trajectory with every event stamped below it." },
  { id: 'templates', label: 'Templates', img: shotTemplates, text: "First launch asks what you're flying. Six layouts, from HPR dual-deploy to TVC bench tests to altitude competitions, so you start on a populated dashboard instead of a blank page." },
  { id: 'present', label: '3D + Present', img: shotPresent, text: "Present mode strips the chrome for the big screen at the pad. Here the 3D vehicle is under drogue, with the chute deployed off the actual flight event." },
  { id: 'tvc', label: 'TVC', img: shotTvc, text: "The TVC layout for thrust-vector bench tests and hops: gimbal deflection against the mechanical limit, RMS tracking error, and a live attitude indicator." },
  { id: 'canard', label: 'Canards', img: shotCanard, text: "Canard roll control from a nose-on view: per-fin deflection and the roll rate the fins are fighting, flagged the moment roll authority runs out." },
  { id: 'airbrake', label: 'Air brakes', img: shotAirbrake, text: "Altitude targeting: brake deployment, actuator feedback, and whether predicted apogee is converging on the target. That's the core loop for altitude competitions." },
  { id: 'sim', label: 'Simulator', img: shotSim, text: "Sim Setup: drop in a real motor file from thrustcurve.org or an OpenRocket design, and VX flies the actual thrust curve, so you can rehearse launch day from your desk." },
]

function Tour() {
  const [i, setI] = useState(0)
  const [zoom, setZoom] = useState(false)
  const t = TOUR[i]
  return (
    <div className="vxTour">
      <div className="vxTabs" role="tablist">
        {TOUR.map((x, j) => (
          <button key={x.id} role="tab" aria-selected={j === i} className={j === i ? 'on' : ''} onClick={() => setI(j)}>{x.label}</button>
        ))}
      </div>
      <div className="vxWindow">
        <div className="vxChrome"><i /><i /><i /><span>VX Telemetry · {t.label}</span></div>
        <button className="vxShot" onClick={() => setZoom(true)} aria-label="Enlarge screenshot">
          <img key={t.id} src={t.img} alt={`VX Telemetry ${t.label} screen`} />
        </button>
      </div>
      <p className="body vxCaption">{t.text}</p>
      {zoom && (
        <div className="lightbox" onClick={() => setZoom(false)}>
          <img src={t.img} alt="" />
          <p className="eyebrow">Click anywhere to close</p>
        </div>
      )}
    </div>
  )
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

      {/* Live demo */}
      <div className="vxHead">
        <Reveal as="p" className="eyebrow">Live demo · recorded straight from the app</Reveal>
        <Reveal as="h2" className="title" delay={0.06}>Watch a full flight</Reveal>
        <Reveal as="p" className="body" delay={0.12} style={{ marginTop: 14 }}>Pad to landing in the built-in simulator: boost, burnout, apogee, drogue, main, touchdown. Every number, plot, and event you see is VX doing its job in real time.</Reveal>
      </div>
      <Reveal className="vxWindow vxDemo">
        <div className="vxChrome"><i /><i /><i /><span>VX Telemetry · Simulator · HPR dual-deploy</span></div>
        <div className="vxVideo"><Media item={{ type: 'video', url: flightVideo }} /></div>
      </Reveal>

      <div className="vxSplit vx3d">
        <Reveal>
          <p className="eyebrow">3D vehicle</p>
          <h3 className="title" style={{ margin: '14px 0 18px' }}>Your rocket, flying live</h3>
          <p className="body">The 3D view rides on real attitude data. Watch the drogue come out at apogee and the main open on the way down, triggered by the actual flight events, not a canned animation. Load your own CAD and it's your rocket up there.</p>
        </Reveal>
        <Reveal delay={0.1} className="vxWindow">
          <div className="vxChrome"><i /><i /><i /><span>3D Vehicle</span></div>
          <div className="vxVideo square"><Media item={{ type: 'video', url: flight3dVideo }} /></div>
        </Reveal>
      </div>

      {/* Screen tour */}
      <div className="vxHead" style={{ paddingTop: 100 }}>
        <Reveal as="p" className="eyebrow">Take the tour</Reveal>
        <Reveal as="h2" className="title" delay={0.06}>Every mode, one app</Reveal>
      </div>
      <Tour />

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
