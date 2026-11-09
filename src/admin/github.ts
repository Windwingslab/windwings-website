const OWNER = 'Windwingslab'
const REPO = 'windwings-website'
const API = `https://api.github.com/repos/${OWNER}/${REPO}`
const STORAGE_KEY = 'windwings-admin-pat'

export function getStoredPat(): string {
  return sessionStorage.getItem(STORAGE_KEY) || ''
}

export function setStoredPat(token: string) {
  if (token) sessionStorage.setItem(STORAGE_KEY, token)
  else sessionStorage.removeItem(STORAGE_KEY)
}

async function gh(path: string, token: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {})
  headers.set('Accept', 'application/vnd.github+json')
  headers.set('X-GitHub-Api-Version', '2022-11-28')
  headers.set('Authorization', `Bearer ${token}`)
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  const res = await fetch(`${API}${path}`, { ...init, headers })
  if (!res.ok) {
    let detail = res.statusText
    try {
      const body = await res.json()
      detail = body.message || JSON.stringify(body)
    } catch {
      /* ignore */
    }
    throw new Error(`GitHub ${res.status}: ${detail}`)
  }
  if (res.status === 204) return null
  return res.json()
}

function contentsPath(path: string) {
  return `/contents/${path.split('/').map(encodeURIComponent).join('/')}`
}

export async function verifyToken(token: string) {
  const res = await fetch('https://api.github.com/user', {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
  if (!res.ok) throw new Error('PAT 无效或无权限')
  const me = await res.json()
  await gh(`${contentsPath('content/projects.json')}?ref=main`, token)
  return me.login as string
}

export type GhFile = { path: string; sha: string; content: string; encoding: string }

export async function getFile(path: string, token: string): Promise<GhFile> {
  return (await gh(`${contentsPath(path)}?ref=main`, token)) as GhFile
}

export function decodeBase64Utf8(content: string) {
  const binary = atob(content.replace(/\n/g, ''))
  const bytes = Uint8Array.from(binary, ch => ch.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export async function putTextFile(path: string, content: string, message: string, token: string, sha?: string) {
  const encoded = btoa(unescape(encodeURIComponent(content)))
  const body: Record<string, string> = {
    message,
    content: encoded,
    branch: 'main',
  }
  if (sha) body.sha = sha
  return gh(contentsPath(path), token, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error(`读取失败：${file.name}`))
    reader.onload = () => {
      const result = String(reader.result || '')
      const comma = result.indexOf(',')
      resolve(comma >= 0 ? result.slice(comma + 1) : result)
    }
    reader.readAsDataURL(file)
  })
}

export async function putBinaryFile(path: string, file: File, message: string, token: string) {
  let sha: string | undefined
  try {
    const existing = await getFile(path, token)
    sha = existing.sha
  } catch {
    sha = undefined
  }
  const content = await fileToBase64(file)
  const body: Record<string, string> = {
    message,
    content,
    branch: 'main',
  }
  if (sha) body.sha = sha
  return gh(contentsPath(path), token, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export { OWNER, REPO }
