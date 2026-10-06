import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Let CAD files dropped into src/media be served as plain asset URLs
  assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.obj', '**/*.mtl', '**/*.stl'],
  server: { port: parseInt(process.env.PORT || '5174') },
})
