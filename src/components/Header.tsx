import { ArrowUpRight, Asterisk } from 'lucide-react'
import { useI18n } from '../i18n'

export function Header() {
  const { locale, setLocale, t } = useI18n()
  const links = [
    { href: '#about', label: t('navAbout') },
    { href: '#services', label: t('navServices') },
    { href: '#projects', label: t('navProjects') },
    { href: '#contact', label: t('navContact') },
  ] as const

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a href="#home" className="brand" aria-label={t('brandAria')}>
          <Asterisk size={22} strokeWidth={1.4} aria-hidden="true" />
          <span>
            windwings
            <small>{t('brandSub')}</small>
          </span>
        </a>
        <nav aria-label={t('navAria')} className="site-nav">
          {links.map(item => (
            <a key={item.href} href={item.href}>{item.label}</a>
          ))}
        </nav>
        <div className="header-actions">
          <div className="lang-switch" role="group" aria-label={t('langSwitchAria')}>
            <button
              type="button"
              className={locale === 'en' ? 'is-active' : ''}
              aria-pressed={locale === 'en'}
              onClick={() => setLocale('en')}
            >
              {t('langEn')}
            </button>
            <button
              type="button"
              className={locale === 'zh' ? 'is-active' : ''}
              aria-pressed={locale === 'zh'}
              onClick={() => setLocale('zh')}
            >
              {t('langZh')}
            </button>
          </div>
          <a href="#contact" className="header-cta">
            {t('openForCollabs')}
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
      </div>
    </header>
  )
}
