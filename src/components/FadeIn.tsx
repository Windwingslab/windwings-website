import { forwardRef, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const FadeContainer = forwardRef<HTMLDivElement, { children?: ReactNode; className?: string }>(
  function FadeContainer(props, ref) { return <div ref={ref} {...props} /> },
)
const MotionContainer = motion.create(FadeContainer)

export function FadeIn({ children, className, delay = 0, duration = 0.8 }: {
  children: ReactNode; className?: string; delay?: number; duration?: number
}) {
  const reducedMotion = useReducedMotion()
  return <MotionContainer className={className}
    initial={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 40 }}
    whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: reducedMotion ? 0 : duration, delay: reducedMotion ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}>
    {children}
  </MotionContainer>
}
