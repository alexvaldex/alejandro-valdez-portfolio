import defaults from '../data/content.json'

export const STORAGE_KEY = 'av_content'

export function loadContent() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return { ...defaults, ...JSON.parse(saved) }
  } catch { /* fall through */ }
  return defaults
}

export function useContent(section) {
  const c = loadContent()
  return section ? c[section] : c
}

export function useProjectContent(id) {
  return loadContent().projects[id] || {}
}
