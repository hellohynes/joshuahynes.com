import { useEffect, useRef } from 'react'
import { items } from './content/index.ts'
import { site } from './content/site.ts'
import { findItem } from './lib/items.ts'
import { useRoute } from './lib/router.tsx'
import { About } from './pages/About'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import { Work } from './pages/Work'
import { WorkPage } from './pages/WorkPage'

/** Where focus goes after an in-app route change: back to the piece's cell from its page, otherwise the new page's main. */
function focusAfterNavigation(from: string, to: string) {
  const piece = from.startsWith('piece:') ? from.slice('piece:'.length) : null
  const cell = piece && to === 'work' ? document.querySelector<HTMLElement>(`.work-cells a[href$="/work/${piece}"]`) : null
  const target = cell ?? document.getElementById('main')
  target?.focus({ preventScroll: true })
}

function App() {
  const route = useRoute()
  const piece = route.name === 'piece' ? findItem(items, route.kind, route.id) : undefined

  let title: string
  switch (route.name) {
    case 'home':
      title = site.name
      break
    case 'work':
      title = `Work · ${site.name}`
      break
    case 'about':
      title = `About · ${site.name}`
      break
    case 'piece':
      title = piece ? `${piece.title} · ${site.name}` : `Not found · ${site.name}`
      break
    default:
      title = `Not found · ${site.name}`
  }

  useEffect(() => {
    document.title = title
  }, [title])

  // Focus follows an in-app route change, not the first load or a hash jump (those have their own targets).
  const routeKey = route.name === 'piece' ? `piece:${route.id}` : route.name
  const previousKey = useRef<string | null>(null)
  useEffect(() => {
    const from = previousKey.current
    previousKey.current = routeKey
    if (from === null || from === routeKey || location.hash) return
    focusAfterNavigation(from, routeKey)
  }, [routeKey])

  switch (route.name) {
    case 'home':
      return <Home />
    case 'work':
      return <Work />
    case 'about':
      return <About />
    case 'piece':
      return piece ? <WorkPage key={piece.id} id={piece.id} /> : <NotFound />
    default:
      return <NotFound />
  }
}

export default App
