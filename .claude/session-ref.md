# Universal Harmonix — Session Reference (for Claude.ai)
# Written at session closedown by Claude Code. Upload to Claude.ai Project Knowledge.
# Last updated: 2026-03-25 (Session 10)

---

## Project

**Product:** Universal Harmonix — UAP investigation and verification app
**Collaborator:** James Brodie, BUFOG investigator
**Live app:** https://asspirited.github.io/Universal-Harmonix/
**Repo:** github.com/Asspirited/Universal-Harmonix
**Local:** /home/rodent/Universal-Harmonix/
**Tech:** Vanilla JS SPA, no build step. GitHub Pages. app/index.html entry point.

---

## Current state (end of Session 10, 2026-03-25)

### Built and live
- 6-tab app: **Dashboard** (default) / Log Sighting / My Records / UK Sighting Database / Sightings Map / Correlations
- Dashboard: LCARS mission control, full-width, collapsible left sensor panel. Top strip: Kp/Cloud/Aurora/ISS (Kp/Aurora show `—` until wired to NOAA — UH-043).
- Wordmark: Special Elite (Universal) + Exo 2 900 (Harmonix)
- 14-point verification engine
- **2,088 combined sightings**: 2,050 NUFORC UK enriched + 38 BUFOG cases — both loaded and merged
- UKDB tab: source filter (All / NUFORC / BUFOG), BUFOG badge in table
- Sightings Map: BUFOG cases plotted with Hynek colours, popups show source badge + outcome chip
- Correlation Explorer (Kp × Hynek cross-tab, Chart.js, CSV export)
- SW: uh-v8 — network-first for HTML
- Tests: 193 unit + 19 acceptance + 43 contract — all GREEN (Celestrak OAT pre-existing WL-UH-008)

### James message
Drafted with 24-record Hynek review table. **NOT YET SENT** — Rod to send.

### Dashboard sky cells
Kp/Aurora show `—` on load — not yet wired to NOAA (UH-043). Cloud + ISS populate once GPS fires.

---

## Open backlog

| # | Item | Priority |
|---|------|----------|
| UH-043 | Dashboard: wire Kp/aurora/cloud from NOAA on tab open | Medium |
| UH-035 | James to classify 18–24 unknown Hynek records | Medium |
| UH-036 | UFO Identified data sharing | Low |
| UH-037 | MOD Archives OCR | Low |
| UH-038 | AI tagging v2 D–H | Low |

---

## Session 11 goal

Wire Dashboard sky-data cells (Kp, Aurora, Cloud Cover) so they show live values on landing, not `—`.

---

## HDD-001: OPEN

James has not yet submitted a real sighting.
Next: Rod sends James message → James classifies 18 unknowns → James opens app and submits real sighting.
