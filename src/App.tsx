import { Hero } from './sections/Hero'
import { Marquee } from './sections/Marquee'
import { About } from './sections/About'
import { Services } from './sections/Services'
import { Projects } from './sections/Projects'

export default function App() {
  return <>
    <a href="#about" className="skip-link">跳至主要内容</a>
    <main style={{ overflowX: 'clip' }}>
      <Hero /><Marquee /><About /><Services /><Projects />
    </main>
  </>
}
