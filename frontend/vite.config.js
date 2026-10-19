import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// Anchor the project root and the PostCSS config to THIS file's directory, so
// the dev/build server behaves identically whether it's launched from
// ./frontend or from the repo root. Tailwind resolves its config and `content`
// globs from process.cwd(), which previously made `@apply bg-dark-900` in
// src/index.css fail with "class does not exist" when started elsewhere.
const here = fileURLToPath(new URL('.', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  root: here,
  plugins: [react()],
  css: {
    postcss: here,
  },
})
