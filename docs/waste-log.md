# Universal Harmonix — Waste Log (WL)
# WL = Waste Log. Items are waste observations or risks logged as potential waste.
# Last updated: 2026-03-24

---

## WL-UH-001 — Base44 platform lock-in

**Status:** Closed
**Category:** Risk (potential waste)
**Severity:** High
**Raised:** 2026-03-24
**Closed:** 2026-03-24

**Observation:** James's original prototype was built on Base44, acquired by Wix in 2025. All future work would have been at Wix's discretion — pricing, API changes, or shutdown.

**Waste impact:** Total rework cost if platform changed or shut down. Estimated: entire project.

**Action:** Resolved by rebuild as standalone vanilla JS PWA. No platform dependency.

---

## WL-UH-002 — OpenSky anonymous tier silently fails for old sightings

**Status:** Open
**Category:** Defect (silent failure)
**Severity:** Medium
**Raised:** 2026-03-24

**Observation:** OpenSky anonymous access rate-limits historical queries. Sightings older than ~1 hour return "unverified" with no explanation to the user.

**Waste impact:** James logs a historical sighting, gets "unverified" for aircraft, assumes no aircraft — incorrect. Undermines trust in verification results.

**Action:** Ask James to register at opensky-network.org (free). Surface the limit in the UI so the user knows why.

---

## WL-UH-003 — N2YO satellite check silently disabled without API key

**Status:** Open
**Category:** Wait (blocked feature)
**Severity:** Medium
**Raised:** 2026-03-24

**Observation:** Satellite verification (N2YO) requires a free API key stored in localStorage. Without it, the entire satellite check is unavailable and returns "unverified".

**Waste impact:** James doesn't register → satellite check never runs → potential explanations missed.

**Action:** James to register at n2yo.com/login/?action=register before first real use.

---

## WL-UH-004 — wheretheiss.at historical position availability undocumented

**Status:** Open
**Category:** Risk (potential waste)
**Severity:** Low
**Raised:** 2026-03-24

**Observation:** wheretheiss.at accepts timestamp lookups but availability of historical ISS positions is not documented. Old sightings may fail silently.

**Waste impact:** Misleading "unverified" ISS result for valid old sightings.

**Action:** Test with a known historical timestamp and document the behaviour. If unreliable, replace with N2YO (already tracked in WL-UH-003).

---

## WL-UH-005 — No drone position data exists anywhere

**Status:** Accepted
**Category:** Risk (potential waste)
**Severity:** Low
**Raised:** 2026-03-24

**Observation:** No public API exists for real-time or historical drone positions. Drones are a manual input field only.

**Waste impact:** Drone sightings cannot be programmatically verified. Investigator must rely on witness self-report.

**Action:** Accepted gap. No action until a credible data source exists.

---

## WL-UH-006 — Open-Meteo historical data window gap

**Status:** Closed
**Category:** Defect
**Severity:** Low
**Raised:** 2026-03-24
**Closed:** 2026-03-24

**Observation:** `checkWeather` originally used only the forecast endpoint, which returns no data for sightings older than ~7 days.

**Waste impact:** All historical sightings returned "unverified" for weather — zero signal.

**Action:** Fixed. `checkWeather` now selects endpoint by sighting age: ERA5 archive for >7 days, forecast for recent. Both paths covered by contract tests.

---

## WL-UH-007 — wheretheiss.at transient outages block pipeline canary

**Status:** Open
**Category:** Wait (external dependency)
**Severity:** Medium
**Raised:** 2026-03-24

**Observation:** wheretheiss.at returned HTTP 000 (timeout) during a pipeline run. App handles it gracefully (returns "unverified") but the canary was RED, blocking all session work.

**Waste impact:** Blocked session start. Time lost diagnosing what was an external outage, not a code issue.

**Action:** Canary downgraded to WARN for wheretheiss.at (external free API — transient outages acceptable). Long-term: evaluate N2YO as ISS source since it requires the same key as WL-UH-003.

---

## WL-UH-008 — Celestrak TLE endpoints return 403 from Node.js / CI

**Status:** Open
**Category:** Risk (potential waste)
**Severity:** Medium
**Raised:** 2026-03-24

**Observation:** Celestrak TLE endpoints (Starlink group, visual group) return HTTP 403 from Node.js and WSL. Cloudflare/bot-protection blocks automated requests. Browser-based app likely unaffected.

**Waste impact:** Contract tests cannot run meaningfully from CI. If browser is also eventually blocked, Starlink and bright satellite detection breaks entirely.

**Action:** Contract tests skip on 403/5xx. James to confirm browser-based Starlink detection works. Long-term: Cloudflare Worker proxy for Celestrak TLE (same pattern as other CORS proxies in YGW).
