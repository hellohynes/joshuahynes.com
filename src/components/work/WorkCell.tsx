import type { CSSProperties } from 'react'
import type { WorkItem } from '../../content/types.ts'
import { readableText } from '../../lib/color.ts'
import { itemPath } from '../../lib/items.ts'
import { Link } from '../../lib/router.tsx'
import { WorkMedia } from './WorkMedia'

/** One piece on the work grid: a quiet caption that opens into a colour field and the picture on hover or focus. */
export function WorkCell({ item }: { item: WorkItem }) {
  const year = item.date.slice(0, 4)
  const style = { '--cell-bg': item.color, '--cell-fg': readableText(item.color) } as CSSProperties

  return (
    <Link to={itemPath(item)} className="work-cell" style={style} aria-label={`${item.title}, ${year}`}>
      <span className="work-cell-field" aria-hidden="true" />
      <span className="work-cell-media" aria-hidden="true">
        <WorkMedia media={item.media} label={item.title} />
      </span>
      <span className="work-cell-caption">
        <span>{year}</span>
        <span>{item.title}</span>
      </span>
    </Link>
  )
}
