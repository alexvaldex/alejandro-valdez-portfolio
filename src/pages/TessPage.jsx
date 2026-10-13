// Tess: autonomous planet hunter. A one-off, space-themed project page.
// Everything here comes from github.com/alexvaldex/nasa-tess-planet-search
// and its live site; stats are fetched live when the visitor's browser allows.
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import Reveal from '../components/Reveal'
import CountUp from '../components/CountUp'
import { RepoCard } from '../components/GitHubPanel'
import SafeBoundary from '../components/SafeBoundary'
import heroShot from '../assets/tess/hero.jpg'
import replayShot from '../assets/tess/replay.jpg'
import gameShot from '../assets/tess/game.jpg'
import skyShot from '../assets/tess/sky.jpg'
import plotA from '../assets/tess/TIC267889592.01.jpg'
import plotB from '../assets/tess/TIC415954197.02.jpg'

const REPO = 'https://github.com/alexvaldex/nasa-tess-planet-search'
const SITE = 'https://alexvaldex.github.io/nasa-tess-planet-search/'

/* ───────────── Warp starfield: you fly through it as you scroll ───────────── */
function Warp() {
  const ref = useRef()
  useEffect(() => {
    const cv = ref.current, ctx = cv.getContext('2d')
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    let w, h, dpr, raf, last = performance.now(), lastY = scrollY, vel = 0
    const N = innerWidth < 700 ? 420 : 900
    const stars = Array.from({ length: N }, () => spawn(true))
    function spawn(any) {
      return { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2, z: any ? Math.random() : 1, hue: Math.random() < 0.15 ? 45 : Math.random() < 0.3 ? 200 : 220 }
    }
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 1.5)
      w = cv.width = innerWidth * dpr; h = cv.height = innerHeight * dpr
      cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px'
    }
    resize(); addEventListener('resize', resize)
    const frame = now => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now
      const dy = scrollY - lastY; lastY = scrollY
      vel += (Math.abs(dy) / Math.max(dt, 0.001) / 4000 - vel) * 0.08
      const doc = document.documentElement.scrollHeight - innerHeight
      const p = doc > 0 ? scrollY / doc : 0
      const speed = reduce ? 0.02 : 0.06 + Math.min(vel, 1.6) * 0.9
      // nebula: the color of space shifts as you travel deeper
      const g = ctx.createRadialGradient(w * (0.3 + p * 0.4), h * 0.4, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.8)
      g.addColorStop(0, `hsla(${230 + p * 70}, 70%, ${10 + p * 4}%, 1)`)
      g.addColorStop(0.5, `hsla(${250 + p * 60}, 60%, 5%, 1)`)
      g.addColorStop(1, '#02030a')
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
      const cx = w / 2, cy = h / 2, f = Math.min(w, h) * 0.6
      for (const s of stars) {
        const pz = s.z
        s.z -= speed * dt
        if (s.z <= 0.02) { Object.assign(s, spawn(false)); continue }
        const x = cx + (s.x / s.z) * f, y = cy + (s.y / s.z) * f
        if (x < -50 || x > w + 50 || y < -50 || y > h + 50) { Object.assign(s, spawn(false)); continue }
        const px = cx + (s.x / pz) * f, py = cy + (s.y / pz) * f
        const a = Math.min(1, (1 - s.z) * 1.4)
        const size = (1 - s.z) * 2.2 * dpr + 0.3
        ctx.strokeStyle = `hsla(${s.hue}, 90%, ${s.hue === 45 ? 70 : 85}%, ${a})`
        ctx.lineWidth = size; ctx.lineCap = 'round'
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke()
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    const vis = () => { cancelAnimationFrame(raf); if (!document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame) } }
    document.addEventListener('visibilitychange', vis)
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize); document.removeEventListener('visibilitychange', vis) }
  }, [])
  return <canvas ref={ref} className="tWarp" aria-hidden />
}

/* ───────────── Live stats from the bot's own site ───────────── */
const FALLBACK = { updated: 'Oct 13, 2026', stars_analyzed: 4643, light_curve_points: 23100000, signals: null, sectors_analyzed: null }
function useLiveStats() {
  const [s, setS] = useState(null)
  useEffect(() => {
    try { const c = JSON.parse(sessionStorage.getItem('tess:stats') || 'null'); if (c) { setS(c); return } } catch { /* */ }
    fetch(SITE + 'data.json').then(r => r.json()).then(d => {
      setS(d.stats); try { sessionStorage.setItem('tess:stats', JSON.stringify(d.stats)) } catch { /* */ }
    }).catch(() => {})
  }, [])
  return s
}

/* ───────────── Transit lab: hide a planet, see if Tess could find it ───────────── */
const NOISE = { calm: [600, 'Bright and calm'], typical: [1500, 'Typical'], jittery: [3500, 'Faint and jittery'] }
function TransitLab() {
  const cv = useRef()
  const [rp, setRp] = useState(4)       // Earth radii
  const [per, setPer] = useState(3.8)   // days
  const [noise, setNoise] = useState('typical')
  const depth = (rp / 109) ** 2          // fraction, Sun-like star
  const transits = Math.floor(27 / per)  // one TESS sector
  const durH = 3 * Math.cbrt(per / 3.8)
  const nIn = transits * durH * 30       // 2-minute cadence
  const sigma = NOISE[noise][0] / 1e6
  const snr = (depth / sigma) * Math.sqrt(Math.max(nIn, 1))
  const found = snr >= 7 && transits >= 3

  useEffect(() => {
    const c = cv.current, ctx = c.getContext('2d')
    let raf, t0 = performance.now(), pts = []
    const draw = now => {
      const dpr = Math.min(devicePixelRatio || 1, 2)
      const W = c.clientWidth, H = c.clientHeight
      if (c.width !== W * dpr) { c.width = W * dpr; c.height = H * dpr }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      const split = H * 0.5
      // star with limb darkening
      const sx = W / 2, sy = split / 2, R = Math.min(split * 0.36, W * 0.2)
      const glow = ctx.createRadialGradient(sx, sy, R * 0.6, sx, sy, R * 2.2)
      glow.addColorStop(0, 'rgba(255,200,90,0.35)'); glow.addColorStop(1, 'rgba(255,200,90,0)')
      ctx.fillStyle = glow; ctx.fillRect(0, 0, W, split)
      const disc = ctx.createRadialGradient(sx, sy, 0, sx, sy, R)
      disc.addColorStop(0, '#fff6d8'); disc.addColorStop(0.7, '#ffd36b'); disc.addColorStop(1, '#e8902a')
      ctx.fillStyle = disc; ctx.beginPath(); ctx.arc(sx, sy, R, 0, 7); ctx.fill()
      // planet crossing: one orbit every few seconds, scaled by period
      const cycle = 2.2 + per * 0.45
      const ph = (((now - t0) / 1000) % cycle) / cycle
      const pr = Math.max(2, R * (rp / 109) * 4.5)
      const px = sx - R * 1.8 + ph * R * 3.6, py = sy + R * 0.15
      const inFront = ph > 0.05 && ph < 0.95
      if (inFront) { ctx.fillStyle = '#05060f'; ctx.beginPath(); ctx.arc(px, py, pr, 0, 7); ctx.fill() }
      // brightness: overlap fraction of the disc
      const d = Math.hypot(px - sx, py - sy)
      const cover = inFront && d < R + pr ? Math.min(1, (R + pr - d) / (2 * pr)) : 0
      const flux = 1 - depth * cover + (Math.random() - 0.5) * 2 * sigma
      pts.push(flux); if (pts.length > 420) pts.shift()
      // light curve
      const top = split + 18, bh = H - top - 26
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.strokeRect(10.5, top - 0.5, W - 21, bh + 1)
      const span = Math.max(depth * 1.6, sigma * 4)
      ctx.fillStyle = 'rgba(160,190,255,0.85)'
      pts.forEach((v, i) => {
        const x = 12 + (i / 420) * (W - 24)
        const y = top + bh * 0.25 + ((1 - v) / span) * bh * 0.65
        ctx.fillRect(x, Math.max(top, Math.min(top + bh, y)), 1.6, 1.6)
      })
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '11px ui-monospace, Menlo, monospace'
      ctx.fillText('BRIGHTNESS', 16, top + 14)
      ctx.fillText('TIME →', W - 64, H - 10)
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [rp, per, sigma, depth])

  const kind = rp < 1.6 ? 'rocky, Earth-like' : rp < 4 ? 'a super-Earth' : rp < 7 ? 'a mini-Neptune' : rp < 11 ? 'Saturn-sized' : 'Jupiter-sized'
  return (
    <div className="tLab">
      <div className="tLabControls">
        <label>
          <span>Planet size <b>{rp.toFixed(1)} × Earth</b></span>
          <input type="range" min="0.8" max="14" step="0.1" value={rp} onChange={e => setRp(+e.target.value)} />
          <small>{kind}</small>
        </label>
        <label>
          <span>Orbit <b>{per.toFixed(1)} days</b></span>
          <input type="range" min="0.6" max="14" step="0.1" value={per} onChange={e => setPer(+e.target.value)} />
          <small>{transits} transit{transits === 1 ? '' : 's'} in one 27-day TESS sector</small>
        </label>
        <div className="tRadios">
          <span>The star</span>
          {Object.entries(NOISE).map(([k, [, l]]) => (
            <button key={k} className={k === noise ? 'on' : ''} onClick={() => setNoise(k)}>{l}</button>
          ))}
        </div>
        <div className="tReadout">
          <div><small>Dip depth</small><b>{(depth * 100).toFixed(3)}%</b></div>
          <div><small>Signal / noise</small><b>{snr.toFixed(1)}</b></div>
          <div><small>Transits</small><b>{transits}</b></div>
        </div>
        <div className={`tVerdict ${found ? 'yes' : 'no'}`}>
          {found ? '● Tess would flag this. Passes SNR ≥ 7 and 3+ transits.'
            : transits < 3 ? '○ Too few transits. Tess needs at least 3 to rule out coincidence.'
            : '○ Lost in the noise. Below the SNR ≥ 7 threshold.'}
        </div>
      </div>
      <canvas ref={cv} className="tLabCanvas" />
    </div>
  )
}

/* ───────────── Pipeline with a line that fills as you scroll ───────────── */
const STEPS = [
  ['Pick', 'Random sky fields away from the crowded Milky Way plane. Sun-like and red-dwarf stars, TESS magnitude 9 to 13, never screened before.'],
  ['Download', "SPOC, TESS-SPOC, and QLP light curves from NASA's MAST archive, using the longest run of consecutive sectors."],
  ['Clean', "Drop flares, lone bad points, and data next to gaps, then divide out the star's own variability with a robust running median."],
  ['Search', 'Box Least Squares over every orbit from 0.5 to 30 days, iterated to catch multi-planet systems, with automatic half-period correction.'],
  ['Vet', 'Thirteen red-flag tests, the same ones astronomers use, to kill binaries, glitches, and blends.'],
  ['Score', 'A gradient-boosted model trained on ~2,850 simulated light curves plus 338 real TESS planets and false positives gives a 0 to 1 planet score.'],
  ['Cross-match', 'By star ID and sky position against every TOI, community TOI, confirmed planet, and known eclipsing binary.'],
  ['Publish', 'Diagnostic plots, a replay per star, and results tables committed back to the repo and served live.'],
]
function Pipeline() {
  const ref = useRef()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 60%'] })
  const fill = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  return (
    <div className="tPipe" ref={ref}>
      <div className="tPipeLine"><motion.i style={{ height: fill }} /></div>
      {STEPS.map(([t, d], i) => (
        <Reveal key={t} className="tStep" delay={0.05}>
          <span className="tDot" />
          <small>{String(i + 1).padStart(2, '0')}</small>
          <h3>{t}</h3>
          <p>{d}</p>
        </Reveal>
      ))}
    </div>
  )
}

const TESTS = [
  ['Strength', 'SDE ≥ 9, SNR ≥ 7', 'Noise that happens to line up'],
  ['3+ transits', '', 'Coincidences'],
  ['Single-event dominance', '', 'One glitch faking a periodic signal'],
  ['Robust depth', '', 'A handful of bad points making the dip'],
  ['Odd vs. even', '', 'Eclipsing binaries at half their period'],
  ['Secondary eclipse', '', 'A glowing companion star'],
  ['Transit shape', '', 'V-shaped grazing binaries'],
  ['Implied size', '', 'Anything far bigger than Jupiter'],
  ['Duration vs. density', '', 'Signals too short or long for the star'],
  ['Centroid shift', '', 'The dip happening on a neighbor star'],
  ['Dip-to-dip consistency', '', 'Blends that change orbit to orbit'],
  ['Out-of-transit wave', '', 'Pulsating, spotted, and contact binaries'],
  ['Shared period', '', 'Spacecraft systematics across many stars'],
]

const CANDS = [
  { tic: '267889592', orbit: '19.043 d', depth: '1.54%', size: '~10 R⊕', transits: 4, snr: 50, sectors: '7, 8, 9', plot: plotA },
  { tic: '415954197', orbit: '7.140 d', depth: '0.94%', size: '~14 R⊕', transits: 3, snr: 21, sectors: '83', plot: plotB },
]

export default function TessPage() {
  const live = useLiveStats()
  const s = live || FALLBACK
  const [embed, setEmbed] = useState(false)
  const [zoom, setZoom] = useState(null)
  useEffect(() => { document.title = 'Tess · Alejandro Valdez'; return () => { document.title = 'Alejandro Valdez' } }, [])

  return (
    <main className="tess">
      <Warp />

      {/* Hero */}
      <section className="tHero">
        <motion.p className="eyebrow tGold" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 1 }}>Software · NASA TESS · Machine learning</motion.p>
        <motion.h1 className="tTitle" initial={{ opacity: 0, letterSpacing: '0.5em' }} animate={{ opacity: 1, letterSpacing: '0.12em' }} transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}>TESS</motion.h1>
        <motion.p className="tLede" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 1 }}>
          I built a bot that hunts for planets in NASA starlight. Every six hours it wakes up, picks hundreds of stars, and searches each one for the tiny, regular dip a passing planet makes. On its own. For free.
        </motion.p>
        <motion.div className="tCtas" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          <a className="btn tBtnGold" href="#lab">Hide a planet</a>
          <a className="btn" href={SITE} target="_blank" rel="noreferrer">Watch Tess live ↗</a>
          <a className="btn" href={REPO} target="_blank" rel="noreferrer">Source on GitHub</a>
        </motion.div>
        <div className="tScrollHint">Scroll to travel <i /></div>
      </section>

      {/* Live numbers */}
      <section className="tBand">
        <p className="eyebrow tCenter">{live ? <><span className="tPulse" />Live from the bot · updated {s.updated}</> : `As of ${s.updated}`}</p>
        <div className="tStats">
          <div><b><CountUp to={s.stars_analyzed} /></b><span>Stars screened</span></div>
          <div><b>{(s.light_curve_points / 1e6).toFixed(1)}M</b><span>Brightness measurements</span></div>
          {s.signals ? <div><b><CountUp to={s.signals} /></b><span>Signals vetted</span></div> : <div><b>86%</b><span>Known planets found blind</span></div>}
          <div><b>2</b><span>Strong candidates, in no catalog</span></div>
          <div><b>$0</b><span>Running cost</span></div>
        </div>
      </section>

      {/* The idea */}
      <section className="tSplit">
        <Reveal>
          <p className="eyebrow tGold">The idea</p>
          <h2 className="title">A planet is a shadow</h2>
          <p className="body tBody">When a planet crosses in front of its star, the star dims by a fraction of a percent, then brightens again, on a perfect schedule. NASA's TESS satellite has photographed millions of stars. Tess, my bot, goes through them looking for that schedule, and then works hard to prove each signal isn't something else.</p>
        </Reveal>
        <Reveal delay={0.1} className="tFrame">
          <img src={heroShot} alt="Tess live site: a sky dome of every star she has checked" />
        </Reveal>
      </section>

      {/* Lab */}
      <section className="tSection" id="lab">
        <Reveal as="p" className="eyebrow tGold">Interactive · your turn</Reveal>
        <Reveal as="h2" className="display" delay={0.06}>Hide a planet</Reveal>
        <Reveal as="p" className="body tBody" delay={0.12}>Pick a planet and a star. Watch the light curve TESS would record, and see whether it clears the same thresholds Tess uses: signal-to-noise of at least 7 and at least three transits. Small planets around noisy stars are hard. That's the whole game.</Reveal>
        <Reveal delay={0.15}><TransitLab /></Reveal>
      </section>

      {/* Pipeline */}
      <section className="tSection">
        <Reveal as="p" className="eyebrow tGold">How it works</Reveal>
        <Reveal as="h2" className="display" delay={0.06}>Eight steps, every star</Reveal>
        <Pipeline />
      </section>

      {/* Vetting */}
      <section className="tSection">
        <Reveal as="p" className="eyebrow tGold">Skepticism, automated</Reveal>
        <Reveal as="h2" className="title" delay={0.06}>13 ways a signal gets killed</Reveal>
        <Reveal as="p" className="body tBody" delay={0.1}>Most dips aren't planets. Every signal has to survive all of these before it counts.</Reveal>
        <div className="tTests">
          {TESTS.map(([t, sub, d], i) => (
            <Reveal key={t} delay={(i % 4) * 0.05} className="tTest">
              <small>{String(i + 1).padStart(2, '0')}</small>
              <h4>{t}</h4>
              {sub && <em>{sub}</em>}
              <p>Catches: {d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Validation */}
      <section className="tSection">
        <Reveal as="p" className="eyebrow tGold">Does it actually work?</Reveal>
        <Reveal as="h2" className="title" delay={0.06}>Graded against the real sky</Reveal>
        <div className="tValid">
          <Reveal className="tV"><b><CountUp to={86} />%</b><h4>Blind recovery</h4><p>Run on stars with confirmed TESS planets without being told where they were: <strong>241 of 281</strong> found. The misses are mostly very shallow or long-period planets.</p></Reveal>
          <Reveal className="tV" delay={0.08}><b><CountUp to={70} />%</b><h4>Hard false positives rejected</h4><p>On signals that passed NASA's own first cut but were later proven not to be planets, while still keeping <strong>78%</strong> of real planets. 5-fold cross-validated.</p></Reveal>
          <Reveal className="tV" delay={0.16}><b>0.98</b><h4>ROC AUC</h4><p>Cross-validated, for the planet-score model overall. <strong>0.86</strong> on real TESS objects alone.</p></Reveal>
        </div>
      </section>

      {/* Candidates */}
      <section className="tSection">
        <Reveal as="p" className="eyebrow tGold">Finds</Reveal>
        <Reveal as="h2" className="display" delay={0.06}>Two signals no one has catalogued</Reveal>
        <Reveal as="p" className="body tBody" delay={0.1}>Both pass every vetting test with signal-to-noise above 10, and neither appears in 8,151 TOIs, 5,138 community TOIs, 6,138 confirmed planets, or 4,578 known TESS eclipsing binaries (checked Oct 13, 2026).</Reveal>
        <div className="tCands">
          {CANDS.map((c, i) => (
            <Reveal key={c.tic} delay={i * 0.1} className="tCand">
              <div className="tCandHead">
                <div><small>Candidate</small><h3>TIC {c.tic}</h3></div>
                <a href={`https://exofop.ipac.caltech.edu/tess/target.php?id=${c.tic}`} target="_blank" rel="noreferrer">ExoFOP ↗</a>
              </div>
              <div className="tCandGrid">
                {[['Orbit', c.orbit], ['Depth', c.depth], ['Size', c.size], ['Transits', c.transits], ['SNR', c.snr], ['Sectors', c.sectors]].map(([k, v]) => <div key={k}><small>{k}</small><b>{v}</b></div>)}
              </div>
              <button className="tPlot" onClick={() => setZoom(c.plot)}><img src={c.plot} alt={`Diagnostic sheet for TIC ${c.tic}`} loading="lazy" /><span>Diagnostic sheet · click to enlarge</span></button>
            </Reveal>
          ))}
        </div>
        <Reveal as="p" className="tNote">These are candidates, not planets. Both are Jupiter-sized, and objects that large can also be brown dwarfs or low-mass stars. Confirming either needs ground-based photometry, spectroscopy for mass, and high-resolution imaging.</Reveal>
      </section>

      {/* Live site */}
      <section className="tSection">
        <Reveal as="p" className="eyebrow tGold">Meet Tess</Reveal>
        <Reveal as="h2" className="title" delay={0.06}>Her live mission control</Reveal>
        <Reveal as="p" className="body tBody" delay={0.1}>Tess has her own site, written in her voice and built for a symposium booth as much as a browser: a sky dome of every star she's checked, a live diary of the current run, step-by-step replays, and a hide-a-planet game that searches your fake data live. It's embedded right here.</Reveal>
        <div className="tWindow">
          <div className="vxChrome"><i /><i /><i /><span>alexvaldex.github.io/nasa-tess-planet-search</span><a className="vxPop" href={SITE} target="_blank" rel="noreferrer">Open ↗</a></div>
          <div className="tEmbed">
            {embed ? <iframe src={SITE} title="Tess live site" loading="lazy" />
              : <button className="vxLaunch" style={{ backgroundImage: `url(${heroShot})` }} onClick={() => setEmbed(true)}><span className="btn">▶ Launch Tess</span><small>Drag the sky · click a star · hide a planet</small></button>}
          </div>
        </div>
        <div className="tShots">
          {[[replayShot, 'Replay: how one star was judged, step by step'], [gameShot, 'Hide a planet, searched live in your browser'], [skyShot, 'Where she has looked']].map(([src, cap]) => (
            <Reveal key={cap} as="figure"><button onClick={() => setZoom(src)}><img src={src} alt={cap} loading="lazy" /></button><figcaption>{cap}</figcaption></Reveal>
          ))}
        </div>
      </section>

      {/* Run it */}
      <section className="tSplit">
        <Reveal>
          <p className="eyebrow tGold">Fully autonomous</p>
          <h2 className="title">It runs itself</h2>
          <p className="body tBody">Four GitHub Actions workflows. "Hunt" screens up to 800 new stars every 6 hours and queues its own next run. "Verify" re-checks candidates against freshly downloaded catalogs. "Retrain" regenerates simulations and retrains the model. "Tests" runs on every push. Total cost: nothing.</p>
          <div className="tChips">{['Python 3.11', 'lightkurve', 'astropy', 'astroquery', 'scikit-learn', 'Box Least Squares', 'GitHub Actions', 'GitHub Pages'].map(t => <span key={t} className="tag">{t}</span>)}</div>
        </Reveal>
        <Reveal delay={0.1}>
          <pre className="vxCode">{`pip install -r requirements.txt
python -m tph demo          # hide a planet, find it
python -m tph hunt --n 50   # screen 50 real stars
python -m tph verify        # re-check vs. catalogs
python -m tph train-real    # validate + retrain
pytest -q                   # offline test suite`}</pre>
        </Reveal>
      </section>

      <section className="tSection tLimits">
        <Reveal as="p" className="eyebrow tGold">Honest limits</Reveal>
        <ul>
          <li>Candidates are unconfirmed and need follow-up observations.</li>
          <li>QLP light curves have no centroid data, so the centroid test covers about 60% of stars.</li>
          <li>Planet sizes depend on stellar radii from the TESS Input Catalog.</li>
          <li>The model has seen a few hundred real labelled examples. More real data would sharpen it.</li>
        </ul>
      </section>

      <div className="tRepo"><SafeBoundary><RepoCard name="nasa-tess-planet-search" /></SafeBoundary></div>

      <section className="tSection tCredits">
        <p>Data: TESS light curves from NASA's Mikulski Archive for Space Telescopes (SPOC, TESS-SPOC, QLP), the TESS Input Catalog, ExoFOP-TESS TOI and CTOI lists, the NASA Exoplanet Archive, and the TESS eclipsing binary catalog (Prša et al. 2022). Search: Box Least Squares (Kovács, Zucker &amp; Mazeh 2002).</p>
        <Link to="/software" className="btn">← All software</Link>
      </section>

      {zoom && <div className="lightbox" onClick={() => setZoom(null)}><img src={zoom} alt="" /><p className="eyebrow">Click anywhere to close</p></div>}
    </main>
  )
}
