import { ArrowDown } from 'lucide-react'
import { FadeIn } from '../components/FadeIn'
import { Magnet } from '../components/Magnet'
import { ContactButton } from '../components/Buttons'
import { AssetImage } from '../components/AssetImage'
import { portrait } from '../data'
import { useI18n } from '../i18n'

export function Hero() {
  const { t } = useI18n()
  return (
    <section id="home" className="hero relative text-text">
      <div className="hero-title-wrap">
        <FadeIn duration={1.1}>
          <h1 className="hero-heading uppercase" aria-label={t('heroAria')}>
            <span>{t('heroLine1')}</span>
            <span>{t('heroLine2')}</span>
          </h1>
        </FadeIn>
      </div>
      <FadeIn className="hero-description" delay={0.25}>
        <span className="eyebrow">{t('heroEyebrow')}</span>
        <p>{t('heroDescription')}</p>
        <ContactButton />
      </FadeIn>
      <Magnet padding={150} strength={3} className="hero-portrait absolute">
        <figure>
          <AssetImage
            src={portrait}
            alt={t('portraitAlt')}
            width={620}
            height={740}
            fetchPriority="high"
            className="portrait-image"
          />
          <figcaption className="portrait-caption">{t('portraitCaption')}</figcaption>
        </figure>
      </Magnet>
      <a href="#marquee" className="hero-scroll uppercase tracking-wider">
        <span>{t('scrollExplore')}</span>
        <ArrowDown size={20} strokeWidth={1.5} aria-hidden="true" />
      </a>
      <span className="hero-coordinate">
        {t('heroCoordinate').split('\n').map((line, i) => (
          <span key={i}>
            {line}
            {i === 0 && <br />}
          </span>
        ))}
      </span>
    </section>
  )
}
