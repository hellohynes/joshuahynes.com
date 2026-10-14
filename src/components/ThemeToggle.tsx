import { useState } from 'react'

type Theme = 'light' | 'dark'

function currentTheme(): Theme {
  const set = document.documentElement.dataset.theme
  if (set === 'light' || set === 'dark') return set
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(currentTheme)
  const dark = theme === 'dark'

  function toggle() {
    const next: Theme = dark ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem('theme', next)
    } catch {
      /* storage blocked: the choice still applies for this visit */
    }
    setTheme(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      className="inline-flex min-h-6 items-center gap-2 font-mono text-xs uppercase tracking-[0.08em] text-muted hover:text-ink"
    >
      <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5 stroke-current" fill={dark ? 'currentColor' : 'none'} strokeWidth={1.25}>
        <circle cx="8" cy="8" r="6" />
      </svg>
      Dark
    </button>
  )
}
