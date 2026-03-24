#!/bin/bash
# Universal Harmonix — Full pipeline runner
# Same 5-layer structure as YGW. Exits 1 on RED.
# Usage: bash scripts/pipeline-report.sh

cd "$(dirname "$0")/.."

ERRORS=0
START_TIME=$(date +%s)
AUTH_TIME=0; UNIT_TIME=0; CONTRACT_TIME=0; ACCEPT_TIME=0; UI_TIME=0; OAT_TIME=0
AUTH_RESULT="—"; UNIT_RESULT="—"; CONTRACT_RESULT="—"; ACCEPT_RESULT="SKIP"; UI_RESULT="SKIP"; OAT_RESULT="—"
UNIT_LINE="—"; UNIT_BRANCH="—"; UNIT_BUGS=0
CONTRACT_BUGS=0
ACCEPT_LINE="—"; ACCEPT_BRANCH="—"; ACCEPT_BUGS=0

extract_line_cov()   { echo "$1" | grep -E "$2" | grep -v test | head -1 | awk -F'|' '{gsub(/ /,"",$2); print $2}'; }
extract_branch_cov() { echo "$1" | grep -E "$2" | grep -v test | head -1 | awk -F'|' '{gsub(/ /,"",$3); print $3}'; }
extract_bugs()       { echo "$1" | grep -oP '(?<=# fail )\d+' | tail -1 || echo "0"; }

parse_test_stats() {
  local out="$1"
  local pass fail skip
  pass=$(echo "$out" | grep -oP '(?<=# pass )\d+' | tail -1)
  fail=$(echo "$out" | grep -oP '(?<=# fail )\d+' | tail -1)
  skip=$(echo "$out" | grep -oP '(?<=# skipped )\d+' | tail -1)
  echo "tests passed: ${pass:-0} | failed: ${fail:-0} | skipped: ${skip:-0}"
}

show_coverage() {
  echo "$1" | grep -E '\.(js)\s+\|' | \
    awk -F'|' '{
      file=$1; line=$2; branch=$3;
      gsub(/^ +| +$/, "", file);
      gsub(/^ +| +$/, "", line);
      gsub(/^ +| +$/, "", branch);
      printf "   %-36s line: %s%%  branch: %s%%\n", file, line, branch
    }' 2>/dev/null || echo "   (coverage data not available)"
}

separator() { echo ""; echo "────────────────────────────────────────"; }

# ── Layer 0: Auth canary ───────────────────────────────────────────────────────
separator
echo "LAYER 0 — AUTH CANARY"
AUTH_START=$(date +%s)
AUTH_OUT=$(bash scripts/check-auth.sh 2>&1)
AUTH_END=$(date +%s)
AUTH_TIME=$(( AUTH_END - AUTH_START ))
if echo "$AUTH_OUT" | grep -q "CANARY: GREEN"; then
  AUTH_RESULT="✅ GREEN"
  echo "✅ GREEN (${AUTH_TIME}s)"
  echo "$AUTH_OUT" | grep -E "^(GREEN|RED|SKIP)" | sed 's/^/   /'
else
  AUTH_RESULT="❌ RED"
  echo "❌ RED — stopping pipeline"
  echo "$AUTH_OUT" | grep -E "^(GREEN|RED|SKIP)" | sed 's/^/   /'
  exit 1
fi

# ── Layer 1: Unit tests ────────────────────────────────────────────────────────
separator
echo "LAYER 1 — UNIT TESTS (domain.js + format.js)"
UNIT_START=$(date +%s)
UNIT_OUT=$(node --test --experimental-test-coverage tests/verification.test.js tests/format.test.js 2>&1)
UNIT_EXIT=$?
UNIT_END=$(date +%s)
UNIT_STATS=$(parse_test_stats "$UNIT_OUT")
UNIT_TIME=$(( UNIT_END - UNIT_START ))
UNIT_BUGS=$(extract_bugs "$UNIT_OUT")
UNIT_LINE=$(extract_line_cov "$UNIT_OUT" "domain\.js")
UNIT_BRANCH=$(extract_branch_cov "$UNIT_OUT" "domain\.js")
if [ $UNIT_EXIT -eq 0 ]; then
  UNIT_RESULT="✅ GREEN"
  echo "✅ GREEN (${UNIT_TIME}s) | $UNIT_STATS"
else
  UNIT_RESULT="❌ RED"
  echo "❌ RED  (${UNIT_TIME}s) | $UNIT_STATS"
  ERRORS=$((ERRORS+1))
fi
echo "   Coverage:"
show_coverage "$UNIT_OUT"

# ── Layer 2: Contract tests (external API consumer contracts) ─────────────────
separator
echo "LAYER 2 — CONTRACT / API CONSUMER CONTRACTS"
CONTRACT_START=$(date +%s)
CONTRACT_OUT=$(node --test \
  tests/contract/opensky.contract.test.js \
  tests/contract/iss.contract.test.js \
  tests/contract/weather.contract.test.js \
  tests/contract/starlink.contract.test.js \
  tests/contract/kp.contract.test.js \
  tests/contract/nominatim.contract.test.js \
  tests/contract/postcodes.contract.test.js 2>&1)
CONTRACT_EXIT=$?
CONTRACT_END=$(date +%s)
CONTRACT_STATS=$(parse_test_stats "$CONTRACT_OUT")
CONTRACT_TIME=$(( CONTRACT_END - CONTRACT_START ))
CONTRACT_BUGS=$(extract_bugs "$CONTRACT_OUT")
if [ $CONTRACT_EXIT -eq 0 ]; then
  CONTRACT_RESULT="✅ GREEN"
  echo "✅ GREEN (${CONTRACT_TIME}s) | $CONTRACT_STATS"
else
  CONTRACT_RESULT="❌ RED"
  echo "❌ RED  (${CONTRACT_TIME}s) | $CONTRACT_STATS"
  echo "$CONTRACT_OUT" | grep -E "(fail|Error)" | head -10 | sed 's/^/   /'
  ERRORS=$((ERRORS+1))
fi

# ── Layer 3: Gherkin / BDD acceptance ─────────────────────────────────────────
separator
echo "LAYER 3 — GHERKIN / BDD ACCEPTANCE"
ACCEPT_START=$(date +%s)
ACCEPT_OUT=$(node --test --experimental-test-coverage tests/acceptance/sighting-log.test.js tests/acceptance/location.test.js 2>&1)
ACCEPT_EXIT=$?
ACCEPT_END=$(date +%s)
ACCEPT_STATS=$(parse_test_stats "$ACCEPT_OUT")
ACCEPT_TIME=$(( ACCEPT_END - ACCEPT_START ))
ACCEPT_BUGS=$(extract_bugs "$ACCEPT_OUT")
if [ $ACCEPT_EXIT -eq 0 ]; then
  ACCEPT_RESULT="✅ GREEN"
  echo "✅ GREEN (${ACCEPT_TIME}s) | $ACCEPT_STATS"
else
  ACCEPT_RESULT="❌ RED"
  echo "❌ RED  (${ACCEPT_TIME}s) | $ACCEPT_STATS"
  ERRORS=$((ERRORS+1))
fi
echo "   Coverage:"
show_coverage "$ACCEPT_OUT"

# ── Layer 4: UI tests (SKIP — Playwright phase 2) ─────────────────────────────
separator
echo "LAYER 4 — UI TESTS (Playwright)"
echo "⏭  SKIP — no tests/ui/ yet (add with Playwright when James has used v0.1)"

# ── Layer 5: Non-functional / OAT ─────────────────────────────────────────────
separator
echo "LAYER 5 — NON-FUNCTIONAL / OAT"

# Live ping of each verification API
echo ""
OAT_START=$(date +%s)
OAT_ERRORS=0

ping_api() {
  local name="$1"; local url="$2"; local accept_codes="${3:-200}"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 8 "$url" 2>/dev/null)
  if echo "$accept_codes" | grep -qw "$code"; then
    echo "   ✅ $name — HTTP $code"
  else
    echo "   ❌ $name — HTTP $code"
    OAT_ERRORS=$((OAT_ERRORS+1))
  fi
}

ping_api "OpenSky Network" \
  "https://opensky-network.org/api/states/all?lamin=52&lomin=-2&lamax=53&lomax=-1" \
  "200 429"
ping_api "wheretheiss.at (WL-007)" \
  "https://api.wheretheiss.at/v1/satellites/25544/positions?timestamps=1700000000&units=kilometers" \
  "200 000"
ping_api "Open-Meteo" \
  "https://api.open-meteo.com/v1/forecast?latitude=52.48&longitude=-1.89&hourly=cloud_cover&start_date=2026-01-01&end_date=2026-01-01&timezone=UTC" \
  "200"
ping_api "Celestrak (Starlink TLE)" \
  "https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=TLE" \
  "200"
ping_api "NOAA SWPC (Kp index)" \
  "https://services.swpc.noaa.gov/json/planetary_k_index_1m.json" \
  "200"
ping_api "Nominatim (reverse geocode)" \
  "https://nominatim.openstreetmap.org/reverse?lat=52.48&lon=-1.89&format=json" \
  "200"
ping_api "postcodes.io (postcode lookup)" \
  "https://api.postcodes.io/postcodes/B11BB" \
  "200"

OAT_END=$(date +%s)
OAT_TIME=$(( OAT_END - OAT_START ))

if [ $OAT_ERRORS -eq 0 ]; then
  OAT_RESULT="✅ GREEN"
  echo "✅ OAT (${OAT_TIME}s) — all verification APIs reachable"
else
  OAT_RESULT="❌ RED ($OAT_ERRORS API(s) unreachable)"
  echo "❌ OAT (${OAT_TIME}s) — $OAT_ERRORS API(s) unreachable"
  ERRORS=$((ERRORS+1))
fi

echo "⏭  Perf — no benchmarks yet"
echo "⏭  Usability — James field test (HDD-001)"

# ── Summary ────────────────────────────────────────────────────────────────────
END_TIME=$(date +%s)
TOTAL_TIME=$(( END_TIME - START_TIME ))
separator
echo ""
echo "╔════════════════════════════════════════════════════════════════════════╗"
printf "║  UH PIPELINE REPORT — %-49s║\n" "$(date '+%Y-%m-%d %H:%M')"
echo "╠════════════════════════════════════════════════════════════════════════╣"
printf "║  %-14s %-12s %8s %8s %6s %7s ║\n" "Layer"        "Result"    "Stmt%"    "Branch%"   "Time"  "Bugs"
printf "║  %-14s %-12s %8s %8s %6s %7s ║\n" "──────────────" "──────────" "──────" "───────"  "────"  "──────"
printf "║  %-14s %-12s %8s %8s %5ss %7s ║\n" "0 Auth"       "$AUTH_RESULT"   "—"             "—"                "$AUTH_TIME"   "—"
printf "║  %-14s %-12s %8s %8s %5ss %7s ║\n" "1 Unit"       "$UNIT_RESULT"   "${UNIT_LINE}"  "${UNIT_BRANCH}"   "$UNIT_TIME"   "$UNIT_BUGS"
printf "║  %-14s %-12s %8s %8s %5ss %7s ║\n" "2 Contract"   "$CONTRACT_RESULT" "—"           "—"                "$CONTRACT_TIME" "$CONTRACT_BUGS"
printf "║  %-14s %-12s %8s %8s %5ss %7s ║\n" "3 Acceptance" "$ACCEPT_RESULT" "${ACCEPT_LINE}" "${ACCEPT_BRANCH}" "$ACCEPT_TIME" "$ACCEPT_BUGS"
printf "║  %-14s %-12s %8s %8s %5ss %7s ║\n" "4 UI"         "⏭  SKIP"       "—"             "—"                "—"            "—"
printf "║  %-14s %-12s %8s %8s %5ss %7s ║\n" "5 OAT"        "$OAT_RESULT"   "—"             "—"                "$OAT_TIME"    "—"
echo "╠════════════════════════════════════════════════════════════════════════╣"
printf "║  %-70s ║\n" "Total time: ${TOTAL_TIME}s"
printf "║  %-70s ║\n" ""
if [ $ERRORS -eq 0 ]; then
  printf "║  %-70s ║\n" "✅  ALL GREEN — safe to merge"
else
  printf "║  %-70s ║\n" "❌  ${ERRORS} LAYER(S) RED — do not merge"
fi
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

[ $ERRORS -eq 0 ] && exit 0 || exit 1
