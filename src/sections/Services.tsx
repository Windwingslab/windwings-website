import { ArrowUpRight } from 'lucide-react'
import { FadeIn } from '../components/FadeIn'
import { services } from '../data'
import { useI18n } from '../i18n'

export function Services() {
  const { locale, t } = useI18n()
  return (
    <section id="services" className="services relative">
      <div className="section-shell">
        <FadeIn className="section-topline">
          <span className="eyebrow">{t('servicesEyebrow')}</span>
          <span className="eyebrow font-mono">{t('servicesRange')}</span>
        </FadeIn>
        <FadeIn>
          <h2 className="section-heading">{t('servicesHeading')}</h2>
        </FadeIn>
        <div className="service-list">
          {services.map((service, index) => (
            <FadeIn key={service.title} delay={index * 0.08}>
              <article className="service-row">
                <span className="service-number font-mono">0{index + 1}</span>
                <div className="service-name">
                  <h3>{locale === 'zh' ? service.label : service.title}</h3>
                  <p>{locale === 'zh' ? service.title : service.label}</p>
                </div>
                <div className="service-description">
                  <p>{service.description}</p>
                  <span className="eyebrow font-mono">{service.tags}</span>
                </div>
                <ArrowUpRight className="service-arrow" size={30} strokeWidth={1.1} aria-hidden="true" />
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
