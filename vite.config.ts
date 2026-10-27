import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { routeHtml } from './vite-plugins/route-html.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), routeHtml()],
  base: '/',
  test: {
    include: ['src/**/*.test.ts', 'vite-plugins/**/*.test.ts', 'scripts/**/*.test.mjs'],
    // Vitest returns an empty string for CSS imports; the theme test reads the palette from index.css as text.
    css: { include: [/src\/index\.css/] },
  },
})
