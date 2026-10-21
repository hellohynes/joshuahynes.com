import type { Media } from '../../content/types.ts'

/** The tile shape of the old work grid. Only WorkGrid, WorkCard and WorkDetail use it; they are removed with the new work page. */
export interface WorkItem {
  id: string
  title: string
  role: string
  period: string
  problem: string
  outcome: string
  cols: number
  rows: number
  fit?: 'cover' | 'contain'
  media?: Media
}
