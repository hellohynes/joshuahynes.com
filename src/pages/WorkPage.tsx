import { useEffect } from 'react'
import type { CSSProperties } from 'react'
import { WorkMedia } from '../components/work/WorkMedia'
import { items } from '../content/index.ts'
import { site } from '../content/site.ts'
import { readableText } from '../lib/color.ts'
import { findItem, itemPath, nextItem } from '../lib/items.ts'
import { Link, navigate } from '../lib/router.tsx'

const barLink = 'inline-flex h-11 items-center underline-offset-4 hover:underline'

/** A piece's page: its colour full-bleed, pictures on the left, the pinned story on the right. */
export function WorkPage({ id }: { id: string }) {
  const item = findItem(items, 'work', id)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) navigate('/work')
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  if (!item) return null

  const next = nextItem(items, id)
  const pictures = item.gallery ?? []
  const hasPictures = Boolean(item.media) || pictures.length > 0

  return (
    <div
      className="piece flex min-h-dvh flex-col bg-[var(--piece-bg)] text-[15px] leading-[1.4] tracking-[-0.3px] text-[var(--piece-fg)]"
      style={{ '--piece-bg': item.color, '--piece-fg': readableText(item.color) } as CSSProperties}
    >
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b border-current bg-[var(--piece-bg)] px-6 lg:px-[3vw]">
        <Link to="/" className={barLink}>
          {site.name}
        </Link>
        <span className="min-w-0 truncate">Work / {item.title}</span>
        <Link to="/work" className={barLink}>
          Close ×
        </Link>
      </header>

      <main id="main" className={`grid flex-1 ${hasPictures ? 'lg:grid-cols-[2fr_1fr]' : ''}`}>
        {hasPictures && (
          <div className="flex flex-col gap-6 px-6 pt-6 pb-12 lg:gap-[3vw] lg:border-r lg:border-current lg:px-[3vw] lg:pt-[3vw] lg:pb-[6vw]">
            {item.media && (
              <div className="w-full overflow-hidden">
                <WorkMedia media={item.media} label={item.title} eager />
              </div>
            )}
            {pictures.map((picture) => (
              <div key={picture.src} className="w-full overflow-hidden">
                <WorkMedia media={picture} label={item.title} />
              </div>
            ))}
          </div>
        )}

        <article className={`flex flex-col gap-6 px-6 pt-6 pb-12 lg:sticky lg:top-14 lg:max-h-[calc(100dvh-7rem)] lg:self-start lg:overflow-y-auto lg:pt-[3vw] lg:pb-[3vw] ${hasPictures ? 'lg:px-[2vw]' : 'lg:max-w-3xl lg:px-[3vw]'}`}>
          <h1 className="m-0 text-[clamp(2.25rem,4.6vw,4.5rem)] leading-[0.95] font-semibold tracking-[-0.05em]">
            {item.title}
          </h1>
          <p className="m-0 text-[17px] leading-[1.35]">{item.headline}</p>

          {item.impact.length > 0 && (
            <ul className="m-0 flex list-disc flex-col gap-1 pl-5">
              {item.impact.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          )}

          <dl className="m-0 grid grid-cols-[4.5rem_1fr] gap-y-1">
            <dt>Role</dt>
            <dd className="m-0">{item.role}</dd>
            <dt>Period</dt>
            <dd className="m-0">{item.period}</dd>
            {item.team && (
              <>
                <dt>Team</dt>
                <dd className="m-0">{item.team}</dd>
              </>
            )}
          </dl>

          <p className="m-0 text-[17px] leading-[1.5]">{item.summary}</p>

          {item.story?.map((paragraph) => (
            <p key={paragraph} className="m-0 leading-[1.6]">
              {paragraph}
            </p>
          ))}

          {item.credits && item.credits.length > 0 && (
            <details>
              <summary className="cursor-pointer underline underline-offset-4">Credits</summary>
              <dl className="m-0 mt-3 grid grid-cols-[minmax(0,auto)_1fr] gap-x-6 gap-y-1">
                {item.credits.map((credit) => (
                  <div key={`${credit.role}:${credit.name}`} className="contents">
                    <dt>{credit.role}</dt>
                    <dd className="m-0">{credit.name}</dd>
                  </div>
                ))}
              </dl>
            </details>
          )}
        </article>
      </main>

      <footer className="sticky bottom-0 z-10 flex h-14 items-center justify-end border-t border-current bg-[var(--piece-bg)] px-6 lg:px-[3vw]">
        {next && (
          <Link to={itemPath(next)} className={barLink} aria-label={`Next: ${next.title}`}>
            Next →
          </Link>
        )}
      </footer>
    </div>
  )
}
