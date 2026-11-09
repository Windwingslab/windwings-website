import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { ContactButton } from './Buttons'
import { AssetImage } from './AssetImage'
import type { Project } from '../data'
import { useI18n } from '../i18n'

export function ProjectDialog({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const { t } = useI18n()
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
  return (
    <dialog
      ref={ref}
      className="project-dialog"
      aria-labelledby="project-dialog-title"
      aria-describedby="project-dialog-description"
      onCancel={event => {
        event.preventDefault()
        onClose()
      }}
      onClick={event => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      {project && (
        <div className="dialog-content">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="eyebrow font-mono">{project.category}</p>
              <h2 id="project-dialog-title">{project.title}</h2>
            </div>
            <button type="button" autoFocus className="dialog-close" onClick={onClose} aria-label={t('dialogClose')}>
              <X size={25} />
            </button>
          </div>
          {project.film ? (
            <video
              key={project.id}
              controls
              playsInline
              preload="metadata"
              poster={project.images[1].src}
              src={project.film}
              aria-label={`${project.title}`}
            >
              {t('dialogVideoFallback')} <a href={project.film}>{t('dialogOpenVideo')}</a>
            </video>
          ) : (
            <AssetImage src={project.images[0].src} alt={project.images[0].alt} className="dialog-placeholder" />
          )}
          <p id="project-dialog-description">{project.description}</p>
          {project.placeholder && <p className="placeholder-note">{t('dialogPlaceholder')}</p>}
          <ContactButton />
        </div>
      )}
    </dialog>
  )
}
