import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Locale = 'en' | 'zh'

const STORAGE_KEY = 'windwings-locale'

const messages = {
  en: {
    skipToContent: 'Skip to main content',
    brandAria: 'windwings home',
    brandSub: '风翮设计实验室',
    navAbout: 'About',
    navServices: 'Services',
    navProjects: 'Projects',
    navContact: 'Contact',
    navAria: 'Main navigation',
    openForCollabs: 'OPEN FOR COLLABS',
    langSwitchAria: 'Switch language',
    langEn: 'EN',
    langZh: '中文',
    heroAria: "Hi, we're windwings",
    heroLine1: "Hi, we're",
    heroLine2: 'windwings',
    heroEyebrow: 'INDEPENDENT VISUAL STUDIO',
    heroDescription: 'a visual studio crafting live stages, films, and brand moments',
    contactCta: "Let's talk",
    portraitAlt: 'Temporary reference portrait — replace with a windwings studio photo',
    portraitCaption: 'STUDIO PORTRAIT / COMING SOON',
    scrollExplore: 'SCROLL TO EXPLORE',
    heroCoordinate: 'CREATIVE ENERGY.\nMEMORABLE VISUALS.',
    marqueeAria: 'Motion inspiration',
    marqueeLeft: 'IN MOTION, ALWAYS.',
    marqueeRight: 'VISUAL INSPIRATION / MOTIONSITES',
    marqueeSoon: 'PREVIEW COMING SOON',
    marqueeTile: 'VISUAL EXPLORATION',
    aboutEyebrow: 'A LITTLE ABOUT THE STUDIO',
    aboutHeading: 'About us',
    aboutBody:
      "We're windwings, a visual design studio bringing ideas to live stages. From concert VJ and opening films to brand visuals, we turn sound, stories, and creative energy into memorable visuals. Made to move you. Made to stay with you.",
    aboutChinese: '风翮设计实验室 · 从舞台到影像，让创意成为难忘的现场。',
    servicesEyebrow: 'WHAT WE CAN DO TOGETHER',
    servicesRange: '01 — 05',
    servicesHeading: 'Services',
    projectsEyebrow: 'SELECTED WORK / SELECTED MOMENTS',
    projectsYears: '2025 — 2026',
    projectsHeading: 'Project',
    projectsAside: 'Some things are better\nseen than explained.',
    liveProject: 'Live Project',
    liveProjectAria: 'Live Project —',
    contactEyebrow: 'HAVE SOMETHING IN MIND?',
    contactHeading1: "Let's make",
    contactHeading2: 'a scene.',
    contactTagline: '下一个现场，一起创造。',
    contactStudio: '风翮设计实验室 / windwings',
    wechat: 'WECHAT',
    copyright: '© {year} windwings',
    footerTag: 'VISUALS WITH A LIFE OF THEIR OWN.',
    backToTop: 'BACK TO TOP ↑',
    dialogClose: 'Close project',
    dialogVideoFallback: 'Your browser does not support video.',
    dialogOpenVideo: 'Open project video',
    dialogPlaceholder: 'Case placeholder · formal live stills and film pending',
  },
  zh: {
    skipToContent: '跳至主要内容',
    brandAria: '风翮首页',
    brandSub: '风翮设计实验室',
    navAbout: '关于',
    navServices: '服务',
    navProjects: '作品',
    navContact: '联系',
    navAria: '主导航',
    openForCollabs: '开放合作',
    langSwitchAria: '切换语言',
    langEn: 'EN',
    langZh: '中文',
    heroAria: '你好，我们是风翮',
    heroLine1: '你好，我们是',
    heroLine2: '风翮',
    heroEyebrow: '独立视觉工作室',
    heroDescription: '为现场舞台、影像与品牌时刻打造视觉体验',
    contactCta: '聊聊合作',
    portraitAlt: '临时参考人像，待替换为风翮工作室照片',
    portraitCaption: '工作室人像 / 即将更新',
    scrollExplore: '向下探索',
    heroCoordinate: '创意能量。\n难忘视觉。',
    marqueeAria: '动态视觉参考',
    marqueeLeft: '始终在动。',
    marqueeRight: '视觉灵感 / 动态参考',
    marqueeSoon: '预览即将上线',
    marqueeTile: '视觉探索',
    aboutEyebrow: '关于工作室',
    aboutHeading: '关于我们',
    aboutBody:
      '我们是风翮，一家把想法带到现场舞台的视觉设计工作室。从演唱会 VJ、开场影像到品牌视觉，我们把声音、故事与创意能量，变成让人记住的画面。为了打动你，也为了留在你心里。',
    aboutChinese: '风翮设计实验室 · 从舞台到影像，让创意成为难忘的现场。',
    servicesEyebrow: '我们可以一起做的事',
    servicesRange: '01 — 05',
    servicesHeading: '服务',
    projectsEyebrow: '精选作品 / 精选瞬间',
    projectsYears: '2025 — 2026',
    projectsHeading: '作品',
    projectsAside: '有些事情，\n看一眼比解释更清楚。',
    liveProject: '查看作品',
    liveProjectAria: '查看作品 —',
    contactEyebrow: '有想法了吗？',
    contactHeading1: '一起做一场',
    contactHeading2: '难忘现场。',
    contactTagline: '下一个现场，一起创造。',
    contactStudio: '风翮设计实验室 / windwings',
    wechat: '微信',
    copyright: '© {year} 风翮 / windwings',
    footerTag: '有生命力的视觉。',
    backToTop: '回到顶部 ↑',
    dialogClose: '关闭项目',
    dialogVideoFallback: '您的浏览器不支持视频。',
    dialogOpenVideo: '打开作品视频',
    dialogPlaceholder: '案例占位 · 正式现场图片与影片待补充',
  },
} as const

export type MessageKey = keyof typeof messages.en

type I18nContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: MessageKey, vars?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

function readStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'zh' || stored === 'en') return stored
  } catch {
    /* ignore */
  }
  return 'en'
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() =>
    typeof window === 'undefined' ? 'en' : readStoredLocale(),
  )

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en'
    document.title = locale === 'zh' ? '风翮 — windwings' : 'windwings — 风翮'
  }, [locale])

  const t = useCallback(
    (key: MessageKey, vars?: Record<string, string | number>) => {
      let value: string = messages[locale][key] ?? messages.en[key]
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          value = value.replace(`{${k}}`, String(v))
        }
      }
      return value
    },
    [locale],
  )

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within LocaleProvider')
  return ctx
}
