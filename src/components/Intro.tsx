import type { ReactNode } from 'react'
import type { Content, InlineItem } from '../content'
import { ContributionGraph } from './intro/ContributionGraph'
import { DialpadMark } from './intro/DialpadMark'
import { Robot } from './intro/Robot'
import { TerminalBrowser } from './intro/TerminalBrowser'

const ITEMS: Record<InlineItem, ReactNode> = {
  dialpad: <DialpadMark />,
  terminal: <TerminalBrowser />,
  robot: <Robot />,
  commits: <ContributionGraph />,
}

const mono = 'font-mono text-xs uppercase tracking-[0.08em] text-muted'

/**
 * The intro, set the way Emily Campbell sets hers: a run of statements as one paragraph, each ending in a
 * small drawing. The full work history, current role first, sits below as rows.
 */
export function Intro({ current, earlier }: Pick<Content, 'current' | 'earlier'>) {
  return (
    <section aria-labelledby="role" className="pb-20 pt-8 sm:pt-12">
      {/* The role is shown in the work history below; this heading is for screen readers and the page outline. */}
      <h1 id="role" className="sr-only">
        {current.company}, {current.title}
      </h1>

      <p className="font-serif text-[max(1.5rem,4vw)] font-[340] leading-[1.2] tracking-[-0.02em] text-pretty">
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
