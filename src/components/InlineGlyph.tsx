import type { GlyphName } from '../content'

// Small 1px line drawings that sit inside a sentence, on the text baseline.
const PATHS: Record<GlyphName, string> = {
  baseball: 'M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20',
  basketball:
    'M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20M2 12h20M12 2v20M5 4.5c4 3.5 4 11.5 0 15M19 4.5c-4 3.5-4 11.5 0 15',
  football: 'M3 17C3 9 9 3 17 3c3 0 4 1 4 4 0 8-6 14-14 14-3 0-4-1-4-4zM9 15l6-6M11 9.5l1.5 1.5M13.5 12l1.5 1.5M8.5 12.5l1.5 1.5',
  record: 'M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20M12 8.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 1 0 0-7M12 11.3v.01',
}

// Stitches in team red, like the old stitched-ball roundels.
const STITCHES: Partial<Record<GlyphName, string>> = {
  baseball: 'M6.2 4.6c3 2.4 3 12.4 0 14.8M17.8 4.6c-3 2.4-3 12.4 0 14.8',
}

export function InlineGlyph({ name }: { name: GlyphName }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="mr-[0.14em] inline-block h-[0.72em] w-[0.72em] align-[-0.04em] fill-none stroke-current motion-safe:transition-transform motion-safe:duration-700 hover:motion-safe:rotate-180"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={PATHS[name]} />
      {STITCHES[name] && <path d={STITCHES[name]} style={{ stroke: 'var(--sox-red)' }} />}
    </svg>
  )
}
