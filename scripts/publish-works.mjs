#!/usr/bin/env node
/**
 * 本机大文件兜底：把 staging/works/<id>/ 下的 cover.jpg / live-cover.jpg / film.mp4
 * 复制到 public/works/<id>/，然后提示 git add / commit / push。
 *
 * 用法：
 *   node scripts/publish-works.mjs
 *   node scripts/publish-works.mjs xuliang-concert
 */
import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const stagingRoot = join(root, 'staging', 'works')
const publicRoot = join(root, 'public', 'works')
const only = process.argv[2]

if (!existsSync(stagingRoot)) {
  console.error('没有 staging/works/。先建文件夹，例如：')
  console.error('  mkdir -p staging/works/xuliang-concert')
  console.error('  # 放入 cover.jpg / live-cover.jpg / film.mp4')
  process.exit(1)
}

const ids = only ? [only] : readdirSync(stagingRoot).filter(name => statSync(join(stagingRoot, name)).isDirectory())
if (!ids.length) {
  console.error('staging/works/ 下没有项目文件夹')
  process.exit(1)
}

for (const id of ids) {
  const from = join(stagingRoot, id)
  const to = join(publicRoot, id)
  mkdirSync(to, { recursive: true })
  for (const file of readdirSync(from)) {
    cpSync(join(from, file), join(to, file))
    console.log(`copied ${id}/${file}`)
  }
}

console.log('\n已复制到 public/works/。接下来：')
console.log('  1) 如需改标题/简介，编辑 content/projects.json 或打开 /admin')
console.log('  2) git add public/works content/projects.json')
console.log('  3) git commit -m "content: update works media"')
console.log('  4) GIT_HTTP_VERSION=HTTP/1.1 git push origin HEAD')
