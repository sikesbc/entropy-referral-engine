import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const [cloneDir, outDir, label] = process.argv.slice(2)
if (!cloneDir || !outDir || !label) {
  console.error('usage: node scripts/extract-fixtures.mjs <cloneDir> <outDir> <label>')
  process.exit(1)
}

const API_URL = /^https:\/\/(entropy\.io\/api\/|api\.entropy\.trade\/|api\.hyperliquid\.xyz\/info)/
const MAX_FRAMES_PER_SOCKET = 400

const clone = resolve(cloneDir)
const out = resolve(outDir, label)
const resources = JSON.parse(readFileSync(join(clone, 'manifests/resources.json'), 'utf8')).resources

function readBody(relPath) {
  if (!relPath) return null
  const path = join(clone, relPath)
  if (!existsSync(path)) return null
  const text = readFileSync(path, 'utf8')
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function routeOf(phase) {
  return phase ? phase.split(':')[0] : null
}

function dedupeKey(method, url, request) {
  const u = new URL(url)
  if (request && typeof request === 'object' && request.type === 'candleSnapshot') {
    return `${method} ${u.pathname} candleSnapshot ${request.req?.coin} ${request.req?.interval}`
  }
  u.searchParams.delete('listingRevision')
  return `${method} ${u.toString()} ${JSON.stringify(request)}`
}

rmSync(out, { recursive: true, force: true })
mkdirSync(join(out, 'http'), { recursive: true })

const seen = new Map()
for (const r of resources) {
  if (r.status !== 200 || !API_URL.test(r.url)) continue
  if (r.method !== 'GET' && r.method !== 'POST') continue
  const request = r.method === 'POST' ? readBody(r.requestBodyPath) : null
  const id = createHash('sha256').update(dedupeKey(r.method, r.url, request)).digest('hex').slice(0, 16)
  const previous = seen.get(id)
  if (previous && previous.capturedAt >= r.capturedAt) continue
  const response = readBody(r.bodyPath)
  if (response === null) continue
  const entry = {
    id,
    method: r.method,
    url: r.url,
    path: new URL(r.url).pathname,
    query: Object.fromEntries(new URL(r.url).searchParams),
    request,
    status: r.status,
    contentType: r.contentType,
    route: routeOf(r.phase),
    capturedAt: r.capturedAt,
    response,
  }
  seen.set(id, entry)
  writeFileSync(join(out, 'http', `${id}.json`), JSON.stringify(entry))
}

const index = [...seen.values()].map(({ response, ...meta }) => ({
  ...meta,
  requestType: meta.request && typeof meta.request === 'object' ? meta.request.type ?? null : null,
}))
writeFileSync(join(out, 'http-index.json'), JSON.stringify(index, null, 1))

const ws = JSON.parse(readFileSync(join(clone, 'manifests/websockets.json'), 'utf8'))
const framesBySocket = new Map()
for (const f of ws.frames ?? []) {
  const list = framesBySocket.get(f.socketId ?? f.socket ?? f.id) ?? []
  if (list.length < MAX_FRAMES_PER_SOCKET) list.push(f)
  framesBySocket.set(f.socketId ?? f.socket ?? f.id, list)
}
writeFileSync(
  join(out, 'websocket.json'),
  JSON.stringify({ sockets: ws.sockets, frames: [...framesBySocket.values()].flat() }),
)

const byPath = new Map()
for (const e of index) {
  const key = `${e.method} ${e.path}${e.requestType ? ` [${e.requestType}]` : ''}`
  byPath.set(key, (byPath.get(key) ?? 0) + 1)
}
console.log(`${label}: ${seen.size} http fixtures, ${framesBySocket.size} sockets`)
for (const [k, v] of [...byPath].sort((a, b) => b[1] - a[1])) console.log(`  ${v}\t${k}`)
