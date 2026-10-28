import { ArrowDown, ArrowUpRight, Asterisk } from 'lucide-react'
import { FadeIn } from '../components/FadeIn'
import { Magnet } from '../components/Magnet'
import { ContactButton } from '../components/Buttons'
import { AssetImage } from '../components/AssetImage'
import { portrait } from '../data'

export function Hero() {
  return <section id="home" className="hero relative h-screen text-silver">
    <header className="hero-nav flex items-center justify-between">
      <a href="#home" className="brand" aria-label="WINDWINGS 首页"><Asterisk size={30} strokeWidth={1.4} aria-hidden="true" /><span>windwings<small>风翮设计实验室</small></span></a>
      <nav aria-label="Main navigation" className="flex uppercase tracking-wider">
        {['About', 'Services', 'Projects', 'Contact'].map(item => <a key={item} href={`#${item.toLowerCase()}`}>{item}</a>)}
      </nav>
      <a href="#contact" className="nav-availability"><span />OPEN FOR COLLABS<ArrowUpRight size={15} aria-hidden="true" /></a>
    </header>
    <div className="hero-title-wrap">
      <FadeIn duration={1.1}>
        <h1 className="hero-heading uppercase" aria-label="Hi, we're windwings"><span>Hi, we’re</span><span>windwings</span></h1>
      </FadeIn>
    </div>
    <FadeIn className="hero-description" delay={0.25}>
      <span className="eyebrow">INDEPENDENT VISUAL STUDIO</span>
      <p>a visual studio crafting live stages, films, and brand moments</p>
      <ContactButton />
    </FadeIn>
    <Magnet padding={150} strength={3} className="hero-portrait absolute">
      <figure>
        <AssetImage src={portrait} alt="临时参考人像，待替换为风翮工作室照片" width={620} height={740} fetchPriority="high" className="portrait-image" />
        <figcaption className="portrait-caption">STUDIO PORTRAIT / COMING SOON</figcaption>
      </figure>
    </Magnet>
    <a href="#marquee" className="hero-scroll uppercase tracking-wider"><span>SCROLL TO EXPLORE</span><ArrowDown size={20} strokeWidth={1.5} aria-hidden="true" /></a>
    <span className="hero-coordinate">CREATIVE ENERGY.<br />MEMORABLE VISUALS.</span>
  </section>
}
