import { AnimatedText } from '../components/AnimatedText'
import { FadeIn } from '../components/FadeIn'
import { AssetImage } from '../components/AssetImage'
import { ContactButton } from '../components/Buttons'
import { decorations } from '../data'

export function About() {
  return <section id="about" className="about relative flex min-h-screen items-center justify-center text-silver">
    {decorations.map((src, index) => <AssetImage key={src} src={src} alt="" loading="lazy" decoding="async" className={`about-deco about-deco-${index + 1}`} />)}
    <div className="about-content relative z-10 text-center">
      <FadeIn><span className="eyebrow">A LITTLE ABOUT THE STUDIO</span><h2 className="section-heading">About us</h2></FadeIn>
      <AnimatedText text="We’re windwings, a visual design studio bringing ideas to live stages. From concert VJ and opening films to brand visuals, we turn sound, stories, and creative energy into memorable visuals. Made to move you. Made to stay with you." />
      <FadeIn delay={0.1}>
        <p className="about-chinese">风翮设计实验室 · 从舞台到影像，让创意成为难忘的现场。</p>
        <ContactButton />
      </FadeIn>
    </div>
  </section>
}
