#!/usr/bin/env node
/**
 * 构建前把 作品素材/<id>/ 缺省文件补进 public/works/<id>/。
 * public/works 里已有的文件（含后台新上传）优先，不覆盖。
 */
import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const sourceRoot = join(root, '作品素材')
const targetRoot = join(root, 'public', 'works')

if (!existsSync(sourceRoot)) {
  console.log('sync-works: no 作品素材/, skip')
  process.exit(0)
}

mkdirSync(targetRoot, { recursive: true })
for (const id of readdirSync(sourceRoot)) {
  const fromDir = join(sourceRoot, id)
  if (!statSync(fromDir).isDirectory()) continue
  const toDir = join(targetRoot, id)
  mkdirSync(toDir, { recursive: true })
  for (const file of readdirSync(fromDir)) {
    if (file === 'preview.mp4') continue
    const from = join(fromDir, file)
    const to = join(toDir, file)
    if (existsSync(to)) continue
    cpSync(from, to)
    console.log(`sync-works: ${id}/${file}`)
  }
}
console.log('sync-works: done')
