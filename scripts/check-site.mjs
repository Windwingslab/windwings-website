import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'

const base = '/windwings-website/'
const html = readFileSync('dist/index.html', 'utf8')
assert.match(html, /<title>windwings — 风翮<\/title>/)
assert.match(html, /theme-color" content="#171819"/)
assert.match(html, /fonts\.cdnfonts\.com\/css\/geist/)
assert(!html.includes('/src/main.tsx'), 'Production HTML must load compiled JS')
assert(existsSync('dist/admin/index.html'), 'Admin page missing from dist')
const adminHtml = readFileSync('dist/admin/index.html', 'utf8')
assert(!adminHtml.includes('/src/admin/main.tsx'), 'Admin HTML must load compiled JS')
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
assert(bundle.includes('xuliang-special-appearance'))
assert(bundle.includes('en-opening'))
assert(bundle.includes('xuliang-concert'))

const projects = JSON.parse(readFileSync('content/projects.json', 'utf8')).projects
assert(Array.isArray(projects) && projects.length > 0, 'Projects must be a non-empty list')
assert.equal(new Set(projects.map(project => project.id)).size, projects.length, 'Project ids must be unique')
for (const project of projects) {
  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.id), `Invalid project id: ${project.id}`)
  for (const key of ['title', 'english', 'category', 'description']) {
    assert(typeof project[key] === 'string' && project[key].trim(), `Missing ${key}: ${project.id}`)
  }
  assert(Array.isArray(project.images) && project.images.length > 0, `Missing images: ${project.id}`)
  for (const image of project.images || []) {
    if (!image.src || /^https?:/i.test(image.src)) continue
    assert(existsSync(join('public', image.src)), `Missing project image: ${image.src}`)
    assert(existsSync(join('dist', image.src)), `Missing built project image: ${image.src}`)
  }
  if (project.film && !/^https?:/i.test(project.film)) {
    assert(existsSync(join('public', project.film)), `Missing project film: ${project.film}`)
    assert(existsSync(join('dist', project.film)), `Missing built project film: ${project.film}`)
  }
}

const references = JSON.parse(readFileSync('src/reference-assets.json', 'utf8'))
assert.equal(references.filter(asset => asset.url.endsWith('.gif')).length, 21)
assert.equal(references.filter(asset => asset.url.endsWith('.png')).length, 5)
for (const asset of references.filter(asset => asset.local)) {
  assert(existsSync(join('dist', asset.file)), `Missing reference asset: ${asset.file}`)
}
const protectedFiles = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0')
  .filter(file => file.startsWith('作品素材/') || /\.(md|csv|json)$/.test(file) && !file.startsWith('docs/') && file !== 'README.md' && !file.includes('package') && file !== 'content/projects.json')
for (const file of protectedFiles) assert(existsSync(file), `Original file removed: ${file}`)
assert(existsSync('archive/index.legacy.html'))
assert(existsSync('ADMIN.md'))
console.log(`PASS: production title, ${base} paths, admin page, ${projects.length} projects with public/works media, original files preserved, no reference-brand copy.`)
console.log('Known reference placeholder: Celestia is not a usable GIF; same-size tile is rendered without requesting it.')
