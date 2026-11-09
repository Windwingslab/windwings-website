import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(new URL('../src/admin/github.ts', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } })
const github = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
const token = 'mock-not-a-real-pat'

function mockGitHub({ contentSha = 'loaded-content', parentSha = 'parent', failBlob = false, race = false } = {}) {
  const requests = []
  const response = body => Response.json(body)
  const fetch = async (url, init = {}) => {
    const path = new URL(url).pathname.replace('/repos/Windwingslab/windwings-website', '')
    const body = init.body ? JSON.parse(init.body) : undefined
    requests.push({ path, method: init.method || 'GET', body })
    if (path === '/git/ref/heads/main') return response({ object: { sha: parentSha } })
    if (path === '/contents/content/projects.json') return response({ sha: contentSha })
    if (path === `/git/commits/${parentSha}`) return response({ tree: { sha: 'base-tree' } })
    if (path === '/git/blobs') return failBlob ? Response.json({ message: 'upload failed' }, { status: 500 }) : response({ sha: `blob-${requests.length}` })
    if (path === '/git/trees') return response({ sha: 'new-tree' })
    if (path === '/git/commits') return response({ sha: 'new-commit' })
    if (path === '/git/refs/heads/main') return race ? Response.json({ message: 'Update is not a fast forward' }, { status: 422 }) : response({ object: { sha: 'new-commit' } })
    throw new Error(`Unexpected request: ${path}`)
  }
  return { fetch, requests }
}

const files = [{ path: 'content/projects.json', content: '{"projects":[]}', encoding: 'utf-8' }, { path: 'public/works/existing/cover.jpg', content: '/9j/', encoding: 'base64' }]

test('saving commits media and JSON together, preserving the base tree', async t => {
  const mock = mockGitHub(); t.mock.method(globalThis, 'fetch', mock.fetch)
  assert.equal(typeof github.commitFiles, 'function', 'atomic save must be available')
  assert.equal(await github.commitFiles(files, 'test', token, 'loaded-content', 'parent'), 'new-commit')
  const tree = mock.requests.find(r => r.path === '/git/trees').body
  assert.equal(tree.base_tree, 'base-tree')
  assert.deepEqual(tree.tree.map(f => f.path), files.map(f => f.path))
  const commit = mock.requests.find(r => r.path === '/git/commits').body
  assert.deepEqual(commit.parents, ['parent'])
  assert.deepEqual(mock.requests.at(-1), { path: '/git/refs/heads/main', method: 'PATCH', body: { sha: 'new-commit', force: false } })
})

test('stale content is rejected before any upload or branch update', async t => {
  const mock = mockGitHub({ contentSha: 'someone-elses-content' }); t.mock.method(globalThis, 'fetch', mock.fetch)
  assert.equal(typeof github.commitFiles, 'function')
  await assert.rejects(() => github.commitFiles(files, 'test', token, 'loaded-content', 'parent'), /更新|冲突/)
  assert(!mock.requests.some(r => r.method !== 'GET'))
})

test('upload failure never exposes partial media or JSON on main', async t => {
  const mock = mockGitHub({ failBlob: true }); t.mock.method(globalThis, 'fetch', mock.fetch)
  assert.equal(typeof github.commitFiles, 'function')
  await assert.rejects(() => github.commitFiles(files, 'test', token, 'loaded-content', 'parent'), /GitHub 500/)
  assert(!mock.requests.some(r => r.path === '/git/refs/heads/main'))
})

test('an intervening main commit is never force overwritten', async t => {
  const mock = mockGitHub({ race: true }); t.mock.method(globalThis, 'fetch', mock.fetch)
  assert.equal(typeof github.commitFiles, 'function')
  await assert.rejects(() => github.commitFiles(files, 'test', token, 'loaded-content', 'parent'), /更新|冲突/)
  assert.equal(mock.requests.at(-1).body.force, false)
})

test('blocked browser storage does not crash the login screen', t => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage')
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, get() { throw new Error('Storage denied') } })
  t.after(() => { if (descriptor) Object.defineProperty(globalThis, 'sessionStorage', descriptor); else delete globalThis.sessionStorage })
  assert.equal(github.getStoredPat(), '')
  assert.throws(() => github.setStoredPat(token), /存储|sessionStorage/)
})


test('a media-only update made since loading blocks the entire stale save', async t => {
  const mock = mockGitHub({ parentSha: 'media-was-replaced' }); t.mock.method(globalThis, 'fetch', mock.fetch)
  await assert.rejects(() => github.commitFiles(files, 'test', token, 'loaded-content', 'parent'), /更新|冲突/)
  assert(!mock.requests.some(r => r.method !== 'GET'))
})

test('a new project cannot overwrite a pre-existing unlisted media directory', async t => {
  const mock = mockGitHub(); t.mock.method(globalThis, 'fetch', (url, init) => new URL(url).pathname.endsWith('/contents/public/works/existing') ? Response.json([{name:'cover.jpg'}]) : mock.fetch(url, init))
  await assert.rejects(() => github.commitFiles(files, 'test', token, 'loaded-content', 'parent', 'existing'), /目录.*已存在/)
  assert(!mock.requests.some(r => r.method !== 'GET'))
})
