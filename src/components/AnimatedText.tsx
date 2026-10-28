import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion'

function Character({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.15, 1])
  const reducedMotion = useReducedMotion()
  return <motion.span style={{ opacity: reducedMotion ? 1 : opacity }}>{children}</motion.span>
}
export function AnimatedText({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.9', 'end 0.45'] })
  let index = 0
  return <p ref={ref} className="animated-text">
    <span className="sr-only">{text}</span>
    <span aria-hidden="true">{text.split(' ').map((word, wordIndex) => {
      const start = index
      index += word.length + 1
      return <span className="inline-block" key={wordIndex}>{[...word].map((character, characterIndex) => (
        <Character key={characterIndex} progress={scrollYProgress}
          range={[(start + characterIndex) / text.length, (start + characterIndex + 1) / text.length]}>{character}</Character>
      ))}{'\u00a0'}</span>
    })}</span>
  </p>
}
