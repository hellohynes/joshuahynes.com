import type { ReactNode } from 'react'
import { site } from '../content/site.ts'
import { statsLine } from '../lib/format.ts'

const link = 'text-ink underline-offset-4 hover:underline'

/**
 * The page footer shared by Home and About: the email (a link, in ink) with any extra controls beside it, and the stats
 * line in the lighter grey. `id` makes it a focusable jump target (About's #contact).
 */
export function SiteFooter({ id, children }: { id?: string; children?: ReactNode }) {
  return (
    <footer
      id={id}
      tabIndex={id ? -1 : undefined}
      className="flex scroll-mt-6 flex-col gap-3 pt-6 outline-none md:flex-row md:items-baseline md:justify-between md:gap-10"
    >
      <div className="flex shrink-0 flex-col items-start gap-1 md:flex-row md:items-baseline md:gap-8">
        <p className="m-0 text-[15px] leading-[1.2] tracking-[-0.3px] text-muted">
          <a href={`mailto:${site.contact.email}`} className={link}>
            {site.contact.email}
          </a>
        </p>
        {children}
      </div>
      <p className="m-0 text-[13px] leading-[1.4] tracking-[-0.2px] text-muted md:text-right">{statsLine(site.stats)}</p>
    </footer>
  )
}
