// Drop-in media. No code edits needed.
//
//   src/media/<project>/hero.jpg | hero.mp4      full-screen background at the top
//   src/media/<project>/01-static-fire.jpg       gallery items, sorted by filename,
//   src/media/<project>/02-launch-day.mp4        caption comes from the filename
//   src/media/<project>/model.glb | .obj+.mtl | .stl   3D model for the scroll scene
//
// <project> is one of: home, valdex, restem, sunflower, odysseus, fsi, monkeybar, knightsrp

const files = import.meta.glob(
  '/src/media/**/*.{jpg,jpeg,png,webp,avif,gif,mp4,webm,mov,glb,gltf,obj,mtl,stl,JPG,JPEG,PNG,MP4,MOV}',
  { eager: true, query: '?url', import: 'default' }
)

const VIDEO = /\.(mp4|webm|mov)$/i
const IMAGE = /\.(jpe?g|png|webp|avif|gif)$/i
const MODEL = /\.(glb|gltf|obj|stl)$/i

const byProject = {}
for (const [path, url] of Object.entries(files)) {
  const [, , , project, name] = path.split('/')
  if (!name) continue
  ;(byProject[project] ||= []).push({ name, url })
}

function captionFrom(name) {
  return name
    .replace(/\.[^.]+$/, '')
    .replace(/^\d+[-_ ]*/, '')
    .replace(/[-_]+/g, ' ')
    .trim()
}

// Drop resume.pdf into src/media/ and a Resume button appears across the site
const resumeFile = import.meta.glob('/src/media/*.pdf', { eager: true, query: '?url', import: 'default' })
export const resumeUrl = Object.values(resumeFile)[0] || null

export function getMedia(project) {
  const list = (byProject[project] || []).sort((a, b) => a.name.localeCompare(b.name))
  const visual = list.filter(f => VIDEO.test(f.name) || IMAGE.test(f.name))
  const asItem = f => ({ url: f.url, type: VIDEO.test(f.name) ? 'video' : 'image', caption: captionFrom(f.name) })

  const heroFile = visual.find(f => /^hero\./i.test(f.name))
  const gallery = visual.filter(f => f !== heroFile).map(asItem)

  const modelFile = list.find(f => MODEL.test(f.name))
  let model = null
  if (modelFile) {
    const base = modelFile.name.replace(/\.[^.]+$/, '')
    const mtl = list.find(f => f.name === `${base}.mtl`)
    model = { url: modelFile.url, ext: modelFile.name.split('.').pop().toLowerCase(), mtl: mtl?.url }
  }

  return { hero: heroFile ? asItem(heroFile) : null, gallery, model }
}
