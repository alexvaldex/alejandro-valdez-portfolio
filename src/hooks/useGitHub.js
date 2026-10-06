import { useEffect, useState } from 'react'
import { GITHUB_USER } from '../data/projects'

// Live GitHub data, cached for 30 minutes so visitors don't burn the 60/hr API limit
const TTL = 30 * 60 * 1000
const memory = {}

async function cached(path) {
  const key = `gh:${path}`
  if (memory[key]) return memory[key]
  try {
    const hit = JSON.parse(sessionStorage.getItem(key) || 'null')
    if (hit && Date.now() - hit.t < TTL) return (memory[key] = hit.v)
  } catch { /* storage unavailable */ }
  const res = await fetch(`https://api.github.com/${path}`)
  if (!res.ok) throw new Error(`GitHub ${res.status}`)
  const v = await res.json()
  memory[key] = v
  try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), v })) } catch { /* ignore */ }
  return v
}

function useAsync(fn, deps) {
  const [state, setState] = useState({ data: null, error: null })
  useEffect(() => {
    let live = true
    fn().then(data => live && setState({ data, error: null }), error => live && setState({ data: null, error }))
    return () => { live = false }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps
  return state
}

export function useGitHubProfile() {
  return useAsync(async () => {
    const [user, repos] = await Promise.all([
      cached(`users/${GITHUB_USER}`),
      cached(`users/${GITHUB_USER}/repos?per_page=100&sort=pushed`),
    ])
    const own = repos.filter(r => !r.fork)
    const languages = {}
    own.forEach(r => { if (r.language) languages[r.language] = (languages[r.language] || 0) + 1 })
    return { user, repos: own, languages: Object.entries(languages).sort((a, b) => b[1] - a[1]) }
  }, [])
}

export function useRepo(name) {
  return useAsync(async () => {
    if (!name) return null
    const [repo, commits, languages] = await Promise.all([
      cached(`repos/${GITHUB_USER}/${name}`),
      cached(`repos/${GITHUB_USER}/${name}/commits?per_page=5`).catch(() => []),
      cached(`repos/${GITHUB_USER}/${name}/languages`).catch(() => ({})),
    ])
    return { repo, commits, languages }
  }, [name])
}

export function timeAgo(date) {
  const s = (Date.now() - new Date(date)) / 1000
  const units = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]]
  for (const [u, n] of units) if (s >= n) { const v = Math.floor(s / n); return `${v} ${u}${v > 1 ? 's' : ''} ago` }
  return 'just now'
}

// Full file tree of a repo, for the open-source explorer
export function useRepoTree(name) {
  return useAsync(async () => {
    if (!name) return null
    const repo = await cached(`repos/${GITHUB_USER}/${name}`)
    const tree = await cached(`repos/${GITHUB_USER}/${name}/git/trees/${repo.default_branch}?recursive=1`)
    return { repo, branch: repo.default_branch, files: tree.tree.filter(f => f.type === 'blob' && !/(^|\/)\.[^/]+$/.test(f.path)) }
  }, [name])
}
