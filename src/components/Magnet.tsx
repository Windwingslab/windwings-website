import { useEffect, useRef, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export function Magnet({ children, padding = 150, strength = 3, className }: {
  children: ReactNode; padding?: number; strength?: number; className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const targetX = useMotionValue(0)
  const targetY = useMotionValue(0)
  const x = useSpring(targetX, { stiffness: 100, damping: 20, mass: 0.5 })
  const y = useSpring(targetY, { stiffness: 100, damping: 20, mass: 0.5 })
  useEffect(() => {
    const motionPreference = matchMedia('(prefers-reduced-motion: reduce)')
    const pointerPreference = matchMedia('(hover: hover) and (pointer: fine)')
    let enabled = false
    const reset = () => { targetX.set(0); targetY.set(0) }
    const updatePreferences = () => {
      enabled = !motionPreference.matches && pointerPreference.matches
      if (!enabled) {
        reset()
        // A preference change must stop movement immediately, including spring momentum.
        x.jump(0); y.jump(0)
      }
    }
    updatePreferences()
    const move = (event: PointerEvent) => {
      if (!enabled) return
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
    motionPreference.addEventListener('change', updatePreferences)
    pointerPreference.addEventListener('change', updatePreferences)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('blur', reset)
      document.removeEventListener('pointerleave', reset)
      motionPreference.removeEventListener('change', updatePreferences)
      pointerPreference.removeEventListener('change', updatePreferences)
      reset()
    }
  }, [padding, strength, targetX, targetY, x, y])
  return <div ref={ref} className={className}><motion.div style={{ x, y }}>{children}</motion.div></div>
}
