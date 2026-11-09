import references from './reference-assets.json'
import projectsFile from '../content/projects.json'

export const email = 'Jp404685320@gmail.com'
export const assetUrl = (name: string) => `${import.meta.env.BASE_URL}${name.replace(/^\//, '')}`
const referenceUrl = (entry: (typeof references)[number]) => (entry.local ? assetUrl(entry.file) : entry.url)
export const marqueeImages = references.filter(entry => entry.url.endsWith('.gif')).map(referenceUrl)
export const decorations = references.filter(entry => entry.url.endsWith('.png') && !entry.url.includes('Rectangle')).map(referenceUrl)
// TODO: Replace the user-requested reference portrait with a WINDWINGS studio photo.
// Original: https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png
export const portrait = referenceUrl(references.find(entry => entry.url.includes('Rectangle'))!)

export const services = [
  { title: 'Live Visuals', label: '现场视觉', description: '从舞台概念到屏幕语言，为演唱会与现场演出创造有记忆点的视觉体验。', tags: 'ART DIRECTION / CONCERT VISUALS' },
  { title: 'Stage VJ', label: '舞台 VJ', description: '跟随音乐的节奏、情绪与表演，让动态画面和舞台上的每一刻共同发生。', tags: 'MUSIC-DRIVEN / VISUAL LOOPS' },
  { title: 'Motion & Opening Films', label: '动态设计与开场影像', description: '用三维、动态图形与叙事设计铺陈气氛，让开场的第一束光成为观众的第一段记忆。', tags: '3D MOTION / OPENING SEQUENCES' },
  { title: 'Branding', label: '品牌视觉', description: '将品牌个性转化为鲜明的视觉语言，从主视觉到动态识别，让每一次出现都保持辨识度。', tags: 'VISUAL IDENTITY / KEY VISUALS' },
  { title: 'Commercial Films', label: '商业影像', description: '为品牌宣传、产品发布与游戏内容制作创意影像，让想法成为可感知、可传播的画面。', tags: 'BRAND FILMS / CAMPAIGNS' },
]

export interface ProjectImage {
  src: string
  alt: string
  position?: string
  caption?: string
}

export interface Project {
  id: string
  title: string
  english: string
  category: string
  description: string
  images: [ProjectImage, ProjectImage, ProjectImage]
  film?: string
  placeholder?: boolean
}

export interface ProjectRecord {
  id: string
  title: string
  english: string
  category: string
  description: string
  images: ProjectImage[]
  film?: string
  placeholder?: boolean
}

export interface ProjectsFile {
  projects: ProjectRecord[]
}

function resolveMedia(path?: string) {
  if (!path) return undefined
  if (/^https?:\/\//i.test(path) || path.startsWith('data:')) return path
  return assetUrl(path)
}

function hydrateProject(record: ProjectRecord): Project {
  const images = record.images.slice(0, 3).map(image => ({
    ...image,
    src: resolveMedia(image.src)!,
  }))
  while (images.length < 3) {
    images.push({
      src: images[0]?.src ?? assetUrl('favicon.svg'),
      alt: record.title,
    })
  }
  return {
    id: record.id,
    title: record.title,
    english: record.english,
    category: record.category,
    description: record.description,
    placeholder: record.placeholder,
    film: resolveMedia(record.film),
    images: images as [ProjectImage, ProjectImage, ProjectImage],
  }
}

export const projectsContent = projectsFile as ProjectsFile
export const projects: Project[] = projectsContent.projects.map(hydrateProject)
