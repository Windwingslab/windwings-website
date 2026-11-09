import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, rmSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
const script = process.env.PUBLISH_SCRIPT || fileURLToPath(new URL('../scripts/publish-works.mjs', import.meta.url))
function setup(t) {
  const root = mkdtempSync(join(tmpdir(), 'windwings-publish-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  mkdirSync(join(root, 'staging/works/sample'), { recursive: true })
  return root
}
const jpeg = Buffer.from([0xff,0xd8,0xff,0xe0,0,0])
test('publisher rejects path traversal before creating a target', t => {
  const root = setup(t)
  const result = spawnSync(process.execPath, [script,'../escape'], {cwd:root,encoding:'utf8'})
  assert.notEqual(result.status,0)
  assert(!existsSync(join(root,'public/escape')), 'must not create directories outside works/<id>')
})
test('all staged files are checked before overwriting existing media', t => {
  const root = setup(t);mkdirSync(join(root,'public/works/sample'),{recursive:true})
  writeFileSync(join(root,'public/works/sample/cover.jpg'),'original')
  writeFileSync(join(root,'staging/works/sample/cover.jpg'),jpeg)
  writeFileSync(join(root,'staging/works/sample/film.mp4'),'not an MP4')
  const result=spawnSync(process.execPath,[script,'sample'],{cwd:root,encoding:'utf8'})
  assert.notEqual(result.status,0)
  assert.equal(readFileSync(join(root,'public/works/sample/cover.jpg'),'utf8'),'original')
})
test('publisher copies canonical media and independent stills but never deletes backups', t => {
  const root=setup(t);writeFileSync(join(root,'staging/works/sample/cover.jpg'),jpeg);writeFileSync(join(root,'staging/works/sample/detail-01.jpg'),jpeg)
  mkdirSync(join(root,'作品素材/sample'),{recursive:true});writeFileSync(join(root,'作品素材/sample/keep.txt'),'backup')
  const result=spawnSync(process.execPath,[script,'sample'],{cwd:root,encoding:'utf8'})
  assert.equal(result.status,0,result.stderr)
  assert(existsSync(join(root,'public/works/sample/detail-01.jpg')))
  assert.equal(readFileSync(join(root,'作品素材/sample/keep.txt'),'utf8'),'backup')
})


test('a directory swap failure rolls back every previously installed project', t => {
  const root = setup(t)
  mkdirSync(join(root,'staging/works/second'))
  for (const id of ['sample','second']) {
    mkdirSync(join(root,`public/works/${id}`),{recursive:true})
    writeFileSync(join(root,`public/works/${id}/cover.jpg`),`original-${id}`)
    writeFileSync(join(root,`staging/works/${id}/cover.jpg`),jpeg)
  }
  const inject=join(root,'simulate-rename-failure.cjs')
  writeFileSync(inject, `const fs=require('node:fs');const rename=fs.renameSync;let failed=false;fs.renameSync=function(a,b){if(!failed&&a.includes('.publish-')&&a.endsWith('/second')){failed=true;throw new Error('simulated rename failure')}return rename(a,b)};require('node:module').syncBuiltinESMExports();`)
  const result=spawnSync(process.execPath,['--require',inject,script],{cwd:root,encoding:'utf8'})
  assert.notEqual(result.status,0)
  for (const id of ['sample','second']) assert.equal(readFileSync(join(root,`public/works/${id}/cover.jpg`),'utf8'),`original-${id}`)
})

test('Finder metadata does not block a staged media batch', t => {
  const root=setup(t)
  writeFileSync(join(root,'staging/works/.DS_Store'),'Finder')
  writeFileSync(join(root,'staging/works/sample/.DS_Store'),'Finder')
  writeFileSync(join(root,'staging/works/sample/cover.jpg'),jpeg)
  const result=spawnSync(process.execPath,[script],{cwd:root,encoding:'utf8'})
  assert.equal(result.status,0,result.stderr)
  assert(existsSync(join(root,'public/works/sample/cover.jpg')))
  assert(!existsSync(join(root,'public/works/sample/.DS_Store')))
})
