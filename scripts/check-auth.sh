#!/bin/bash
# Universal Harmonix — Auth canary
# UH has no Cloudflare workers yet. Checks: Node version, external API reachability.
# Returns exit 0 (GREEN) or exit 1 (RED — stop pipeline).

ERRORS=0

# Check 1: Node >= 20
NODE_VER=$(node --version 2>/dev/null | grep -oP '(?<=v)\d+')
if [ -z "$NODE_VER" ]; then
  echo "RED: Node.js not found"
  ERRORS=$((ERRORS+1))
elif [ "$NODE_VER" -lt 20 ]; then
  echo "RED: Node.js v${NODE_VER} — requires v20+"
  ERRORS=$((ERRORS+1))
else
  echo "GREEN: Node.js v${NODE_VER}"
fi

# Check 2: OpenSky Network reachable
OPENSKY=$(curl -s -o /dev/null -w "%{http_code}" --max-time 8 \
  "https://opensky-network.org/api/states/all?lamin=52&lomin=-2&lamax=53&lomax=-1" 2>/dev/null)
if [ "$OPENSKY" = "200" ] || [ "$OPENSKY" = "429" ]; then
  # 429 = rate limited but reachable — acceptable
  echo "GREEN: OpenSky Network reachable (HTTP $OPENSKY)"
elif [ "$OPENSKY" = "000" ]; then
  echo "RED: OpenSky Network unreachable"
  ERRORS=$((ERRORS+1))
else
  echo "RED: OpenSky Network returned HTTP $OPENSKY"
  ERRORS=$((ERRORS+1))
fi

# Check 3: Open-Meteo reachable
OPENMETEO=$(curl -s -o /dev/null -w "%{http_code}" --max-time 8 \
  "https://api.open-meteo.com/v1/forecast?latitude=52.48&longitude=-1.89&hourly=cloud_cover&start_date=2026-01-01&end_date=2026-01-01&timezone=UTC" 2>/dev/null)
if [ "$OPENMETEO" = "200" ]; then
  echo "GREEN: Open-Meteo reachable"
elif [ "$OPENMETEO" = "000" ]; then
  echo "RED: Open-Meteo unreachable"
  ERRORS=$((ERRORS+1))
else
  echo "RED: Open-Meteo returned HTTP $OPENMETEO"
  ERRORS=$((ERRORS+1))
fi

# Check 4: wheretheiss.at reachable (WARN only — free external API, transient outages acceptable)
ISS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 8 \
  "https://api.wheretheiss.at/v1/satellites/25544/positions?timestamps=1700000000&units=kilometers" 2>/dev/null)
if [ "$ISS" = "200" ]; then
  echo "GREEN: wheretheiss.at reachable"
else
  echo "SKIP: wheretheiss.at unreachable (HTTP $ISS) — WL-007 open. ISS check returns unverified in-app."
fi

echo ""
if [ $ERRORS -gt 0 ]; then
  echo "CANARY: RED — $ERRORS check(s) failed. Verify network and API availability."
  exit 1
else
  echo "CANARY: GREEN — all checks passed"
  exit 0
fi
