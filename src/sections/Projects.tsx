import { useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { ArrowUpRight, Asterisk } from 'lucide-react'
import { FadeIn } from '../components/FadeIn'
import { ContactButton, LiveProjectButton } from '../components/Buttons'
import { AssetImage } from '../components/AssetImage'
import { ProjectDialog } from '../components/ProjectDialog'
import { email, projects, type Project } from '../data'
import { useI18n } from '../i18n'

function ProjectCard({
  project,
  index,
  progress,
  onOpen,
}: {
  project: Project
  index: number
  progress: MotionValue<number>
  onOpen: () => void
}) {
  const reducedMotion = useReducedMotion()
  const targetScale = 1 - (projects.length - index) * 0.05
  const scale = useTransform(progress, [index * (1 / projects.length), 1], [1, targetScale])
  return (
    <div className="project-card-container" style={{ top: `calc(5vh + ${index * 24}px)` }}>
      <motion.article
        className="project-card"
        style={{ scale: reducedMotion ? 1 : scale, transformOrigin: 'top center' }}
      >
        <div className="project-card-heading">
          <div className="project-title">
            <span className="project-index font-mono">0{index + 1}</span>
            <div>
              <p className="eyebrow font-mono">{project.english}</p>
              <h3>{project.title}</h3>
            </div>
          </div>
          <div className="project-card-action">
            <span>{project.category}</span>
            <LiveProjectButton title={project.title} onClick={onOpen} />
          </div>
        </div>
        <div className="project-images">
          {project.images.map((image, imageIndex) => (
            <figure key={imageIndex} className={`project-image project-image-${imageIndex + 1}`}>
              <AssetImage
                src={image.src}
                alt={image.alt}
                loading="lazy"
                decoding="async"
                style={{ objectPosition: image.position }}
              />
              {image.caption && <figcaption>{image.caption}</figcaption>}
            </figure>
          ))}
        </div>
        <div className="project-caption">
          <p>{project.description}</p>
          <span className="eyebrow font-mono">WINDWINGS / {String(index + 1).padStart(2, '0')}</span>
        </div>
      </motion.article>
    </div>
  )
}

export function Projects() {
  const { t } = useI18n()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const year = new Date().getFullYear()

  return (
    <section id="projects" className="projects relative z-10">
      <div className="section-shell">
        <FadeIn className="section-topline">
          <span className="eyebrow">{t('projectsEyebrow')}</span>
          <span className="eyebrow font-mono">{t('projectsYears')}</span>
        </FadeIn>
        <FadeIn className="project-heading">
          <h2 className="section-heading">
            {t('projectsHeading')}
            <span className="project-count font-mono">(03)</span>
          </h2>
          <p>
            {t('projectsAside').split('\n').map((line, i, arr) => (
              <span key={i}>
                {line}
                {i < arr.length - 1 && <br />}
              </span>
            ))}
          </p>
        </FadeIn>
        <div ref={ref} className="project-stack">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              progress={scrollYProgress}
              onOpen={() => setActiveProject(project)}
            />
          ))}
        </div>
        <footer id="contact" className="contact-section">
          <FadeIn>
            <span className="eyebrow">{t('contactEyebrow')}</span>
            <h2>
              {t('contactHeading1')}
              <br />
              <span className="contact-accent">{t('contactHeading2')}</span>
              <Asterisk className="contact-asterisk" strokeWidth={1} aria-hidden="true" />
            </h2>
          </FadeIn>
          <div className="contact-details">
            <p>
              {t('contactTagline')}
              <br />
              <span>{t('contactStudio')}</span>
            </p>
            <ContactButton />
          </div>
          <div className="contact-links">
            <a href={`mailto:${email}`}>
              {email}
              <ArrowUpRight size={20} aria-hidden="true" />
            </a>
            <p>
              {t('wechat')} <span>windwingslab</span>
            </p>
          </div>
          <div className="footer-bottom">
            <span>{t('copyright', { year })}</span>
            <span>{t('footerTag')}</span>
            <a href="#home">{t('backToTop')}</a>
          </div>
        </footer>
      </div>
      <ProjectDialog project={activeProject} onClose={() => setActiveProject(null)} />
    </section>
  )
}
