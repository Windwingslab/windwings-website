const OWNER = 'Windwingslab'
const REPO = 'windwings-website'
const API = `https://api.github.com/repos/${OWNER}/${REPO}`
const STORAGE_KEY = 'windwings-admin-pat'

export function getStoredPat(): string {
  try { return sessionStorage.getItem(STORAGE_KEY) || '' } catch { return '' }
}

export function setStoredPat(token: string) {
  try {
    if (token) sessionStorage.setItem(STORAGE_KEY, token)
    else sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    if (token) throw new Error('浏览器禁用了会话存储（sessionStorage），请允许本站存储后重新连接。')
  }
}

class GitHubError extends Error {
  constructor(readonly status: number, detail: string) { super(`GitHub ${status}: ${detail}`) }
}

async function request(url: string, token: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {})
  headers.set('Accept', 'application/vnd.github+json')
  headers.set('X-GitHub-Api-Version', '2022-11-28')
  headers.set('Authorization', `Bearer ${token}`)
  if (init.body) headers.set('Content-Type', 'application/json')
  const res = await fetch(url, { ...init, headers, cache: 'no-store' })
  if (!res.ok) {
    let detail = res.statusText
    try { detail = (await res.json()).message || detail } catch { /* keep HTTP status */ }
    throw new GitHubError(res.status, detail)
  }
  return res.status === 204 ? null : res.json()
}

function gh(path: string, token: string, init: RequestInit = {}) {
  return request(`${API}${path}`, token, init)
}

export async function verifyToken(token: string) {
  const me = await request('https://api.github.com/user', token)
  await getFile('content/projects.json', token)
  return me.login as string
}

export async function getMainHead(token: string): Promise<string> {
  const head = await gh('/git/ref/heads/main', token)
  return head.object.sha
}

export type GhFile = { path: string; sha: string; content: string; encoding: string }

export async function getFile(path: string, token: string, ref = 'main'): Promise<GhFile> {
  const encoded = path.split('/').map(encodeURIComponent).join('/')
  return gh(`/contents/${encoded}?ref=${encodeURIComponent(ref)}`, token)
}

export function decodeBase64Utf8(content: string) {
  const bytes = Uint8Array.from(atob(content.replace(/\s/g, '')), ch => ch.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error(`读取失败：${file.name}`))
    reader.onabort = () => reject(new Error(`已取消读取：${file.name}`))
    reader.onload = () => resolve(String(reader.result).split(',')[1])
    reader.readAsDataURL(file)
  })
}

export type CommitFile = { path: string; content: string; encoding: 'utf-8' | 'base64' }

/** Stage blobs and one tree off-main; publish all media + JSON with a single fast-forward. */
export async function commitFiles(files: CommitFile[], message: string, token: string, expectedContentSha: string, expectedHeadSha: string, newProjectId?: string) {
  if (!expectedContentSha) throw new Error('作品版本缺失，请重新连接仓库。')
  const parent = await getMainHead(token)
  if (!expectedHeadSha || parent !== expectedHeadSha) {
    throw new Error('保存冲突：仓库已更新（可能包括媒体文件）。请先复制当前文案，再点击「重新加载」后重试。')
  }
  const current = await getFile('content/projects.json', token, parent)
  if (current.sha !== expectedContentSha) {
    throw new Error('保存冲突：作品列表已被其他人更新。请先复制当前文案，再点击「重新加载」后重试。')
  }
  if (newProjectId) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(newProjectId)) throw new Error('无效的新作品 id。')
    let exists = true
    try { await getFile(`public/works/${newProjectId}`, token, parent) } catch (err) {
      if (err instanceof GitHubError && err.status === 404) exists = false
      else throw err
    }
    if (exists) throw new Error(`媒体目录「${newProjectId}」已存在。请换一个新作品 id，避免覆盖原文件。`)
  }
  const commit = await gh(`/git/commits/${parent}`, token)
  const tree = []
  for (const file of files) {
    const blob = await gh('/git/blobs', token, { method: 'POST', body: JSON.stringify({ content: file.content, encoding: file.encoding }) })
    tree.push({ path: file.path, mode: '100644', type: 'blob', sha: blob.sha })
  }
  const nextTree = await gh('/git/trees', token, {
    method: 'POST', body: JSON.stringify({ base_tree: commit.tree.sha, tree }),
  })
  const nextCommit = await gh('/git/commits', token, {
    method: 'POST', body: JSON.stringify({ message, tree: nextTree.sha, parents: [parent] }),
  })
  try {
    await gh('/git/refs/heads/main', token, {
      method: 'PATCH', body: JSON.stringify({ sha: nextCommit.sha, force: false }),
    })
  } catch (err) {
    if (err instanceof GitHubError && (err.status === 422 || err.status === 409)) {
      throw new Error(`保存冲突或分支保护：main 无法快进更新，未覆盖已有提交。请重新加载后重试。${err.message}`)
    }
    // A response may be lost after GitHub accepted the update. Reconcile before reporting failure.
    try {
      const latest = await gh('/git/ref/heads/main', token)
      if (latest.object.sha === nextCommit.sha) return nextCommit.sha as string
    } catch { /* preserve the original failure */ }
    throw err
  }
  return nextCommit.sha as string
}

export { OWNER, REPO }
