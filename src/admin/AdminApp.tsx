import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { ProjectRecord, ProjectsFile } from '../data'
import {
  decodeBase64Utf8,
  getFile,
  getStoredPat,
  putBinaryFile,
  putTextFile,
  setStoredPat,
  verifyToken,
  OWNER,
  REPO,
} from './github'

const SITE = 'https://windwingslab.github.io/windwings-website/'
const MEDIA_SLOTS = [
  { key: 'cover', label: '封面 cover.jpg', filename: 'cover.jpg', accept: 'image/jpeg,image/png,image/webp' },
  { key: 'live', label: '现场 live-cover.jpg', filename: 'live-cover.jpg', accept: 'image/jpeg,image/png,image/webp' },
  { key: 'film', label: '影片 film.mp4', filename: 'film.mp4', accept: 'video/mp4,video/webm' },
] as const

function emptyProject(id = ''): ProjectRecord {
  return {
    id,
    title: '',
    english: '',
    category: '',
    description: '',
    placeholder: false,
    images: [
      { src: id ? `works/${id}/live-cover.jpg` : '', alt: '' },
      { src: id ? `works/${id}/cover.jpg` : '', alt: '' },
      { src: id ? `works/${id}/cover.jpg` : '', alt: '' },
    ],
  }
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/[\u4e00-\u9fff]/g, '')
    .replace(/-+/g, '-')
    || `project-${Date.now()}`
}

export default function AdminApp() {
  const [pat, setPat] = useState(getStoredPat())
  const [login, setLogin] = useState('')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [file, setFile] = useState<ProjectsFile>({ projects: [] })
  const [selectedId, setSelectedId] = useState('')
  const [draft, setDraft] = useState<ProjectRecord>(emptyProject())
  const [uploads, setUploads] = useState<Record<string, File | null>>({ cover: null, live: null, film: null })

  const selected = useMemo(
    () => file.projects.find(project => project.id === selectedId) || null,
    [file.projects, selectedId],
  )

  useEffect(() => {
    if (!selected) return
    setDraft(structuredClone(selected))
    setUploads({ cover: null, live: null, film: null })
  }, [selected])

  async function connect(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setStatus('校验 PAT…')
    try {
      const user = await verifyToken(pat.trim())
      setStoredPat(pat.trim())
      setLogin(user)
      setStatus(`已登录 GitHub：${user}，读取 content/projects.json…`)
      const ghFile = await getFile('content/projects.json', pat.trim())
      const parsed = JSON.parse(decodeBase64Utf8(ghFile.content)) as ProjectsFile
      setFile(parsed)
      setSelectedId(parsed.projects[0]?.id || '')
      setStatus('已加载作品列表。保存会直接提交到 main，约 1–2 分钟后线上更新。')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setStatus('')
    } finally {
      setBusy(false)
    }
  }

  function logout() {
    setStoredPat('')
    setPat('')
    setLogin('')
    setFile({ projects: [] })
    setSelectedId('')
    setStatus('已退出，本页 sessionStorage 中的 PAT 已清除。')
  }

  function updateDraft<K extends keyof ProjectRecord>(key: K, value: ProjectRecord[K]) {
    setDraft(prev => ({ ...prev, [key]: value }))
  }

  function updateImage(index: number, key: 'alt' | 'position' | 'caption' | 'src', value: string) {
    setDraft(prev => {
      const images = prev.images.map((image, i) => (i === index ? { ...image, [key]: value || undefined } : image))
      return { ...prev, images }
    })
  }

  function startNew() {
    const id = `work-${Date.now().toString(36)}`
    const project = emptyProject(id)
    project.title = '新作品'
    project.english = 'NEW WORK'
    project.category = 'Live Visual'
    project.description = '请填写简介，并上传封面 / 现场图 / 影片。'
    project.placeholder = true
    setFile(prev => ({ projects: [...prev.projects, project] }))
    setSelectedId(id)
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    if (!login) return
    const token = getStoredPat()
    if (!token) {
      setError('请先登录')
      return
    }
    if (!draft.id.trim()) {
      setError('项目 id 不能为空')
      return
    }
    if (!/^[a-z0-9][a-z0-9-]*$/.test(draft.id)) {
      setError('id 仅允许小写字母、数字、连字符')
      return
    }

    setBusy(true)
    setError('')
    setStatus('开始保存…')
    try {
      const nextDraft: ProjectRecord = structuredClone(draft)
      nextDraft.images = nextDraft.images.slice(0, 3)
      while (nextDraft.images.length < 3) {
        nextDraft.images.push({ src: `works/${nextDraft.id}/cover.jpg`, alt: nextDraft.title })
      }

      // Ensure default paths when uploading into this project's folder
      if (uploads.cover) nextDraft.images[1] = { ...nextDraft.images[1], src: `works/${nextDraft.id}/cover.jpg` }
      if (uploads.live) nextDraft.images[0] = { ...nextDraft.images[0], src: `works/${nextDraft.id}/live-cover.jpg` }
      if (uploads.film) nextDraft.film = `works/${nextDraft.id}/film.mp4`

      for (const slot of MEDIA_SLOTS) {
        const fileUpload = uploads[slot.key]
        if (!fileUpload) continue
        const path = `public/works/${nextDraft.id}/${slot.filename}`
        const mb = fileUpload.size / (1024 * 1024)
        setStatus(`上传 ${slot.filename}（${mb.toFixed(1)} MB）…`)
        if (mb > 90) throw new Error(`${slot.filename} 超过 90MB，请压缩后重试，或用本机脚本 scripts/publish-works.mjs`)
        await putBinaryFile(path, fileUpload, `admin: upload ${path}`, token)
      }

      const nextProjects = file.projects.map(project => (project.id === selectedId ? nextDraft : project))
      if (!file.projects.some(project => project.id === selectedId)) nextProjects.push(nextDraft)
      // If id renamed, replace old id entry
      const deduped = nextProjects.filter((project, index, arr) => arr.findIndex(item => item.id === project.id) === index)
      const nextFile: ProjectsFile = { projects: deduped }

      setStatus('写入 content/projects.json…')
      const current = await getFile('content/projects.json', token)
      await putTextFile(
        'content/projects.json',
        `${JSON.stringify(nextFile, null, 2)}\n`,
        `admin: update project ${nextDraft.id}`,
        token,
        current.sha,
      )

      setFile(nextFile)
      setSelectedId(nextDraft.id)
      setUploads({ cover: null, live: null, film: null })
      setStatus(`已提交。GitHub Actions 部署约 1–2 分钟后生效：${SITE}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="eyebrow">WINDWINGS · 鹏哥作品后台</p>
          <h1>作品上传 / 替换</h1>
        </div>
        <div className="admin-header-actions">
          <a href={SITE} target="_blank" rel="noreferrer">
            打开官网
          </a>
          {login ? (
            <button type="button" onClick={logout}>
              退出 {login}
            </button>
          ) : null}
        </div>
      </header>

      {!login ? (
        <form className="admin-card" onSubmit={connect}>
          <h2>登录（Fine-grained PAT）</h2>
          <p>
            在 GitHub 创建仅限仓库 <code>{OWNER}/{REPO}</code> 的 fine-grained token，勾选 Contents: Read and write。
            PAT 只存在本页 sessionStorage，关闭标签页即清除。不要把 PAT 发到聊天。
          </p>
          <label>
            Personal Access Token
            <input
              type="password"
              value={pat}
              onChange={event => setPat(event.target.value)}
              placeholder="github_pat_…"
              autoComplete="off"
              required
            />
          </label>
          <button type="submit" disabled={busy || !pat.trim()}>
            {busy ? '连接中…' : '连接仓库'}
          </button>
        </form>
      ) : (
        <div className="admin-layout">
          <aside className="admin-card admin-list">
            <div className="admin-list-head">
              <h2>作品（{file.projects.length}）</h2>
              <button type="button" onClick={startNew} disabled={busy}>
                新增
              </button>
            </div>
            <ul>
              {file.projects.map(project => (
                <li key={project.id}>
                  <button
                    type="button"
                    className={project.id === selectedId ? 'active' : ''}
                    onClick={() => setSelectedId(project.id)}
                  >
                    <strong>{project.title}</strong>
                    <span>{project.id}</span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <form className="admin-card admin-editor" onSubmit={save}>
            <h2>编辑 {draft.title || draft.id}</h2>
            <div className="admin-grid">
              <label>
                id（文件夹名）
                <input
                  value={draft.id}
                  onChange={event => updateDraft('id', slugify(event.target.value).replace(/^-|-$/g, '') || draft.id)}
                  required
                />
              </label>
              <label>
                标题
                <input value={draft.title} onChange={event => updateDraft('title', event.target.value)} required />
              </label>
              <label>
                英文
                <input value={draft.english} onChange={event => updateDraft('english', event.target.value)} required />
              </label>
              <label>
                分类
                <input value={draft.category} onChange={event => updateDraft('category', event.target.value)} required />
              </label>
            </div>
            <label>
              简介
              <textarea
                rows={4}
                value={draft.description}
                onChange={event => updateDraft('description', event.target.value)}
                required
              />
            </label>
            <label className="admin-check">
              <input
                type="checkbox"
                checked={Boolean(draft.placeholder)}
                onChange={event => updateDraft('placeholder', event.target.checked)}
              />
              占位案例（显示「素材待更新」提示）
            </label>

            <h3>三张图文案</h3>
            {draft.images.slice(0, 3).map((image, index) => (
              <div className="admin-image-row" key={index}>
                <span>图 {index + 1}</span>
                <input
                  value={image.src}
                  onChange={event => updateImage(index, 'src', event.target.value)}
                  placeholder="works/…/cover.jpg"
                />
                <input
                  value={image.alt}
                  onChange={event => updateImage(index, 'alt', event.target.value)}
                  placeholder="alt"
                />
                <input
                  value={image.position || ''}
                  onChange={event => updateImage(index, 'position', event.target.value)}
                  placeholder="object-position"
                />
                <input
                  value={image.caption || ''}
                  onChange={event => updateImage(index, 'caption', event.target.value)}
                  placeholder="caption（可空）"
                />
              </div>
            ))}

            <label>
              影片路径 film（可空）
              <input
                value={draft.film || ''}
                onChange={event => updateDraft('film', event.target.value || undefined)}
                placeholder="works/…/film.mp4"
              />
            </label>

            <h3>上传 / 替换素材</h3>
            <p className="admin-hint">
              选了文件并点保存后，会写入 <code>public/works/{'{id}'}/</code>，并更新 JSON。大视频建议 &lt; 40MB；超过
              90MB 请用本机脚本。客户素材上线前务必确认可公开。
            </p>
            <div className="admin-uploads">
              {MEDIA_SLOTS.map(slot => (
                <label key={slot.key}>
                  {slot.label}
                  <input
                    type="file"
                    accept={slot.accept}
                    onChange={event =>
                      setUploads(prev => ({ ...prev, [slot.key]: event.target.files?.[0] || null }))
                    }
                  />
                  <span>{uploads[slot.key]?.name || '未选择'}</span>
                </label>
              ))}
            </div>

            <div className="admin-actions">
              <button type="submit" disabled={busy}>
                {busy ? '提交中…' : '保存并推送到 main'}
              </button>
            </div>
          </form>
        </div>
      )}

      {(status || error) && (
        <div className={`admin-toast ${error ? 'is-error' : ''}`}>
          {error ? error : status}
        </div>
      )}
    </div>
  )
}
