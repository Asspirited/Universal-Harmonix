# Universal Harmonix — Shared Session State
# Written by Claude Code at session close. Read by Claude.ai at session start.
# Last updated: 2026-03-25 (Session 8)

---

## What happened this session

### Deployment fix — data files not in Pages artifact ✅ DONE
- `pages.yml` was deploying only `app/` — `data/` was never included
- UK Sightings Database tab was broken on prod since it was built
- Fix: added `cp -r data app/data` step in pages.yml before artifact upload

### UH-040 — Sightings Map tab ✅ DONE
- New 4th tab (desktop: "Sightings Map", mobile: "Map")
- Leaflet.js + Leaflet.markercluster via CDN, CartoDB Dark Matter tiles
- 2,050 sightings plotted; markers colour-coded by Hynek (CE*=purple glow, DD=amber, NL=blue, RV=green)
- Enriched popup: date, location, Hynek + significance label, shape, description, Kp, moon phase, cloud cover, Google search link
- Kp ≥ 4 toggle — visual UH hypothesis test
- Near Me button, filter bar (shape, Hynek, year)
- Shared ukdbAllRecords dataset — both UKDB and Map load nuforc-uk-enriched.json once

### UH-034 — Correlation Explorer ✅ DONE
- New 5th tab (desktop: "Correlations", mobile: "Explore")
- correlations.js: pure functions (buildKpHynekCrossTab, crossTabToRows, buildHynekDistribution, crossTabToCsv, hynekGroup)
- Chart.js 4.4.2 — stacked bar (Kp × Hynek) + doughnut (Hynek distribution), full dark theme
- Cross-tab table: count + % per Kp bucket × Hynek group, elevated rows highlighted
- Export CSV button
- 21 unit + 6 acceptance tests

### UH-035 — BUFOG archive ✅ PARTIAL
- 38 published case reports scraped from reported-sightings.blogspot.com
- Geocoded 38/38 (3 manual fixes), shapes normalised to taxonomy
- Saved to data/bufog-cases-clean.json
- Outcomes: 17 unexplained / 15 inconclusive / 6 explained
- Hynek: CE1 x7, CE2 x4, DD x2, CE5 x1, unknown x24
- Source tile updated in app
- **24 records need Hynek classification from James**
- James message drafted + 24-record table prepared for sending

### UH-041 — Raised (not built)
- Load BUFOG cases into UKDB tab and Sightings Map
- Depends on James reviewing 24 unknown Hynek records
- Three Amigos required before implementation

### WL-UH-009 — SW cache version
- Root cause of missing tabs on mobile: stale uh-v2 SW cache
- Bumped to uh-v3
- Added mandatory SW bump rule to session-insession.md

### CD3 assessment run
- UH-035 (10.0) > UH-036 (6.0) > UH-038 (4.5) > UH-037 (2.5)

### Test totals end of session
- Unit: 190 passing (was 169)
- Acceptance: 43 passing (was 37)
- All green — no failures

---

## Pipeline status

- 190 unit ✅ | 43 acceptance ✅
- Committed and pushed: main — commit a65e0d9
- Live at: https://asspirited.github.io/Universal-Harmonix/

---

## Backlog status

- UH-001–017: Done
- UH-030–034: Done
- UH-035: Partial — 38 cases scraped, James review pending (24 unknown Hynek)
- UH-036: Open — UFO Identified data sharing (Low)
- UH-037: Open — MOD National Archives OCR (Low)
- UH-038: Open — AI tagging v2 D–H (Low)
- UH-039: Done
- UH-040: Done — Sightings Map
- UH-041: Open — Load BUFOG into UKDB + Map (High, depends on UH-035 James review)

---

## HDD-001 status

```
HDD-001: Verification step delivers signal-to-noise improvement for investigators
Status:   OPEN
Evidence: Correlation Explorer live — Kp × Hynek cross-tab available in-browser.
          Map's Kp ≥ 4 toggle is a direct visual test of the UH hypothesis.
          James has not yet run the hypothesis test or submitted a real sighting.
Next:     1) James opens live app and uses Kp ≥ 4 toggle on the map
          2) James reviews Correlations tab cross-tab
          3) James submits a real sighting via Log Sighting tab
Owner:    James (all three actions)
```

---

## Key decisions this session

- DECISION 2026-03-25: Load nuforc-uk-enriched.json for both UKDB and Map tabs (shared dataset) — avoids double-fetch, enriched data is superset of tagged
- DECISION 2026-03-25: SW cache version must be bumped on every index.html/JS change — added to mandatory session-insession checklist
- DECISION 2026-03-25: BUFOG scrape from Blogspot mirror (Wix main site not scrapeable without headless browser)

---

## James message status

- Full message drafted including 24-record Hynek review table
- **NOT YET SENT** — Rod to send
- Key ask: classify 24 unknown Hynek records (reply format: `3:DD, 7:NL` etc.)
- Secondary ask: export additional cases from archive

---

## Top 3 for next session

1. **UH-041** — Load BUFOG data into UKDB tab + map (once James replies with Hynek classifications — may need to build speculatively and patch when he responds)
2. **Send James message** — if not already done
3. **UH-036** — Contact UFO Identified re: data sharing

## Session goal for next session

Get BUFOG cases visible on the Sightings Map alongside NUFORC data.

## Blockers

- UH-041 fully clean depends on James classifying 24 unknown Hynek records
- HDD-001 validation still requires James to actually use the live app
