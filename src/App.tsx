import { useEffect } from 'react'
import { SiteHeader } from './components/SiteHeader'
import { items } from './content/index.ts'
import { site } from './content/site.ts'
import { findItem } from './lib/items.ts'
import { useRoute } from './lib/router.tsx'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import { Work } from './pages/Work'

// Stand-ins until the work, piece and about pages land.
function Placeholder({ text }: { text: string }) {
  return (
    <div className="px-[clamp(1.5rem,6.8vw,6rem)]">
      <SiteHeader />
      <main id="main">
        <p className="m-0 text-muted">{text}</p>
      </main>
    </div>
  )
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

  switch (route.name) {
    case 'home':
      return <Home />
    case 'work':
      return <Work />
    case 'about':
      return <Placeholder text="About (coming in Task 9)" />
    case 'piece':
      return piece ? <Placeholder text={`${piece.title} (coming in Task 8)`} /> : <NotFound />
    default:
      return <NotFound />
  }
}

export default App
