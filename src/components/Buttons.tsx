import { ArrowUpRight } from 'lucide-react'
import { email } from '../data'

export function ContactButton({ className = '' }: { className?: string }) {
  return <a href={`mailto:${email}`} className={`contact-button group ${className}`}>
    <span>Let’s talk</span><ArrowUpRight size={21} aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
  </a>
}
export function LiveProjectButton({ onClick, title }: { onClick: () => void; title: string }) {
  return <button type="button" onClick={onClick} className="live-project-button group" aria-label={`Live Project — ${title}`}>
    Live Project<ArrowUpRight size={20} aria-hidden="true" className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
  </button>
}
