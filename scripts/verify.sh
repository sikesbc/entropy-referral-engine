#!/usr/bin/env bash
set -uo pipefail

usage() {
  echo "usage: scripts/verify.sh <loggedout|loggedin> [routes] [states] [viewports]" >&2
  echo "  routes, states, viewports are comma lists; pass - to use the default" >&2
  exit 2
}

SIDE="${1:-}"
case "$SIDE" in
  loggedout|loggedin) ;;
  *) usage ;;
esac

pick() { if [ -z "${1:-}" ] || [ "$1" = "-" ]; then echo ""; else echo "$1"; fi; }
ROUTES="$(pick "${2:-}")"
STATES="$(pick "${3:-}")"
VIEWPORTS="$(pick "${4:-}")"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LC="${LC:-/Users/ben/Documents/Kept/Misc/landingcloner}"
CLONE="$LC/clones/entropy.io-$SIDE"
OUT="$ROOT/.verify/$SIDE"
VIEWPORTS_ARG="${VIEWPORTS:-1440,390}"

cd "$ROOT"
rm -rf "$OUT"
mkdir -p "$OUT"

needs_build() {
  [ -f .next/BUILD_ID ] || return 0
  [ -n "$(find app components lib public fixtures package.json next.config.* postcss.config.* tsconfig.json -newer .next/BUILD_ID -print -quit 2>/dev/null)" ]
}

if needs_build; then
  echo "building"
  if ! pnpm build > "$OUT/build.log" 2>&1; then
    tail -n 30 "$OUT/build.log" >&2
    echo "build failed" >&2
    exit 1
  fi
fi

PORT="$(node -e 'const s=require("net").createServer().listen(0,"127.0.0.1",()=>{console.log(s.address().port);s.close()})')"
BASE="http://127.0.0.1:$PORT"

SERVER_PID=""
cleanup() {
  if [ -n "$SERVER_PID" ]; then
    pkill -P "$SERVER_PID" 2>/dev/null || true
    kill "$SERVER_PID" 2>/dev/null || true
  fi
  lsof -ti "tcp:$PORT" 2>/dev/null | xargs kill 2>/dev/null || true
}
trap cleanup EXIT INT TERM

MOCK_DETERMINISTIC=1 MOCK_SESSION="$SIDE" PORT="$PORT" pnpm start > "$OUT/server.log" 2>&1 &
SERVER_PID=$!

ready=0
for _ in $(seq 1 120); do
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    break
  fi
  if curl -sf -o /dev/null "$BASE/"; then
    ready=1
    break
  fi
  sleep 0.5
done
if [ "$ready" -ne 1 ]; then
  tail -n 30 "$OUT/server.log" >&2
  echo "server failed to start on port $PORT" >&2
  exit 1
fi
echo "serving $BASE side=$SIDE"

in_list() { case ",$2," in *",$1,"*) return 0 ;; esac; return 1; }

COMPARE_STATES=""
STATE_ARG=""
if [ -z "$STATES" ]; then
  COMPARE_STATES="initial,fullpage"
else
  IFS=',' read -ra requested <<< "$STATES"
  for s in "${requested[@]}"; do
    if [ "$s" = "initial" ] || [ "$s" = "fullpage" ]; then
      COMPARE_STATES="${COMPARE_STATES:+$COMPARE_STATES,}$s"
    else
      STATE_ARG="${STATE_ARG:+$STATE_ARG,}$s"
    fi
  done
fi

if [ -n "$COMPARE_STATES" ]; then
  args=(--url "$BASE" --clone "$CLONE" --viewports "$VIEWPORTS_ARG" --states "$COMPARE_STATES" --out "$OUT/compare")
  [ -n "$ROUTES" ] && args+=(--routes "$ROUTES")
  pnpm -C "$LC" compare "${args[@]}" > "$OUT/compare.log" 2>&1 || true
fi

if [ -z "$STATES" ] || [ -n "$STATE_ARG" ]; then
  args=(--url "$BASE" --clone "$CLONE" --viewports "$VIEWPORTS_ARG" --out "$OUT/states")
  [ -n "$ROUTES" ] && args+=(--routes "$ROUTES")
  [ -n "$STATE_ARG" ] && args+=(--states "$STATE_ARG")
  node "$ROOT/scripts/verify-states.mjs" "${args[@]}" > "$OUT/states.log" 2>&1 || true
fi

node - "$OUT" "$CLONE" <<'NODE' | tee "$OUT/table.txt"
const fs = require('fs')
const path = require('path')
const [out, clone] = process.argv.slice(2)
const read = (p) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null)
const config = read(path.join(clone, 'clone.config.json')) || {}
const maxPercent = config.tolerance && config.tolerance.textMaxPercent != null ? config.tolerance.textMaxPercent : 0.2
const rows = []
const compare = read(path.join(out, 'compare', 'report.json'))
if (compare) {
  for (const r of compare.routes) {
    const label = `${r.slug} ${r.viewport || '-'}-${r.state || 'all'}`
    if (r.status !== 'ok') {
      rows.push({ label, text: `${label} diff=n/a ${r.status}${r.error ? ` (${String(r.error).slice(0, 80)})` : ''}`, bad: true })
      continue
    }
    const pct = r.diffRatio * 100
    const pass = pct <= maxPercent && r.heightDelta === 0 && r.widthDelta === 0
    const dims = r.heightDelta || r.widthDelta ? ` dims=${r.candidateDims.width}x${r.candidateDims.height}/${r.originalDims.width}x${r.originalDims.height}` : ''
    rows.push({ label, text: `${label} diff=${pct.toFixed(2)}% ${pass ? 'pass' : 'fail'}${dims}`, bad: !pass })
  }
}
const states = read(path.join(out, 'states', 'report.json'))
if (states) {
  for (const r of states.results) {
    const label = `${r.slug} ${r.viewport}-${r.state}`
    const pct = r.diffPercent === undefined ? 'n/a' : `${r.diffPercent.toFixed(2)}%`
    const dims = r.heightDelta || r.widthDelta ? ` dims=${r.candidateDims.width}x${r.candidateDims.height}/${r.originalDims.width}x${r.originalDims.height}` : ''
    rows.push({ label, text: `${label} diff=${pct} ${r.status}${dims}${r.reason ? ` (${r.reason})` : ''}`, bad: r.status !== 'pass' })
  }
}
rows.sort((a, b) => a.label.localeCompare(b.label))
for (const r of rows) console.log(r.text)
const bad = rows.filter((r) => r.bad).length
console.log(`total=${rows.length} pass=${rows.length - bad} not-pass=${bad} max-diff=${maxPercent}% out=${out}`)
NODE

exit 0
