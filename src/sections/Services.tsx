import { ArrowUpRight } from 'lucide-react'
import { FadeIn } from '../components/FadeIn'
import { services } from '../data'

export function Services() {
  return <section id="services" className="services relative rounded-t-[40px] bg-white text-ink md:rounded-t-[50px] lg:rounded-t-[60px]">
    <div className="section-shell">
      <FadeIn className="section-topline"><span className="eyebrow">WHAT WE CAN DO TOGETHER</span><span className="eyebrow">01 — 05</span></FadeIn>
      <FadeIn><h2 className="section-heading">Services</h2></FadeIn>
      <div className="service-list">
        {services.map((service, index) => <FadeIn key={service.title} delay={index * 0.08}>
          <article className="service-row border-t border-[rgba(12,12,12,0.15)]">
            <span className="service-number">0{index + 1}</span>
            <div className="service-name"><h3>{service.title}</h3><p>{service.label}</p></div>
            <div className="service-description"><p>{service.description}</p><span className="eyebrow">{service.tags}</span></div>
            <ArrowUpRight className="service-arrow" size={30} strokeWidth={1.1} aria-hidden="true" />
          </article>
        </FadeIn>)}
      </div>
    </div>
  </section>
}
