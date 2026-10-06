# Alejandro Valdez · Engineering Portfolio

Personal portfolio for aerospace engineering projects: rockets, payloads, propulsion, and ground-station software. SpaceX-inspired layout with Apple-style scroll-driven 3D product scenes.

## Features

- **Scroll-driven 3D** (React Three Fiber): CAD models pin to the screen and rotate as you scroll, with captions fading through each subsystem.
- **Explore mode**: zoom, click any part to remove it, explode the assembly, and slide a cutaway plane through the model to see inside.
- **Live GitHub integration**: profile stats, language mix, recent repos, and per-project commit history pulled from the GitHub API (cached client-side).
- **Category navigation** modeled on SpaceX's vehicle pages: Rockets, Software, Impact.
- **⌘K command palette** to jump to any project or copy contact details.
- **Drop-in media**: put images, videos, or CAD files in `src/media/<project>/` and they appear with no code changes.
- **Content editor** at `/admin` for every line of text on the site.

## Stack

React 19 · Vite · React Three Fiber + Drei · Three.js · Framer Motion · React Router

## Run locally

```bash
npm install
npm run dev
```

## Adding media

```
src/media/<project>/hero.jpg | hero.mp4     full-screen header
src/media/<project>/01-launch-day.mp4       gallery item (caption from filename)
src/media/<project>/model.glb               3D model (also .obj + .mtl, .stl)
src/media/resume.pdf                        enables Resume buttons site-wide
```

Large Fusion 360 OBJ exports can be shrunk dramatically with Draco compression:

```bash
npx obj2gltf -i model.obj -o model.glb
npx gltf-pipeline -i model.glb -o model.glb -d
```
