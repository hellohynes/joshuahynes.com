import { useState } from 'react'

type Theme = 'light' | 'dark'

function currentTheme(): Theme {
  const set = document.documentElement.dataset.theme
  if (set === 'light' || set === 'dark') return set
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** An icon button: a moon in light mode (click for dark), a sun in dark mode (click for light). */
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
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="-mr-3 inline-flex size-11 cursor-pointer items-center justify-center text-muted transition-colors hover:text-ink"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="size-5 fill-none stroke-current"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {dark ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
          </>
        ) : (
          <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z" />
        )}
      </svg>
    </button>
  )
}
