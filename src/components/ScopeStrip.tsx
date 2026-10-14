import type { Stat } from '../content'

/** Scope as numbers, set like a box score. */
export function ScopeStrip({ stats }: { stats: Stat[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-8">
      {stats.map((s) => (
        <div key={s.label} className="flex flex-col-reverse justify-end gap-2 border-t border-rule pt-3">
          <dt className="font-mono text-xs uppercase tracking-[0.08em] text-muted">{s.label}</dt>
          <dd className="m-0 font-mono text-[clamp(2.25rem,4.2vw,5.5rem)] leading-none tracking-tight tabular-nums">{s.value}</dd>
        </div>
      ))}
    </dl>
  )
}
