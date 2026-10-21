import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Fonts are imported here, not with @import in index.css: Tailwind's PostCSS plugin inlines CSS @imports and leaves
// their relative url()s pointing at a missing ./files/ folder, so the build would emit no font files.
import '@fontsource-variable/jetbrains-mono'
import '@fontsource/yellowtail'
// Faces for the changing word in the headline: latin subset, one weight each, so only what is rendered is fetched.
import '@fontsource/instrument-serif/latin-400.css'
import '@fontsource/fraunces/latin-500.css'
import '@fontsource/dm-serif-display/latin-400.css'
import '@fontsource/permanent-marker/latin-400.css'
import '@fontsource/bungee/latin-400.css'
import '@fontsource/silkscreen/latin-400.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
