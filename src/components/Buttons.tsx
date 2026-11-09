import { ArrowUpRight } from 'lucide-react'
import { email } from '../data'
import { useI18n } from '../i18n'

export function ContactButton({ className = '' }: { className?: string }) {
  const { t } = useI18n()
  return (
    <a href={`mailto:${email}`} className={`contact-button group ${className}`}>
      <span>{t('contactCta')}</span>
      <ArrowUpRight
        size={21}
        aria-hidden="true"
        className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
      />
    </a>
  )
}

export function LiveProjectButton({ onClick, title }: { onClick: () => void; title: string }) {
  const { t } = useI18n()
  return (
    <button
      type="button"
      onClick={onClick}
      className="live-project-button group"
      aria-label={`${t('liveProjectAria')} ${title}`}
    >
      {t('liveProject')}
      <ArrowUpRight
        size={20}
        aria-hidden="true"
        className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
      />
    </button>
  )
}
