import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { ContactButton } from './Buttons'
import { AssetImage } from './AssetImage'
import type { Project } from '../data'

export function ProjectDialog({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (!project) return
    const dialog = ref.current!
    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.showModal()
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      previousFocus?.focus({ preventScroll: true })
    }
  }, [project])
  return <dialog ref={ref} className="project-dialog" aria-labelledby="project-dialog-title" aria-describedby="project-dialog-description"
    onCancel={event => { event.preventDefault(); onClose() }} onClick={event => { if (event.target === event.currentTarget) onClose() }}>
    {project && <div className="dialog-content">
      <div className="flex items-start justify-between gap-6">
        <div><p className="eyebrow">{project.category}</p><h2 id="project-dialog-title">{project.title}</h2></div>
        <button type="button" autoFocus className="dialog-close" onClick={onClose} aria-label="关闭项目"><X size={25} /></button>
      </div>
      {project.film
        ? <video key={project.id} controls playsInline preload="metadata" poster={project.images[1].src} src={project.film} aria-label={`${project.title} 完整作品`}>
            您的浏览器不支持视频。<a href={project.film}>打开作品视频</a>
          </video>
        : <AssetImage src={project.images[0].src} alt={project.images[0].alt} className="dialog-placeholder" />}
      <p id="project-dialog-description">{project.description}</p>
      {project.placeholder && <p className="placeholder-note">案例占位 · 正式现场图片与影片待补充</p>}
      <ContactButton />
    </div>}
  </dialog>
}
