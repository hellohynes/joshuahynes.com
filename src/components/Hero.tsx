import type { Content } from '../content'
import { SprayChart } from '../figures/SprayChart'
import { InlineGlyph } from './InlineGlyph'
import { ScopeStrip } from './ScopeStrip'

export function Hero({ role, thesis, scope }: Pick<Content, 'role' | 'thesis' | 'scope'>) {
  return (
    <section aria-labelledby="thesis" className="pb-20 pt-8 sm:pt-12">
      <p className="flex flex-wrap justify-between gap-x-8 gap-y-1 font-mono text-xs uppercase tracking-[0.08em] text-muted">
        <span>{role.title}</span>
        <span>{role.dates}</span>
      </p>
      <h1
        id="thesis"
        className="mt-5 max-w-[22ch] font-serif text-[clamp(2.25rem,4.7vw,7rem)] font-[360] leading-[1.03] tracking-[-0.025em] sm:max-w-[30ch] text-balance"
      >
        {thesis.map((part, i) => {
          if (typeof part === 'string') return <span key={i}>{part} </span>
          if ('glyph' in part) return <InlineGlyph key={i} name={part.glyph} />
          return (
            <span key={i} className="font-script text-[1.12em] font-normal leading-[0.8] tracking-normal text-[color:var(--sox-red)]">
              {part.script}{' '}
            </span>
          )
        })}
      </h1>
      <div className="mt-8 grid items-end gap-12 lg:grid-cols-[1fr_minmax(0,max(30rem,30vw))]">
        <ScopeStrip stats={scope} />
        <SprayChart />
      </div>
    </section>
  )
}
