import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Set the base to be relative. This is important for a backend-served app.
  base: './',
  build: {
    // The output directory for the build.
    outDir: 'dist',
    // Specifies the directory to nest generated assets under.
    assetsDir: 'assets',
  },
})
