import type { ReactNode } from 'react'

/**
 * The frame every page but a piece shares: the window inset (20px, 24px from `md`) that seats the header in the corner,
 * and at least a screen of height so the page's own footer can sit at the bottom. `className` adds to it, nothing more,
 * so the header lands in the same place whichever page is showing.
 */
export function PageFrame({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`relative flex min-h-dvh flex-col p-5 md:p-6 ${className}`}>{children}</div>
}

/** The gap between the header and the first thing under it, the same on Work, About and Not found. */
export const BELOW_HEADER = 'pt-16'
