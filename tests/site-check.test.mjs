import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { runInNewContext } from 'node:vm'
import test from 'node:test'

// Exercise the real deployment gate with the JSON a successful admin add would produce.
const gate = readFileSync('scripts/check-site.mjs', 'utf8').replace(/^import .*\n/gm, '')
const original = JSON.parse(readFileSync('content/projects.json', 'utf8'))
function check(projects) {
  return runInNewContext(gate, {
    assert, existsSync, readdirSync, execFileSync, join,
    readFileSync(path, ...args) { return path === 'content/projects.json' ? JSON.stringify({ projects }) : readFileSync(path, ...args) },
    console: { log() {} },
  })
}
test('deployment accepts an admin-added fourth project with existing valid media', () => {
  const next = [...original.projects, { ...original.projects[0], id: 'fourth-work' }]
  assert.doesNotThrow(() => check(next))
})
test('deployment rejects duplicate project ids', () => {
  assert.throws(() => check([...original.projects, original.projects[0]]), /id|重复|unique/)
})
