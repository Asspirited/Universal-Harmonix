# Universal Harmonix — Watchlist (WL)
# Auth failures, API outages, platform risks, process issues.
# Separate from backlog (BL) — operational and risk tracking only.
# Last updated: 2026-03-24

---

## WL-001 — Base44 platform dependency risk (resolved by rebuild)

**Status:** Closed
**Raised:** 2026-03-24
**Severity:** High

Wix acquired Base44 in mid-2025. James's original prototype was locked to their platform.
Resolved by this rebuild as a standalone vanilla JS app with no platform dependency.

---

## WL-002 — OpenSky rate limiting (anonymous tier)

**Status:** Open — monitor
**Raised:** 2026-03-24
**Severity:** Medium

OpenSky anonymous access is rate-limited and provides only near-real-time data.
Sightings older than ~1 hour will return "unverified" unless James registers for a free
OpenSky account.

Action: Ask James to register at opensky-network.org. Note in backlog.

---

## WL-003 — N2YO satellite data requires API key

**Status:** Open — action required
**Raised:** 2026-03-24
**Severity:** Medium

Satellite verification (N2YO) requires a free API key. Without it, satellite data is unavailable.
v0.1 prompts the user to enter their key; it is stored in localStorage.

Action: James to register at n2yo.com/login/?action=register before first test.

---

## WL-004 — wheretheiss.at historical data availability

**Status:** Open — monitor
**Raised:** 2026-03-24
**Severity:** Low

The wheretheiss.at API accepts timestamp lookups but availability of old positions is not
documented. If James tests with old sightings, ISS data may fail silently.

Action: Test with a known historical timestamp. Document behaviour.

---

## WL-005 — No drone verification data exists anywhere

**Status:** Open — accepted gap
**Raised:** 2026-03-24
**Severity:** Low

There is no public API for real-time or historical drone positions. Drones are a manual
input field in v0.1. This is an accepted gap — no action until a source emerges.

---

## WL-006 — Open-Meteo historical data window

**Status:** Closed
**Raised:** 2026-03-24
**Closed:** 2026-03-24
**Severity:** Low

Resolved: `checkWeather` now selects the endpoint based on sighting age.
Dates older than 7 days use `archive-api.open-meteo.com/v1/archive` (ERA5, covers 1940–present minus ~5 days).
Recent dates (within 7 days) use `api.open-meteo.com/v1/forecast`.
Both endpoints share identical response shape. Contract tests cover both paths.

---

## WL-007 — wheretheiss.at API outage / reliability

**Status:** Open — active issue
**Raised:** 2026-03-24
**Severity:** Medium

wheretheiss.at returned HTTP 000 (timeout) during pipeline run 2026-03-24.
The app handles this gracefully (returns `unverified` for ISS check).
The pipeline canary was blocking all work due to this external outage.

Actions:
1. Canary downgraded: wheretheiss.at is now WARN not RED (external free API — transient outage is acceptable).
2. Identify a backup ISS position API (e.g. Open Notify: open-notify.org/ISS-Location-Now.html — no historical data; n2yo.com — requires key but already tracked in WL-003).
3. Long term: consider n2yo.com as the ISS source since it requires the same key as WL-003 satellite data.
