import { LocaleProvider, useI18n } from './i18n'
import { Header } from './components/Header'
import { Hero } from './sections/Hero'
import { Marquee } from './sections/Marquee'
import { About } from './sections/About'
import { Services } from './sections/Services'
import { Projects } from './sections/Projects'

function Shell() {
  const { t } = useI18n()
  return (
    <>
      <a href="#about" className="skip-link">{t('skipToContent')}</a>
      <Header />
      <main style={{ overflowX: 'clip' }}>
        <Hero />
        <Marquee />
        <About />
        <Services />
        <Projects />
      </main>
    </>
  )
}

export default function App() {
  return (
    <LocaleProvider>
      <Shell />
    </LocaleProvider>
  )
}
