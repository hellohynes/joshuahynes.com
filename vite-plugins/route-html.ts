import type { Plugin } from 'vite'
import { allItems } from '../src/content/items.ts'
import type { Item } from '../src/content/types.ts'
import { itemPath, visibleItems } from '../src/lib/items.ts'

export function routePaths(items: readonly Item[]): string[] {
  const published = visibleItems(items, { includeDrafts: false })
  return [...new Set(['/work', '/about', ...published.map(itemPath)])]
}

// Static hosts serve real files only, so every route gets its own copy of the SPA shell.
export function routeHtml(): Plugin {
  return {
    name: 'route-html',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const shell = bundle['index.html']
      if (shell?.type !== 'asset') {
        this.error('route-html: no index.html asset in the bundle')
      }
      const source = shell.source
      const fileNames = routePaths(allItems).map((path) => `${path.slice(1)}/index.html`)
      for (const fileName of [...fileNames, '404.html']) {
        this.emitFile({ type: 'asset', fileName, source })
      }
    },
  }
}
