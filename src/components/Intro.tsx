import type { ReactNode } from 'react'
import type { Content, InlineItem } from '../content'
import { CommitLegend } from './intro/CommitLegend'
import { DialpadMark } from './intro/DialpadMark'
import { Robot } from './intro/Robot'
import { TerminalBrowser } from './intro/TerminalBrowser'

const ITEMS: Record<InlineItem, ReactNode> = {
  dialpad: <DialpadMark />,
  terminal: <TerminalBrowser />,
  robot: <Robot />,
  commits: <CommitLegend />,
}

const mono = 'font-mono text-xs uppercase tracking-[0.08em] text-muted'

/**
 * The current role, set the way Emily Campbell sets hers: the company and title, the dates, then a run of
 * statements that each end in a small drawing. The full work history, current role first, sits below as rows.
 */
export function Intro({ current, earlier }: Pick<Content, 'current' | 'earlier'>) {
  return (
    <section aria-labelledby="role" className="pb-20 pt-8 sm:pt-12">
      <h1
        id="role"
        className="max-w-[24ch] font-serif text-[clamp(2rem,4.4vw,6rem)] font-[360] leading-[1.05] tracking-[-0.025em] text-balance"
      >
        {current.company}, {current.title}
      </h1>
      <p className={`mt-4 flex flex-wrap gap-x-6 gap-y-1 ${mono}`}>
        <span>{current.dates}</span>
        <span aria-label="Scope">
          {current.scope.map((s) => `${s.value} ${s.label}`).join(' · ')}
        </span>
      </p>

      <p className="mt-10 max-w-[30em] font-serif text-[clamp(1.375rem,2.5vw,3.25rem)] font-[340] leading-[1.28] tracking-[-0.012em] text-pretty sm:mt-14">
        {current.statements.map((s) => {
          // Keep each drawing with the last word of its statement so it never wraps onto a line of its own.
          const cut = s.text.lastIndexOf(' ')
          return (
            <span key={s.item}>
              {s.text.slice(0, cut + 1)}
              <span className="whitespace-nowrap">
                {s.text.slice(cut + 1)}
                {ITEMS[s.item]}
              </span>{' '}
            </span>
          )
        })}
      </p>

      <ul aria-label="Work history" className="m-0 mt-16 list-none p-0 sm:mt-24">
        {[current, ...earlier].map((role) => (
          <li
            key={role.company}
            className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 border-t border-rule py-5 last:border-b"
          >
            <span className="font-serif text-[clamp(1.25rem,1.9vw,2.5rem)] tracking-[-0.01em]">
              {role.company}
              <span className="text-muted">, {role.title}</span>
            </span>
            <span className={mono}>{role.dates}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
