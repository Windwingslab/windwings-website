import { useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { ArrowUpRight, Asterisk } from 'lucide-react'
import { FadeIn } from '../components/FadeIn'
import { ContactButton, LiveProjectButton } from '../components/Buttons'
import { AssetImage } from '../components/AssetImage'
import { ProjectDialog } from '../components/ProjectDialog'
import { email, projects, type Project } from '../data'

function ProjectCard({ project, index, progress, onOpen }: {
  project: Project; index: number; progress: MotionValue<number>; onOpen: () => void
}) {
  const reducedMotion = useReducedMotion()
  // Stack math: earlier cards shrink as the following cards arrive.
  const targetScale = 1 - (projects.length - index) * 0.05
  const scale = useTransform(progress, [index * (1 / projects.length), 1], [1, targetScale])
  return <div className="project-card-container" style={{ top: `calc(5vh + ${index * 24}px)` }}>
    <motion.article className="project-card border border-[#D7E2EA]" style={{ scale: reducedMotion ? 1 : scale, transformOrigin: 'top center' }}>
      <div className="project-card-heading">
        <div className="project-title"><span className="project-index">0{index + 1}</span><div><p className="eyebrow">{project.english}</p><h3>{project.title}</h3></div></div>
        <div className="project-card-action"><span>{project.category}</span><LiveProjectButton title={project.title} onClick={onOpen} /></div>
      </div>
      <div className="project-images">
        {project.images.map((image, imageIndex) => <figure key={imageIndex} className={`project-image project-image-${imageIndex + 1}`}>
          <AssetImage src={image.src} alt={image.alt} loading="lazy" decoding="async" style={{ objectPosition: image.position }} />
          {image.caption && <figcaption>{image.caption}</figcaption>}
        </figure>)}
      </div>
      <div className="project-caption"><p>{project.description}</p><span className="eyebrow">WINDWINGS / {String(index + 1).padStart(2, '0')}</span></div>
    </motion.article>
  </div>
}

export function Projects() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  return <section id="projects" className="projects relative z-10 -mt-[60px] rounded-t-[40px] bg-ink text-silver md:rounded-t-[50px] lg:rounded-t-[60px]">
    <div className="section-shell">
      <FadeIn className="section-topline"><span className="eyebrow">SELECTED WORK / SELECTED MOMENTS</span><span className="eyebrow">2025 — 2026</span></FadeIn>
      <FadeIn className="project-heading"><h2 className="section-heading">Project<span className="project-count">(03)</span></h2><p>Some things are better<br />seen than explained.</p></FadeIn>
      <div ref={ref} className="project-stack">
        {projects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} progress={scrollYProgress} onOpen={() => setActiveProject(project)} />)}
      </div>
      <footer id="contact" className="contact-section">
        <FadeIn><span className="eyebrow">HAVE SOMETHING IN MIND?</span><h2>Let’s make<br /><span className="hero-heading">a scene.</span><Asterisk className="contact-asterisk" strokeWidth={1} aria-hidden="true" /></h2></FadeIn>
        <div className="contact-details"><p>下一个现场，一起创造。<br /><span>风翮设计实验室 / WINDWINGS</span></p><ContactButton /></div>
        <div className="contact-links"><a href={`mailto:${email}`}>{email}<ArrowUpRight size={20} aria-hidden="true" /></a><p>WECHAT <span>windwingslab</span></p></div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} WINDWINGS</span><span>VISUALS WITH A LIFE OF THEIR OWN.</span><a href="#home">BACK TO TOP ↑</a></div>
      </footer>
    </div>
    <ProjectDialog project={activeProject} onClose={() => setActiveProject(null)} />
  </section>
}
