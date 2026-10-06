import { useState } from 'react'
import defaults from '../data/content.json'
import { loadContent, STORAGE_KEY } from '../hooks/useContent'

const label = k => k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())

// Edits every text field in content.json. Saves to this browser instantly;
// "Download JSON" gives you a file to replace src/data/content.json with to make it permanent.
function Field({ path, value, onChange }) {
  const key = path[path.length - 1]
  if (Array.isArray(value)) {
    return (
      <label style={row}>
        <span className="eyebrow">{label(key)} (comma separated)</span>
        <input style={input} value={value.join(', ')} onChange={e => onChange(path, e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
      </label>
    )
  }
  if (typeof value === 'object') {
    return (
      <details style={{ borderTop: '1px solid var(--line)', padding: '18px 0' }} open={path.length === 1}>
        <summary className="eyebrow" style={{ cursor: 'pointer', color: '#fff' }}>{label(key)}</summary>
        <div style={{ paddingLeft: 16, marginTop: 12 }}>
          {Object.entries(value).map(([k, v]) => <Field key={k} path={[...path, k]} value={v} onChange={onChange} />)}
        </div>
      </details>
    )
  }
  const long = String(value).length > 70
  return (
    <label style={row}>
      <span className="eyebrow">{label(key)}</span>
      {long
        ? <textarea style={{ ...input, minHeight: 96, resize: 'vertical' }} value={value} onChange={e => onChange(path, e.target.value)} />
        : <input style={input} value={value} onChange={e => onChange(path, e.target.value)} />}
    </label>
  )
}

const row = { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }
const input = { background: '#0b0b0b', border: '1px solid var(--line)', color: '#fff', padding: '12px 14px', font: '400 15px var(--font)', lineHeight: 1.5 }

export default function AdminPage() {
  const [data, setData] = useState(loadContent)
  const [saved, setSaved] = useState(false)

  const onChange = (path, val) => {
    setData(d => {
      const next = structuredClone(d)
      let o = next
      path.slice(0, -1).forEach(k => { o = o[k] })
      o[path[path.length - 1]] = val
      return next
    })
    setSaved(false)
  }
  const save = () => { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); setSaved(true) }
  const reset = () => { localStorage.removeItem(STORAGE_KEY); setData(defaults); setSaved(false) }
  const download = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
    a.download = 'content.json'
    a.click()
  }

  return (
    <main style={{ padding: '140px var(--gutter) 120px', maxWidth: 960 }}>
      <p className="eyebrow">Site editor</p>
      <h1 className="title" style={{ margin: '14px 0 12px' }}>Edit content</h1>
      <p className="body" style={{ marginBottom: 32 }}>
        Save applies changes in this browser. To publish, download the JSON and replace src/data/content.json.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40, position: 'sticky', top: 96, zIndex: 5, background: '#000', padding: '12px 0' }}>
        <button className="btn" onClick={save}>{saved ? 'Saved' : 'Save'}</button>
        <button className="btn" onClick={download}>Download JSON</button>
        <button className="btn" onClick={reset}>Reset</button>
      </div>
      {Object.entries(data).map(([k, v]) => <Field key={k} path={[k]} value={v} onChange={onChange} />)}
    </main>
  )
}
