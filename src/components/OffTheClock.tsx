import type { ReactNode } from 'react'
import { Court } from '../figures/Court'
import { Field } from '../figures/Field'
import { SprayChart } from '../figures/SprayChart'
import { InlineGlyph } from './InlineGlyph'

const TEAMS: { label: string; glyph: 'baseball' | 'basketball' | 'football'; figure: ReactNode }[] = [
  { label: 'Red Sox', glyph: 'baseball', figure: <SprayChart /> },
  { label: 'Celtics', glyph: 'basketball', figure: <Court /> },
  { label: 'Patriots', glyph: 'football', figure: <Field /> },
]

/** The sports drawings, kept small and out of the way: personality, not the pitch. */
export function OffTheClock() {
  return (
    <section aria-labelledby="off-h" className="border-t border-rule py-16">
      <h2 id="off-h" className="font-mono text-xs uppercase tracking-[0.08em] text-muted">
        Off the clock
      </h2>
      <div className="mt-8 grid gap-12 md:grid-cols-3 md:gap-8">
        {TEAMS.map((t) => (
          <div key={t.label} className="max-w-md">
            <p className="mb-4 font-serif text-3xl tracking-[-0.01em]">
              <InlineGlyph name={t.glyph} />
              {t.label}
            </p>
            {t.figure}
          </div>
        ))}
      </div>
    </section>
  )
}
