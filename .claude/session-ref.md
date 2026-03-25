# Universal Harmonix — Session Reference (for Claude.ai)
# This file is written at every session closedown by Claude Code.
# Claude.ai reads this to get current project state.
# Last updated: 2026-03-25 (Session 9 startup)

---

## Project

**Product:** Universal Harmonix — UAP investigation and verification app
**Collaborator:** James Brodie, BUFOG investigator
**Live app:** https://asspirited.github.io/Universal-Harmonix/
**Repo:** github.com/Asspirited/Universal-Harmonix
**Local:** /home/rodent/Universal-Harmonix/
**Tech:** Vanilla JS SPA, no build step. GitHub Pages.

---

## Current state (as of Session 8, 2026-03-25)

### Built and live
- 5-tab app: Log Sighting / My Records / UK Sighting Database / Sightings Map / Correlations
- 14-point verification engine
- 2,050 NUFORC UK sightings, enriched with Kp + weather + moon phase
- Sightings Map (Leaflet, colour-coded by Hynek, Kp ≥ 4 toggle)
- Correlation Explorer (Kp × Hynek cross-tab, Chart.js, CSV export)
- BUFOG scrape: 38 cases in data/bufog-cases-clean.json (partial — 18–24 unknowns need James Hynek classification)
- SW cache: uh-v3
- Tests: 190 unit + 43 acceptance, all green

### James message
Drafted with 24-record Hynek review table. **NOT YET SENT** — Rod to send.

---

## Open backlog

| # | Item | Priority |
|---|------|----------|
| UH-041 | Load BUFOG cases into UKDB + Map | High |
| UH-035 | James to classify 18–24 unknown Hynek records | Medium |
| UH-036 | UFO Identified data sharing | Low |
| UH-037 | MOD Archives OCR | Low |
| UH-038 | AI tagging v2 D–H | Low |

---

## Session 9 goal

Get BUFOG cases visible on the Sightings Map alongside NUFORC data (UH-041).

---

## HDD-001: OPEN

James has not yet submitted a real sighting or run the Kp hypothesis test.
Next action: James opens live app, uses Kp ≥ 4 toggle, submits a real sighting.
