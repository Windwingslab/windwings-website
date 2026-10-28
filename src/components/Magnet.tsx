import { useEffect, useRef, type ReactNode } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'

export function Magnet({ children, padding = 150, strength = 3, className }: {
  children: ReactNode; padding?: number; strength?: number; className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const targetX = useMotionValue(0)
  const targetY = useMotionValue(0)
  const x = useSpring(targetX, { stiffness: 100, damping: 20, mass: 0.5 })
  const y = useSpring(targetY, { stiffness: 100, damping: 20, mass: 0.5 })
  useEffect(() => {
    if (reducedMotion || !matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const reset = () => { targetX.set(0); targetY.set(0) }
    const move = (event: PointerEvent) => {
      const rect = ref.current?.getBoundingClientRect()
      if (!rect) return
      const dx = event.clientX - (rect.left + rect.width / 2)
      const dy = event.clientY - (rect.top + rect.height / 2)
      if (Math.abs(dx) < rect.width / 2 + padding && Math.abs(dy) < rect.height / 2 + padding) {
        targetX.set(dx / strength); targetY.set(dy / strength)
      } else reset()
    }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('blur', reset)
    document.addEventListener('pointerleave', reset)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('blur', reset)
      document.removeEventListener('pointerleave', reset)
    }
  }, [padding, strength, reducedMotion, targetX, targetY])
  return <div ref={ref} className={className}><motion.div style={{ x, y }}>{children}</motion.div></div>
}
