import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'
let model = {}
try {
  const src = await readFile(new URL('../src/admin/model.ts', import.meta.url), 'utf8')
  const { outputText } = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } })
  model = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
} catch (err) { if (err.code !== 'ENOENT') throw err }
const project = { id: 'sample', title: '标题', english: 'SAMPLE', category: 'Live Visual', description: '简介', images: Array.from({length:3},()=>({src:'works/sample/cover.jpg',alt:'画面'})) }

test('duplicate ids are rejected instead of silently dropping a project', () => {
  assert.equal(typeof model.prepareProject, 'function')
  assert.throws(() => model.prepareProject(project, { projects: [project] }, '', {}), /id.*已存在/)
})
test('an existing id is immutable so media never gets orphaned by a rename', () => {
  assert.equal(typeof model.prepareProject, 'function')
  assert.throws(() => model.prepareProject({...project,id:'renamed'}, {projects:[project]}, 'sample', {}), /不能修改/)
})
test('a cover-only new project uses that cover for all empty image slots', () => {
  assert.equal(typeof model.prepareProject, 'function')
  const blank = {...project,images:Array.from({length:3},()=>({src:'',alt:''}))}
  const next = model.prepareProject(blank, {projects:[]}, '', {cover:{name:'cover.jpg',type:'image/jpeg',size:100}})
  assert.deepEqual(next.images.map(i=>i.src), Array(3).fill('works/sample/cover.jpg'))
  assert(next.images.every(i=>i.alt==='标题'))
})
test('validation happens for every upload before any remote operation', () => {
  assert.equal(typeof model.validateUpload, 'function')
  assert.throws(()=>model.validateUpload('film',{name:'film.webm',type:'video/webm',size:100}), /MP4/)
  assert.throws(()=>model.validateUpload('cover',{name:'cover.png',type:'image/png',size:100}), /JPEG/)
  assert.throws(()=>model.validateUpload('film',{name:'film.mp4',type:'video/mp4',size:41*1024*1024}), /staging\/works/)
  assert.throws(()=>model.validateUpload('cover',{name:'cover.jpg',type:'image/jpeg',size:0}), /空/)
})
test('invalid id, whitespace-only copy and unsafe media paths are rejected', () => {
  assert.equal(typeof model.prepareProject, 'function')
  for (const invalid of [{...project,id:'../escape'},{...project,title:'  '},{...project,images:[{src:'../secret.env',alt:'x'}]}]) {
    assert.throws(()=>model.prepareProject(invalid,{projects:[]},'',{}))
  }
})
