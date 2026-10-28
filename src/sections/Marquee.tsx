import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import { AssetImage } from '../components/AssetImage'
import { marqueeImages } from '../data'

function MarqueeTile({ src, index, reducedMotion }: { src: string; index: number; reducedMotion: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '200px' })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  // Only decode visible GIF tiles; reduced-motion users receive still, same-size tiles.
  return <div ref={ref} className="marquee-tile h-[270px] w-[420px] shrink-0 overflow-hidden rounded-2xl">
    {visible && !reducedMotion && !src.includes('hero-celestia')
      ? <AssetImage src={src} alt="" width={420} height={270} decoding="async" className="h-full w-full object-cover" />
      : <div className="asset-fallback h-full w-full"><span>{src.includes('hero-celestia') ? 'PREVIEW COMING SOON' : `VISUAL EXPLORATION ${String(index + 1).padStart(2, '0')}`}</span></div>}
  </div>
}

export function Marquee() {
  const ref = useRef<HTMLElement>(null)
  const scroll = useMotionValue(0)
  const reducedMotion = useReducedMotion()
  const firstX = useTransform(scroll, [0, 1800], [-900, 0], { clamp: false })
  const secondX = useTransform(scroll, [0, 1800], [-150, -1050], { clamp: false })
  useEffect(() => {
    if (reducedMotion) return
    let frame = 0
    const update = () => {
      frame = 0
      if (ref.current) scroll.set(window.innerHeight - ref.current.getBoundingClientRect().top)
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(frame) }
  }, [scroll, reducedMotion])
  return <section id="marquee" ref={ref} className="marquee overflow-hidden" aria-label="Motion inspiration — 动态视觉参考">
    <div className="marquee-label eyebrow"><span>IN MOTION, ALWAYS.</span><span>VISUAL INSPIRATION / MOTIONSITES</span></div>
    <div aria-hidden="true" className="flex flex-col gap-3">
      <motion.div className="flex w-max gap-3" style={{ x: reducedMotion ? -500 : firstX }}>
        {marqueeImages.slice(0, 11).map((src, index) => <MarqueeTile key={src} src={src} index={index} reducedMotion={!!reducedMotion} />)}
      </motion.div>
      <motion.div className="flex w-max gap-3" style={{ x: reducedMotion ? -150 : secondX }}>
        {marqueeImages.slice(11).map((src, index) => <MarqueeTile key={src} src={src} index={index + 11} reducedMotion={!!reducedMotion} />)}
      </motion.div>
    </div>
  </section>
}
