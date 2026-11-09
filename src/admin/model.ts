import type { ProjectRecord, ProjectsFile } from '../data'

export const MEDIA_SLOTS = [
  { key: 'cover', label: '封面 cover.jpg', filename: 'cover.jpg', accept: 'image/jpeg,.jpg,.jpeg' },
  { key: 'live', label: '现场 live-cover.jpg', filename: 'live-cover.jpg', accept: 'image/jpeg,.jpg,.jpeg' },
  { key: 'film', label: '影片 film.mp4', filename: 'film.mp4', accept: 'video/mp4,.mp4' },
] as const
export type Uploads = Partial<Record<(typeof MEDIA_SLOTS)[number]['key'], File | null>>
export const BROWSER_UPLOAD_LIMIT = 40 * 1024 * 1024

export function validateUpload(key: string, file: Pick<File, 'size' | 'type' | 'name'>) {
  if (!file.size) throw new Error(`${file.name} 是空文件。`)
  if (file.size > BROWSER_UPLOAD_LIMIT) throw new Error(`${file.name} 超过网页上传上限 40MB。请放到 staging/works/<id>/，运行 node scripts/publish-works.mjs <id>。`)
  if (key === 'film') {
    if (!/\.mp4$/i.test(file.name) || file.type && file.type !== 'video/mp4') throw new Error('影片只接受 MP4。请先转为 H.264/AAC MP4，不要直接改扩展名。')
  } else if (!/\.jpe?g$/i.test(file.name) || file.type && file.type !== 'image/jpeg') {
    throw new Error('图片只接受 JPEG（.jpg / .jpeg）。请先导出 JPEG，不要直接改扩展名。')
  }
}

export function emptyProject(id = ''): ProjectRecord {
  return { id, title: '', english: '', category: '', description: '', placeholder: true,
    images: Array.from({ length: 3 }, () => ({ src: '', alt: '' })) }
}

export function parseProjects(content: string): ProjectsFile {
  const parsed = JSON.parse(content) as ProjectsFile
  if (!parsed || !Array.isArray(parsed.projects)) throw new Error('作品 JSON 格式错误：缺少 projects 列表。')
  const ids = new Set<string>()
  for (const project of parsed.projects) {
    if (!project || typeof project.id !== 'string' || !Array.isArray(project.images) ||
      !['title', 'english', 'category', 'description'].every(key => typeof project[key as keyof ProjectRecord] === 'string')) {
      throw new Error('作品 JSON 格式错误：请检查 id、文案和 images。')
    }
    if (ids.has(project.id)) throw new Error(`作品 JSON 中 id 重复：${project.id}`)
    ids.add(project.id)
    if (project.images.some(image => !image || typeof image.src !== 'string' || typeof image.alt !== 'string')) {
      throw new Error(`作品 ${project.id} 的 images 格式错误。`)
    }
  }
  return parsed
}

export function prepareProject(draft: ProjectRecord, file: ProjectsFile, selectedId: string, uploads: Uploads): ProjectRecord {
  const next = structuredClone(draft)
  for (const key of ['id', 'title', 'english', 'category', 'description'] as const) {
    next[key] = next[key].trim()
    if (!next[key]) throw new Error(`${key} 不能为空或只有空格。`)
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(next.id)) throw new Error('id 仅允许小写字母、数字，单个连字符连接。')
  if (selectedId && next.id !== selectedId) throw new Error('已有作品 id 不能修改；请新增作品以使用新文件夹。')
  if (file.projects.some(project => project.id === next.id && project.id !== selectedId)) throw new Error(`id「${next.id}」已存在，请换一个 id。`)
  for (const slot of MEDIA_SLOTS) {
    const upload = uploads[slot.key]
    if (upload) validateUpload(slot.key, upload)
  }
  next.images = next.images.slice(0, 3)
  while (next.images.length < 3) next.images.push({ src: '', alt: '' })
  if (uploads.cover) next.images[1].src = `works/${next.id}/cover.jpg`
  if (uploads.live) next.images[0].src = `works/${next.id}/live-cover.jpg`
  const fallback = uploads.cover ? `works/${next.id}/cover.jpg` : next.images.find(image => image.src.trim())?.src
  next.images = next.images.map(image => ({ ...image, src: image.src.trim() || fallback || '', alt: image.alt.trim() || next.title }))
  if (uploads.film) next.film = `works/${next.id}/film.mp4`
  if (next.film) next.film = next.film.trim() || undefined
  const imagePath = /^works\/[a-z0-9]+(?:-[a-z0-9]+)*\/[a-zA-Z0-9][a-zA-Z0-9_-]*\.(?:jpe?g|png|webp)$/i
  if (next.images.some(image => !imagePath.test(image.src))) throw new Error('三张图片都需要有效的 works/<id>/图片.jpg 路径，或先选择封面文件。')
  if (next.film && !/^works\/[a-z0-9]+(?:-[a-z0-9]+)*\/[a-zA-Z0-9][a-zA-Z0-9_-]*\.mp4$/i.test(next.film)) throw new Error('影片路径须为 works/<id>/film.mp4。')
  return next
}
