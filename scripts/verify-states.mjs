import { createRequire } from 'node:module'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import os from 'node:os'

const LC = process.env.LC || '/Users/ben/Documents/Kept/Misc/landingcloner'
const lcRequire = createRequire(join(LC, 'package.json'))
const { chromium } = await import(pathToFileURL(join(LC, 'node_modules/playwright/index.mjs')).href)
const pixelmatch = (await import(pathToFileURL(join(LC, 'node_modules/pixelmatch/index.js')).href)).default
const { PNG } = lcRequire('pngjs')

const argv = process.argv.slice(2)

function flag(name, fallback) {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : fallback
}

function listFlag(name) {
  const v = flag(name, null)
  return v ? v.split(',').map((s) => s.trim()).filter(Boolean) : null
}

function normalizePath(p) {
  if (!p) return '/'
  return p.length > 1 && p.endsWith('/') ? p.slice(0, -1) : p
}

function routePath(routeUrl) {
  try {
    return new URL(routeUrl).pathname || '/'
  } catch {
    return routeUrl
  }
}

function readJsonIfExists(path) {
  return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : null
}

function createPool(max) {
  let active = 0
  const queue = []
  return async (fn) => {
    if (active >= max) await new Promise((res) => queue.push(res))
    active++
    try {
      return await fn()
    } finally {
      active--
      const next = queue.shift()
      if (next) next()
    }
  }
}

function buildContextOptions(browserConfig, permissions) {
  const options = {}
  if (!browserConfig) return options
  if (typeof browserConfig.deviceScaleFactor === 'number') options.deviceScaleFactor = browserConfig.deviceScaleFactor
  if (browserConfig.colorScheme) options.colorScheme = browserConfig.colorScheme
  if (browserConfig.reducedMotion) options.reducedMotion = browserConfig.reducedMotion
  if (browserConfig.forcedColors) options.forcedColors = browserConfig.forcedColors
  if (browserConfig.locale) options.locale = browserConfig.locale
  if (browserConfig.timezoneId) options.timezoneId = browserConfig.timezoneId
  if (browserConfig.geolocation) {
    options.geolocation = browserConfig.geolocation
    if (Array.isArray(permissions) && permissions.includes('geolocation')) options.permissions = ['geolocation']
  }
  if (browserConfig.userAgent) options.userAgent = browserConfig.userAgent
  return options
}

function buildLaunchOptions(browserConfig) {
  const options = {}
  if (browserConfig && typeof browserConfig.headless === 'boolean') options.headless = browserConfig.headless
  if (browserConfig && Array.isArray(browserConfig.args) && browserConfig.args.length) options.args = browserConfig.args
  if (browserConfig && browserConfig.channel) options.channel = browserConfig.channel
  return options
}

async function settleFiniteAnimations(page) {
  const deadline = Date.now() + 4000
  while (Date.now() < deadline) {
    const running = await page.evaluate(
      () =>
        document.getAnimations().filter((animation) => {
          if (animation.playState !== 'running') return false
          const timing = animation.effect ? animation.effect.getComputedTiming() : null
          return !timing || timing.iterations !== Infinity
        }).length,
    )
    if (running === 0) return
    await page.waitForTimeout(100)
  }
}

async function waitForSettled(page, settleMs) {
  await page.waitForFunction(() => document.body && document.body.childElementCount > 0, null, { polling: 100, timeout: 60000 })
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
  await page.evaluate(() => document.fonts.ready)
  await settleFiniteAnimations(page)
  await page.waitForTimeout(settleMs)
}

async function scrollToBottom(page) {
  for (let i = 0; i < 80; i++) {
    const { scrollY, scrollHeight, innerHeight } = await page.evaluate(() => ({
      scrollY: window.scrollY,
      scrollHeight: document.documentElement.scrollHeight,
      innerHeight: window.innerHeight,
    }))
    if (scrollY + innerHeight >= scrollHeight - 2) break
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), scrollY + innerHeight * 0.8)
    await page.waitForTimeout(250)
  }
}

function unquote(s) {
  const t = s.trim()
  return (t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'")) ? t.slice(1, -1) : t
}

function hintFromSelector(selector) {
  let m = selector.match(/^\[aria-label(\^|\$)?="(.*)"\]$/)
  if (m) return { name: m[2], match: m[1] === '$' ? 'suffix' : m[1] === '^' ? 'prefix' : 'exact', text: m[1] ? null : m[2] }
  m = selector.match(/^(?:([a-z]+))?:text-is\((.*)\)$/i)
  if (m) return { name: unquote(m[2]), match: 'exact', text: unquote(m[2]), tag: m[1] || null }
  m = selector.match(/^text=(.*)$/)
  if (m) return { name: unquote(m[1]), match: 'exact', text: unquote(m[1]) }
  m = selector.match(/^\[data-label="(.*)"\]$/)
  if (m) return { name: m[1], match: 'exact', text: m[1] }
  return null
}

function nameMatches(candidate, hint) {
  if (!candidate) return false
  if (hint.match === 'suffix') return candidate.endsWith(hint.name)
  if (hint.match === 'prefix') return candidate.startsWith(hint.name)
  return candidate === hint.name
}

async function visibleLocators(locator) {
  const count = await locator.count()
  const visible = []
  for (let i = 0; i < count; i++) {
    const item = locator.nth(i)
    if (await item.isVisible().catch(() => false)) visible.push(item)
  }
  return visible
}

async function resolveTarget(page, selector, controls) {
  const attempts = []

  let recorded = null
  try {
    recorded = await visibleLocators(page.locator(selector))
  } catch {
    recorded = []
  }
  if (recorded.length === 1) return { locator: recorded[0], via: 'selector' }
  attempts.push(`selector matched ${recorded.length} visible`)

  const hint = hintFromSelector(selector)
  const exact = controls.filter((c) => c.selector === selector)
  const entries = exact.length ? exact : hint ? controls.filter((c) => nameMatches(c.accessibleName, hint)) : []
  const seen = new Set()
  for (const entry of entries) {
    if (!entry.role || !entry.accessibleName) continue
    const key = `${entry.role}\u0000${entry.accessibleName}`
    if (seen.has(key)) continue
    seen.add(key)
    const found = await visibleLocators(page.getByRole(entry.role, { name: entry.accessibleName, exact: true }))
    if (found.length === 1) return { locator: found[0], via: `role:${entry.role}[${entry.accessibleName}]` }
    attempts.push(`role ${entry.role} "${entry.accessibleName}" matched ${found.length} visible`)
  }

  const texts = new Set()
  if (hint && hint.text) texts.add(hint.text)
  for (const entry of entries) if (entry.accessibleName) texts.add(entry.accessibleName)
  for (const text of texts) {
    const found = await visibleLocators(page.getByText(text, { exact: true }))
    if (found.length === 1) return { locator: found[0], via: `text:${text}` }
    attempts.push(`text "${text}" matched ${found.length} visible`)
  }

  return { locator: null, reason: attempts.join('; ') }
}

async function replayActions(page, actions, controls, log) {
  for (const action of actions) {
    switch (action.type) {
      case 'wait':
        await page.waitForTimeout(action.ms || 0)
        break
      case 'scrollToBottom':
        await scrollToBottom(page)
        break
      case 'scrollTo':
        await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), action.y || 0)
        await page.waitForTimeout(150)
        break
      case 'waitForSelector': {
        const state = action.state || 'visible'
        const ok = await page.waitForSelector(action.selector, { state, timeout: 10000 }).then(() => true, () => false)
        if (ok) break
        const hint = hintFromSelector(action.selector)
        const fallback = hint && hint.text
          ? await page.getByText(hint.text, { exact: true }).first().waitFor({ state, timeout: 3000 }).then(() => true, () => false)
          : false
        if (!fallback) return { ok: false, status: 'wait-timeout', reason: `${action.selector} not ${state}` }
        break
      }
      case 'click':
      case 'hover':
      case 'focus': {
        const target = await resolveTarget(page, action.selector, controls)
        if (!target.locator) return { ok: false, status: 'unresolved-action', reason: `${action.type} ${action.selector}: ${target.reason}` }
        log.push({ type: action.type, selector: action.selector, via: target.via })
        await target.locator[action.type === 'click' ? 'click' : action.type === 'hover' ? 'hover' : 'focus']({ timeout: 10000 })
        break
      }
      default:
        return { ok: false, status: 'unresolved-action', reason: `unsupported action type ${action.type}` }
    }
  }
  return { ok: true }
}

function comparePngBuffers(candidateBuf, originalBuf, threshold) {
  const pc = PNG.sync.read(candidateBuf)
  const po = PNG.sync.read(originalBuf)
  const width = Math.min(pc.width, po.width)
  const height = Math.min(pc.height, po.height)
  const crop = (p) => {
    if (p.width === width && p.height === height) return p
    const o = new PNG({ width, height })
    PNG.bitblt(p, o, 0, 0, width, height, 0, 0)
    return o
  }
  const diff = new PNG({ width, height })
  const diffPixels = pixelmatch(crop(pc).data, crop(po).data, diff.data, width, height, { threshold })
  const totalPixels = width * height
  return {
    ratio: totalPixels ? diffPixels / totalPixels : 0,
    diffPixels,
    totalPixels,
    candidateDims: { width: pc.width, height: pc.height },
    originalDims: { width: po.width, height: po.height },
    heightDelta: Math.abs(pc.height - po.height),
    widthDelta: Math.abs(pc.width - po.width),
    diffPng: diff,
  }
}

function loadStates(cloneRoot, slug) {
  const routeLevel = readJsonIfExists(join(cloneRoot, 'routes', slug, 'manifests', 'states.json'))
  if (routeLevel) return routeLevel.states || []
  const cloneLevel = readJsonIfExists(join(cloneRoot, 'manifests', 'states.json'))
  if (!cloneLevel) return []
  return (cloneLevel.states || []).filter((s) => !s.route && !s.slug ? true : (s.slug || s.route) === slug)
}

function loadControls(cloneRoot, slug, vpLabel) {
  const data =
    readJsonIfExists(join(cloneRoot, 'routes', slug, 'manifests', 'controls.json')) ||
    readJsonIfExists(join(cloneRoot, 'manifests', 'controls.json')) ||
    {}
  const list = Array.isArray(data) ? data : data[vpLabel] || []
  return list
}

async function main() {
  const baseUrl = flag('url', null)
  const cloneDir = flag('clone', null)
  if (!baseUrl || !cloneDir) {
    console.error('usage: node scripts/verify-states.mjs --url <base> --clone <cloneDir> [--routes /trade,/referrals] [--states a,b] [--viewports 1440,390] [--out dir] [--threshold 0.1] [--max-diff-percent n] [--concurrency n]')
    process.exit(2)
  }

  const cloneRoot = resolve(cloneDir)
  const cloneConfig = JSON.parse(readFileSync(join(cloneRoot, 'clone.config.json'), 'utf8'))
  const routesManifest = JSON.parse(readFileSync(join(cloneRoot, 'manifests', 'routes.json'), 'utf8'))
  const routeFilter = listFlag('routes')
  const stateFilter = listFlag('states')
  const viewportFilter = listFlag('viewports')
  const outDir = resolve(flag('out', '.verify/states'))
  const threshold = Number(flag('threshold', '0.1'))
  const maxDiffPercent = Number(flag('max-diff-percent', String(cloneConfig.tolerance?.textMaxPercent ?? 0.2)))
  const concurrency = Number(flag('concurrency', String(Math.max(2, Math.min(4, os.cpus().length - 1)))))
  const settleMs = cloneConfig.capture?.settleMs ?? 400

  const allViewports = cloneConfig.viewports || []
  const viewports = viewportFilter
    ? viewportFilter.map((label) => {
        const vp = allViewports.find((v) => v.label === label)
        if (!vp) throw new Error(`viewport label not found in clone.config.json: ${label}`)
        return vp
      })
    : allViewports

  let routes = routesManifest.routes || []
  if (routeFilter) {
    const wanted = new Set(routeFilter.map(normalizePath))
    routes = routes.filter((r) => wanted.has(normalizePath(routePath(r.url))))
  }

  const browserConfig = cloneConfig.browser || null
  const launchOptions = buildLaunchOptions(browserConfig)
  const contextOptions = buildContextOptions(browserConfig, cloneConfig.permissions)

  const jobs = []
  for (const route of routes) {
    const path = normalizePath(routePath(route.url))
    const states = loadStates(cloneRoot, route.slug)
    for (const vp of viewports) {
      for (const state of states) {
        if (state.viewport && state.viewport !== vp.label) continue
        const interactiveByDefault = state.id !== 'initial' && state.id !== 'fullpage'
        if (stateFilter ? !stateFilter.includes(state.id) : !interactiveByDefault) continue
        const originalPath = join(cloneRoot, 'routes', route.slug, 'screenshots', 'original', `${vp.label}-${state.id}.png`)
        if (!existsSync(originalPath)) continue
        jobs.push({ route, path, vp, state, originalPath })
      }
    }
  }

  mkdirSync(outDir, { recursive: true })
  const browser = await chromium.launch(launchOptions)
  const pool = createPool(concurrency)
  const results = new Array(jobs.length)

  await Promise.all(
    jobs.map((job, index) =>
      pool(async () => {
        const { route, path, vp, state, originalPath } = job
        const slug = route.slug
        const base = { slug, url: route.url, path, viewport: vp.label, state: state.id }
        let context
        try {
          context = await browser.newContext({
            viewport: { width: vp.width, height: vp.height },
            isMobile: !!vp.mobile,
            hasTouch: !!vp.mobile,
            ...contextOptions,
          })
          const page = await context.newPage()
          await page.goto(new URL(path, baseUrl).toString(), { waitUntil: 'load' })
          await waitForSettled(page, settleMs)

          const controls = loadControls(cloneRoot, slug, vp.label)
          const resolved = []
          const replay = await replayActions(page, state.actions || [], controls, resolved)
          await settleFiniteAnimations(page)

          const candidateBuf = await page.screenshot({ fullPage: !!state.fullPage })
          const routeOutDir = join(outDir, slug)
          mkdirSync(routeOutDir, { recursive: true })
          const candidatePath = join(routeOutDir, `${vp.label}-${state.id}-candidate.png`)
          writeFileSync(candidatePath, candidateBuf)

          if (!replay.ok && replay.status === 'unresolved-action') {
            results[index] = { ...base, status: 'unresolved-action', reason: replay.reason, resolved, candidatePath }
            return
          }

          const cmp = comparePngBuffers(candidateBuf, readFileSync(originalPath), threshold)
          const diffPath = join(routeOutDir, `${vp.label}-${state.id}-diff.png`)
          writeFileSync(diffPath, PNG.sync.write(cmp.diffPng))
          const percent = cmp.ratio * 100
          const status = !replay.ok ? replay.status : percent <= maxDiffPercent && cmp.heightDelta === 0 && cmp.widthDelta === 0 ? 'pass' : 'fail'
          results[index] = {
            ...base,
            status,
            reason: replay.ok ? undefined : replay.reason,
            diffPercent: percent,
            diffPixels: cmp.diffPixels,
            totalPixels: cmp.totalPixels,
            candidateDims: cmp.candidateDims,
            originalDims: cmp.originalDims,
            heightDelta: cmp.heightDelta,
            widthDelta: cmp.widthDelta,
            resolved,
            candidatePath,
            diffPath,
          }
        } catch (err) {
          results[index] = { ...base, status: 'error', reason: String((err && err.message) || err).split('\n')[0] }
        } finally {
          if (context) await context.close()
        }
      }),
    ),
  )

  await browser.close()

  const ordered = results.filter(Boolean)
  for (const r of ordered) {
    const label = `${r.slug} ${r.viewport}-${r.state}`
    if (r.diffPercent === undefined) {
      console.log(`${label} diff=n/a ${r.status}${r.reason ? ` (${r.reason})` : ''}`)
      continue
    }
    const dims = r.heightDelta || r.widthDelta ? ` dims=${r.candidateDims.width}x${r.candidateDims.height}/${r.originalDims.width}x${r.originalDims.height}` : ''
    console.log(`${label} diff=${r.diffPercent.toFixed(2)}% ${r.status}${dims}${r.reason ? ` (${r.reason})` : ''}`)
  }

  const count = (s) => ordered.filter((r) => r.status === s).length
  const summary = {
    total: ordered.length,
    pass: count('pass'),
    fail: count('fail'),
    unresolvedAction: count('unresolved-action'),
    waitTimeout: count('wait-timeout'),
    error: count('error'),
  }
  console.log(
    `summary total=${summary.total} pass=${summary.pass} fail=${summary.fail} unresolved-action=${summary.unresolvedAction} wait-timeout=${summary.waitTimeout} error=${summary.error} max-diff=${maxDiffPercent}%`,
  )

  writeFileSync(
    join(outDir, 'report.json'),
    JSON.stringify({ candidateUrl: baseUrl, cloneDir: cloneRoot, threshold, maxDiffPercent, summary, results: ordered }, null, 2),
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
