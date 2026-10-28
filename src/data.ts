import cover from '../作品素材/xuliang-special-appearance/cover.jpg'
import live from '../作品素材/xuliang-special-appearance/live-cover.jpg'
import film from '../作品素材/xuliang-special-appearance/film.mp4'
import enCover from '../作品素材/en-opening/cover.jpg'
import enFilm from '../作品素材/en-opening/film.mp4'
import references from './reference-assets.json'

export const email = 'Jp404685320@gmail.com'
export const assetUrl = (name: string) => `${import.meta.env.BASE_URL}${name}`
const referenceUrl = (entry: (typeof references)[number]) => entry.local ? assetUrl(entry.file) : entry.url
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

export interface ProjectImage { src: string; alt: string; position?: string; caption?: string }
export interface Project {
  id: string; title: string; english: string; category: string; description: string
  images: [ProjectImage, ProjectImage, ProjectImage]
  film?: string; placeholder?: boolean
}

export const projects: Project[] = [
  {
    id: 'xuliang-special-appearance', title: '徐良《友情出演》VJ', english: 'SPECIAL APPEARANCE', category: 'Live Visual / Stage VJ',
    description: '粉色立体字、磁带与唱盘交织成复古音乐世界。让歌曲的情绪，延伸到舞台的每一块屏幕。', film,
    images: [
      { src: live, alt: '徐良《友情出演》演唱会现场大屏', position: 'center' },
      { src: cover, alt: '友情出演粉色三维文字与音乐元素主视觉', position: '28% center' },
      // TODO: Replace this reused crop with a third original project still.
      { src: cover, alt: '友情出演主视觉右侧细节裁切', position: '82% center', caption: '主视觉局部 · 同图裁切' },
    ],
  },
  {
    id: 'xuliang-concert', title: '徐良演唱会', english: 'XULIANG LIVE', category: 'Live Visual · 案例待更新', placeholder: true,
    description: '广州站正式现场素材整理中。当前画面借用《友情出演》案例作版式预览，后续替换为本项目完整记录。',
    // TODO: Replace all three borrowed images with the concert's own photos.
    images: [
      { src: live, alt: '徐良演唱会占位图，借用友情出演现场照片', position: '60% center', caption: '素材待更新 · 借用《友情出演》现场图' },
      { src: cover, alt: '演唱会占位主视觉，借用友情出演画面', position: '15% center' },
      { src: live, alt: '演唱会占位细节，借用友情出演现场照片裁切', position: '80% center', caption: '借用图局部 · 非本案例正式素材' },
    ],
  },
  {
    id: 'en-opening', title: 'EN 开场影像', english: 'INTO THE LIGHT', category: 'Opening Film / Live Visual',
    description: '以海面、光束与空间尺度展开开场叙事。让流动的光引导视线，让现场从第一秒进入情境。', film: enFilm,
    // TODO: Replace the two detail crops with distinct EN production/live stills.
    images: [
      { src: enCover, alt: 'EN 开场影像，暗色海面与远方垂直光束' },
      { src: enCover, alt: 'EN 开场影像光束细节裁切', position: '60% 30%', caption: '光束细节 · 同图裁切' },
      { src: enCover, alt: 'EN 开场影像海面细节裁切', position: '35% 80%', caption: '海面细节 · 同图裁切' },
    ],
  },
]
