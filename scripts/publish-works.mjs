#!/usr/bin/env node
/** Copy validated media from staging/works/<id>/; originals in 作品素材/ are never changed. */
import { closeSync, copyFileSync, existsSync, lstatSync, mkdirSync, mkdtempSync, cpSync, renameSync, rmSync, openSync, readSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const stagingRoot = join(root, 'staging', 'works')
const publicRoot = join(root, 'public', 'works')
const only = process.argv[2]
const validId = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const validFile = /^(?:cover|live-cover|detail-[a-z0-9-]+)\.jpg$|^film\.mp4$/

try {
  if (only && !validId.test(only)) throw new Error('项目 id 只允许小写字母、数字和单个连字符，不能使用路径。')
  if (!existsSync(stagingRoot)) throw new Error('没有 staging/works/。请先建立 staging/works/<id>/，放入 cover.jpg / live-cover.jpg / film.mp4。')
  const ids = only ? [only] : readdirSync(stagingRoot).filter(name => name !== '.DS_Store')
  if (!ids.length) throw new Error('staging/works/ 下没有项目文件夹。')
  const copies = []
  // Preflight the entire batch before touching public/works, including all file signatures.
  for (const id of ids) {
    if (!validId.test(id)) throw new Error(`无效项目 id：${id}`)
    const from = join(stagingRoot, id)
    if (!lstatSync(from).isDirectory()) throw new Error(`项目目录不存在或不是普通目录：${id}`)
    const names = readdirSync(from).filter(name => name !== '.DS_Store')
    if (!names.length) throw new Error(`项目目录为空：${id}`)
    for (const file of names) {
      if (!validFile.test(file)) throw new Error(`不支持的文件：${id}/${file}。只接收 cover.jpg、live-cover.jpg、detail-*.jpg、film.mp4。`)
      const source = join(from, file)
      const stat = lstatSync(source)
      if (!stat.isFile() || stat.size === 0) throw new Error(`${id}/${file} 必须为非空普通文件。`)
      if (stat.size >= 100 * 1024 * 1024) throw new Error(`${id}/${file} 达到 GitHub 普通文件 100MiB 上限，请先压缩（建议小于 90MB）。`)
      const header = Buffer.alloc(12)
      const fd = openSync(source, 'r')
      try { readSync(fd, header, 0, 12, 0) } finally { closeSync(fd) }
      const valid = file.endsWith('.jpg') ? header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff : header.toString('ascii', 4, 8) === 'ftyp'
      if (!valid) throw new Error(`${id}/${file} 的内容不是${file.endsWith('.jpg') ? 'JPEG' : 'MP4'}，请转换格式，不要只改扩展名。`)
      const targetDir = join(publicRoot, id)
      const target = join(targetDir, file)
      if (existsSync(targetDir) && !lstatSync(targetDir).isDirectory()) throw new Error(`目标不是普通目录：${id}`)
      if (existsSync(target) && !lstatSync(target).isFile()) throw new Error(`目标不是普通文件：${id}/${file}`)
      copies.push({ source, targetDir, target, id, file })
    }
  }
  mkdirSync(publicRoot, { recursive: true })
  const transaction = mkdtempSync(join(publicRoot, '.publish-'))
  const swaps = []
  let keepRecovery = false
  try {
    // Prepare complete replacement directories; a copy failure leaves originals untouched.
    for (const id of ids) {
      const target = join(publicRoot, id)
      const staged = join(transaction, id)
      if (existsSync(target)) cpSync(target, staged, { recursive: true })
      else mkdirSync(staged)
      for (const item of copies.filter(item => item.id === id)) copyFileSync(item.source, join(staged, item.file))
      swaps.push({ target, staged, backup: join(transaction, `${id}.backup`), backedUp: false, installed: false })
    }
    for (const swap of swaps) {
      if (existsSync(swap.target)) { renameSync(swap.target, swap.backup); swap.backedUp = true }
      renameSync(swap.staged, swap.target); swap.installed = true
    }
  } catch (err) {
    for (const swap of [...swaps].reverse()) {
      try {
        if (swap.installed) rmSync(swap.target, { recursive: true, force: true })
        if (swap.backedUp) renameSync(swap.backup, swap.target)
      } catch {
        keepRecovery = true
        console.error(`自动恢复失败，原文件备份保留在 ${swap.backup}；请先恢复再提交。`)
      }
    }
    throw err
  } finally {
    if (!keepRecovery) rmSync(transaction, { recursive: true, force: true })
  }
  for (const item of copies) console.log(`copied ${item.id}/${item.file}`)
  console.log('\n已复制素材；尚未提交或上线。接下来：')
  console.log('  1) 如需改文案，只编辑 content/projects.json；确认素材可以公开。')
  console.log('  2) npm run build && npm run check')
  console.log('  3) git add public/works content/projects.json')
  console.log('  4) git commit -m "content: update works media"')
  console.log('  5) GIT_HTTP_VERSION=HTTP/1.1 git push origin HEAD')
  console.log('     在 feature 分支时还需合并到 main 才会触发正式部署。')
} catch (err) {
  console.error(err instanceof Error ? err.message : String(err))
  process.exitCode = 1
}
