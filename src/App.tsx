import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Intro } from './components/Intro'
import { WorkGrid } from './components/WorkGrid'
import { WorkHistory } from './components/WorkHistory'
import { content } from './content'

function App() {
  const { name, intro, history, work, social } = content

  return (
    <div id="top" className="px-[clamp(1.5rem,6.8vw,6rem)]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:bg-bg focus:p-2 focus:text-xs"
      >
        Skip to content
      </a>
      <Header name={name} />
      <main id="main">
        <Intro name={name} parts={intro} />
        <WorkHistory history={history} />
        <WorkGrid work={work} />
      </main>
      <Footer social={social} />
    </div>
  )
}

export default App
