import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'

const base = '/windwings-website/'
const html = readFileSync('dist/index.html', 'utf8')
assert.match(html, /<title>WINDWINGS — 风翮视觉<\/title>/)
assert(!html.includes('/src/main.tsx'), 'Production HTML must load compiled JS')
const urls = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(match => match[1])
for (const url of urls.filter(url => url.startsWith('/'))) {
  assert(url.startsWith(base), `Incorrect project base: ${url}`)
  assert(existsSync(join('dist', url.slice(base.length))), `Missing HTML asset: ${url}`)
}
const jsFiles = readdirSync('dist/assets').filter(file => file.endsWith('.js'))
const bundle = jsFiles.map(file => readFileSync(join('dist/assets', file), 'utf8')).join('\n')
assert(!/\bjack\b/i.test(bundle), 'Reference branding leaked into the production bundle')
assert(bundle.includes('Jp404685320@gmail.com'))
assert(bundle.includes('windwingslab'))
const bundledMedia = [...bundle.matchAll(/\/windwings-website\/assets\/[^"'`\s]+?\.(?:jpg|png|mp4)/g)].map(match => match[0])
assert(bundledMedia.length >= 5, 'Missing local case images or films')
for (const path of bundledMedia) assert(existsSync(join('dist', path.slice(base.length))), `Missing bundled media: ${path}`)
const references = JSON.parse(readFileSync('src/reference-assets.json', 'utf8'))
assert.equal(references.filter(asset => asset.url.endsWith('.gif')).length, 21)
assert.equal(references.filter(asset => asset.url.endsWith('.png')).length, 5)
for (const asset of references.filter(asset => asset.local)) {
  assert(existsSync(join('dist', asset.file)), `Missing reference asset: ${asset.file}`)
}
const protectedFiles = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0')
  .filter(file => file.startsWith('作品素材/') || /\.(md|csv|json)$/.test(file) && !file.startsWith('docs/') && file !== 'README.md' && !file.includes('package'))
for (const file of protectedFiles) assert(existsSync(file), `Original file removed: ${file}`)
assert(existsSync('archive/index.legacy.html'))
console.log(`PASS: production title, ${base} paths, ${bundledMedia.length} local media references, ${references.filter(asset => asset.local).length} downloaded references, original files preserved, no reference-brand copy.`)
console.log('Known placeholder: Celestia GIF returns HTTP 404; same-size tile is rendered without requesting it.')
