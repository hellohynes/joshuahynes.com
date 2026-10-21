import { sortNewestFirst, visibleItems } from '../lib/items.ts'
import { allItems } from './items.ts'

export const items = sortNewestFirst(visibleItems(allItems, { includeDrafts: import.meta.env.DEV }))
