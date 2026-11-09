import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { ProjectRecord, ProjectsFile } from '../data'
import { emptyProject, MEDIA_SLOTS, parseProjects, prepareProject, validateUpload, type Uploads } from './model'
import { commitFiles, decodeBase64Utf8, fileToBase64, getFile, getMainHead, getStoredPat, setStoredPat, verifyToken, OWNER, REPO, type CommitFile } from './github'

const SITE = 'https://windwingslab.github.io/windwings-website/'

function editable(project?: ProjectRecord): ProjectRecord {
  if (!project) return emptyProject()
  const draft = structuredClone(project)
  while (draft.images.length < 3) draft.images.push({ src: '', alt: '' })
  return draft
}

export default function AdminApp() {
  const [pat, setPat] = useState(getStoredPat)
  const [login, setLogin] = useState('')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [file, setFile] = useState<ProjectsFile>({ projects: [] })
  const [contentSha, setContentSha] = useState('')
  const [headSha, setHeadSha] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [draft, setDraft] = useState<ProjectRecord>(emptyProject)
  const [uploads, setUploads] = useState<Uploads>({})
  const [uploadRevision, setUploadRevision] = useState(0)
  const selected = useMemo(() => file.projects.find(project => project.id === selectedId), [file, selectedId])
  const dirty = Boolean(login && (!selected || JSON.stringify(draft) !== JSON.stringify(editable(selected)) || Object.values(uploads).some(Boolean)))

  useEffect(() => {
    if (!dirty) return
    const guard = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', guard)
    return () => window.removeEventListener('beforeunload', guard)
  }, [dirty])

  function resetUploads() { setUploads({}); setUploadRevision(value => value + 1) }
  function showProject(project?: ProjectRecord) {
    setSelectedId(project?.id || '')
    setDraft(editable(project))
    resetUploads()
  }
  function allowDiscard() { return !dirty || window.confirm('当前文案或选中的文件尚未保存，确定放弃这些更改吗？') }

  async function load(token: string) {
    const head = await getMainHead(token)
    const remote = await getFile('content/projects.json', token, head)
    const parsed = parseProjects(decodeBase64Utf8(remote.content))
    setFile(parsed)
    setContentSha(remote.sha); setHeadSha(head)
    showProject(parsed.projects.find(project => project.id === selectedId) || parsed.projects[0])
  }

  async function connect(event: FormEvent) {
    event.preventDefault()
    setBusy(true); setError(''); setStatus('校验 PAT…')
    try {
      const token = pat.trim()
      const user = await verifyToken(token)
      // Establish the session only after both the repository data and storage are usable.
      const head = await getMainHead(token)
      const remote = await getFile('content/projects.json', token, head)
      const parsed = parseProjects(decodeBase64Utf8(remote.content))
      setStoredPat(token)
      setFile(parsed); setContentSha(remote.sha); setHeadSha(head); showProject(parsed.projects[0]); setLogin(user); setPat('')
      setStatus('已加载作品列表。保存会提交到 main，部署完成后官网更新。')
    } catch (err) {
      setStoredPat(''); setLogin(''); setStatus('')
      setError(err instanceof Error ? err.message : String(err))
    } finally { setBusy(false) }
  }

  function logout() {
    if (!allowDiscard()) return
    setStoredPat(''); setPat(''); setLogin(''); setFile({ projects: [] }); setContentSha(''); setHeadSha('')
    showProject(); setError(''); setStatus('已退出，会话中的 PAT 已清除。')
  }

  async function reload() {
    if (!allowDiscard()) return
    setBusy(true); setError(''); setStatus('重新加载作品列表…')
    try { await load(getStoredPat()); setStatus('已加载最新作品列表。') }
    catch (err) { setStatus(''); setError(err instanceof Error ? err.message : String(err)) }
    finally { setBusy(false) }
  }

  function updateDraft<K extends keyof ProjectRecord>(key: K, value: ProjectRecord[K]) {
    setDraft(prev => ({ ...prev, [key]: value }))
  }
  function updateImage(index: number, key: 'alt' | 'position' | 'caption' | 'src', value: string) {
    setDraft(prev => ({ ...prev, images: prev.images.map((image, i) => i === index ? { ...image, [key]: value } : image) }))
  }
  function startNew() {
    if (!allowDiscard()) return
    showProject(); setDraft(emptyProject(`work-${Date.now().toString(36)}`)); setError(''); setStatus('填写新作品并选择封面；保存前不会创建远程文件。')
  }
  function selectProject(project: ProjectRecord) {
    if (project.id === selectedId || !allowDiscard()) return
    showProject(project); setError(''); setStatus('')
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    if (!login || busy) return
    const token = getStoredPat()
    if (!token) { setError('会话已失效，请退出后重新连接。'); return }
    setBusy(true); setError(''); setStatus('校验作品和素材…')
    try {
      const nextDraft = prepareProject(draft, file, selectedId, uploads)
      const nextFile = { ...file, projects: selectedId
        ? file.projects.map(project => project.id === selectedId ? nextDraft : project)
        : [...file.projects, nextDraft] }
      const changes: CommitFile[] = [{ path: 'content/projects.json', content: `${JSON.stringify(nextFile, null, 2)}\n`, encoding: 'utf-8' }]
      const pendingPaths = new Set<string>()
      // Validate every file before staging any Git blob; extensions must match real bytes.
      for (const slot of MEDIA_SLOTS) {
        const upload = uploads[slot.key]
        if (!upload) continue
        const bytes = new Uint8Array(await upload.slice(0, 12).arrayBuffer())
        const valid = slot.key === 'film'
          ? String.fromCharCode(...bytes.slice(4, 8)) === 'ftyp'
          : bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
        if (!valid) throw new Error(`${upload.name} 的内容不是${slot.key === 'film' ? 'MP4' : 'JPEG'}，请转换格式后重试。`)
        pendingPaths.add(`public/works/${nextDraft.id}/${slot.filename}`)
      }
      const paths = new Set([...nextDraft.images.map(image => `public/${image.src}`), ...(nextDraft.film ? [`public/${nextDraft.film}`] : [])])
      for (const path of paths) {
        if (!pendingPaths.has(path)) {
          try { await getFile(path, token) } catch (err) {
            throw new Error(`无法确认素材 ${path}，请检查路径或先上传文件。${err instanceof Error ? err.message : ''}`)
          }
        }
      }
      for (const slot of MEDIA_SLOTS) {
        const upload = uploads[slot.key]
        if (!upload) continue
        setStatus(`准备 ${slot.filename}（${(upload.size / 1024 / 1024).toFixed(1)} MB）…`)
        changes.push({ path: `public/works/${nextDraft.id}/${slot.filename}`, content: await fileToBase64(upload), encoding: 'base64' })
      }
      setStatus('合并提交文案与素材，请勿关闭本页…')
      const sha = await commitFiles(changes, `admin: update project ${nextDraft.id}`, token, contentSha, headSha, selectedId ? undefined : nextDraft.id)
      setHeadSha(sha); setFile(nextFile); setSelectedId(nextDraft.id); setDraft(nextDraft); resetUploads()
      setStatus(`已提交 ${sha.slice(0, 7)}。GitHub Actions 部署通常约 1–2 分钟。`)
      // Refresh only the saved content SHA; keep drafts usable if this read is interrupted.
      try {
        const saved = await getFile('content/projects.json', token, sha)
        setContentSha(saved.sha)
      } catch {
        setContentSha('')
        setStatus(`已提交 ${sha.slice(0, 7)}。版本读取中断；继续编辑前请点击「重新加载」。`)
      }
    } catch (err) { setStatus(''); setError(err instanceof Error ? err.message : String(err)) }
    finally { setBusy(false) }
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div><p className="eyebrow">风翮 / windwings · 鹏哥作品后台</p><h1>作品上传 / 替换</h1></div>
        <div className="admin-header-actions">
          <a href={SITE} target="_blank" rel="noreferrer">打开官网</a>
          {login && <><button type="button" onClick={reload} disabled={busy}>重新加载</button><button type="button" onClick={logout} disabled={busy}>退出 {login}</button></>}
        </div>
      </header>
      {!login ? (
        <form className="admin-card" onSubmit={connect}>
          <h2>登录（Fine-grained PAT）</h2>
          <p>在 GitHub 创建仅限仓库 <code>{OWNER}/{REPO}</code> 的 fine-grained token，勾选 Contents: Read and write。PAT 只存在本页 sessionStorage，关闭标签页即清除。不要把 PAT 发到聊天。</p>
          <label>Personal Access Token<input type="password" value={pat} onChange={event => setPat(event.target.value)} placeholder="github_pat_…" autoComplete="off" required disabled={busy} /></label>
          <button type="submit" disabled={busy || !pat.trim()}>{busy ? '连接中…' : '连接仓库'}</button>
        </form>
      ) : (
        <div className="admin-layout">
          <aside className="admin-card admin-list">
            <div className="admin-list-head"><h2>作品（{file.projects.length}）</h2><button type="button" onClick={startNew} disabled={busy}>新增</button></div>
            <ul>{file.projects.map(project => <li key={project.id}><button type="button" className={project.id === selectedId ? 'active' : ''} onClick={() => selectProject(project)} disabled={busy}><strong>{project.title}</strong><span>{project.id}</span></button></li>)}</ul>
          </aside>
          <form className="admin-card admin-editor" onSubmit={save}>
            <h2>编辑 {draft.title || draft.id}{dirty && <span className="admin-hint"> · 未保存</span>}</h2>
            <fieldset disabled={busy}>
              <div className="admin-grid">
                <label>id（文件夹名）<input value={draft.id} onChange={event => updateDraft('id', event.target.value)} required readOnly={Boolean(selectedId)} /><span className="admin-hint">{selectedId ? '已有作品 id 固定，保留媒体路径。' : '仅小写字母、数字、连字符，不能与已有作品重复。'}</span></label>
                <label>标题<input value={draft.title} onChange={event => updateDraft('title', event.target.value)} required /></label>
                <label>英文<input value={draft.english} onChange={event => updateDraft('english', event.target.value)} required /></label>
                <label>分类<input value={draft.category} onChange={event => updateDraft('category', event.target.value)} required /></label>
              </div>
              <label>简介<textarea rows={4} value={draft.description} onChange={event => updateDraft('description', event.target.value)} required /></label>
              <label className="admin-check"><input type="checkbox" checked={Boolean(draft.placeholder)} onChange={event => updateDraft('placeholder', event.target.checked)} />占位案例（显示「素材待更新」提示）</label>
              <h3>三张图文案</h3>
              {draft.images.slice(0, 3).map((image, index) => <div className="admin-image-row" key={index}>
                <span>图 {index + 1}</span>
                <input aria-label={`图 ${index + 1} 路径`} value={image.src} onChange={event => updateImage(index, 'src', event.target.value)} placeholder="works/…/cover.jpg" />
                <input aria-label={`图 ${index + 1} 描述`} value={image.alt} onChange={event => updateImage(index, 'alt', event.target.value)} placeholder="画面描述" />
                <input aria-label={`图 ${index + 1} 位置`} value={image.position || ''} onChange={event => updateImage(index, 'position', event.target.value)} placeholder="object-position" />
                <input aria-label={`图 ${index + 1} 图注`} value={image.caption || ''} onChange={event => updateImage(index, 'caption', event.target.value)} placeholder="图注（可空）" />
              </div>)}
              <label>影片路径 film（可空）<input value={draft.film || ''} onChange={event => updateDraft('film', event.target.value || undefined)} placeholder="works/…/film.mp4" /></label>
              <h3>上传 / 替换素材</h3>
              <p className="admin-hint">图片用 JPEG，影片用 H.264/AAC MP4。网页每个文件最多 40MB；更大文件放到 <code>staging/works/{draft.id || '<id>'}/</code>，运行 <code>node scripts/publish-works.mjs {draft.id || '<id>'}</code>。未确认可公开的客户素材请保留在本机。</p>
              <div className="admin-uploads">{MEDIA_SLOTS.map(slot => <label key={`${slot.key}-${uploadRevision}`}>{slot.label}
                <input type="file" accept={slot.accept} onChange={event => {
                  const upload = event.target.files?.[0] || null
                  try {
                    if (upload) validateUpload(slot.key, upload)
                    setError(''); setUploads(prev => ({ ...prev, [slot.key]: upload }))
                  } catch (err) {
                    event.target.value = ''; setUploads(prev => ({ ...prev, [slot.key]: null }))
                    setError(err instanceof Error ? err.message : String(err))
                  }
                }} /><span>{uploads[slot.key]?.name || '未选择'}</span>
              </label>)}</div>
              <div className="admin-actions"><button type="submit" disabled={busy || !contentSha}>{busy ? '提交中…' : '保存并推送到 main'}</button></div>
            </fieldset>
          </form>
        </div>
      )}
      {(status || error) && <div className={`admin-toast ${error ? 'is-error' : ''}`} role={error ? 'alert' : 'status'}>{error || status}</div>}
    </div>
  )
}
