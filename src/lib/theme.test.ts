import { describe, expect, it } from 'vitest'
import css from '../index.css?raw'
import { contrastRatio } from './color.ts'

// The custom properties declared in the first block that follows `selector`.
function tokens(selector: string): Record<string, string> {
  const at = css.indexOf(selector)
  if (at < 0) throw new Error(`index.css has no block that starts with ${selector}`)
  const open = css.indexOf('{', at)
  const close = css.indexOf('}', open)
  const declarations = css.slice(open + 1, close).matchAll(/(--[\w-]+):\s*([^;]+);/g)
  return Object.fromEntries([...declarations].map(([, name, value]) => [name, value.trim()]))
}

const THEMES = {
  light: ':root {',
  'dark (system preference)': ':root:not([data-theme="light"]) {',
  'dark (toggle)': ':root[data-theme="dark"] {',
}

describe('theme tokens', () => {
  it.each(Object.entries(THEMES))('muted text reaches 4.5:1 on the %s background', (_theme, selector) => {
    const theme = tokens(selector)
    expect(theme['--muted'], `--muted in ${selector}`).toBeDefined()
    expect(theme['--bg'], `--bg in ${selector}`).toBeDefined()
    expect(contrastRatio(theme['--muted'], theme['--bg'])).toBeGreaterThanOrEqual(4.5)
  })
})
