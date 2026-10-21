import { useEffect } from 'react'
import { items } from './content/index.ts'
import { site } from './content/site.ts'
import { findItem } from './lib/items.ts'
import { useRoute } from './lib/router.tsx'
import { About } from './pages/About'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import { Work } from './pages/Work'
import { WorkPage } from './pages/WorkPage'

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

  switch (route.name) {
    case 'home':
      return <Home />
    case 'work':
      return <Work />
    case 'about':
      return <About />
    case 'piece':
      return piece ? <WorkPage id={piece.id} /> : <NotFound />
    default:
      return <NotFound />
  }
}

export default App
