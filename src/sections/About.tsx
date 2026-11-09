import { AnimatedText } from '../components/AnimatedText'
import { FadeIn } from '../components/FadeIn'
import { AssetImage } from '../components/AssetImage'
import { ContactButton } from '../components/Buttons'
import { decorations } from '../data'
import { useI18n } from '../i18n'

export function About() {
  const { locale, t } = useI18n()
  return (
    <section id="about" className="about relative flex min-h-screen items-center justify-center text-text">
      {decorations.map((src, index) => (
        <AssetImage
          key={src}
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          className={`about-deco about-deco-${index + 1}`}
        />
      ))}
      <div className="about-content relative z-10 text-center">
        <FadeIn>
          <span className="eyebrow">{t('aboutEyebrow')}</span>
          <h2 className="section-heading">{t('aboutHeading')}</h2>
        </FadeIn>
        <AnimatedText key={locale} text={t('aboutBody')} />
        {locale === 'en' && (
          <FadeIn delay={0.1}>
            <p className="about-chinese">{t('aboutChinese')}</p>
          </FadeIn>
        )}
        <FadeIn delay={0.15}>
          <ContactButton />
        </FadeIn>
      </div>
    </section>
  )
}
