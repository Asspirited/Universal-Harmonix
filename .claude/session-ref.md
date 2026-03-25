# Universal Harmonix — Session Reference (for Claude.ai)
# Written at session closedown by Claude Code. Upload to Claude.ai Project Knowledge.
# Last updated: 2026-03-25 (Session 9)

---

## Project

**Product:** Universal Harmonix — UAP investigation and verification app
**Collaborator:** James Brodie, BUFOG investigator
**Live app:** https://asspirited.github.io/Universal-Harmonix/
**Repo:** github.com/Asspirited/Universal-Harmonix
**Local:** /home/rodent/Universal-Harmonix/
**Tech:** Vanilla JS SPA, no build step. GitHub Pages. app/index.html entry point.

---

## Current state (end of Session 9, 2026-03-25)

### Built and live
- 6-tab app: **Dashboard** (default) / Log Sighting / My Records / UK Sighting Database / Sightings Map / Correlations
- Dashboard: LCARS mission control, full-width, collapsible left sensor panel. Top strip: Kp/Cloud/Aurora/ISS. Three-column grid.
- Wordmark: Special Elite (Universal) + Exo 2 900 (Harmonix)
- 14-point verification engine
- 2,050 NUFORC UK sightings, enriched (Kp + weather + moon)
- Sightings Map (Leaflet, Hynek colour-coded, Kp ≥ 4 toggle)
- Correlation Explorer (Kp × Hynek cross-tab, Chart.js, CSV export)
- BUFOG scrape: 38 cases in data/bufog-cases-clean.json (partial — 18–24 unknowns need James Hynek classification)
- SW: uh-v7 — **network-first for HTML** (hard refresh now works; no more forced DevTools cache clears)
- Tests: 190 unit + 43 acceptance, all green

### James message
Drafted with Hynek review table. **NOT YET SENT** — Rod to send.

### Dashboard sky cells
Kp/Aurora/Solar Wind show `—` on load — not yet wired to NOAA. Cloud + ISS populate once GPS fires.

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

## Session 10 goal

Get BUFOG cases visible on the Sightings Map alongside NUFORC data (UH-041).

---

## HDD-001: OPEN

James has not yet submitted a real sighting or run the Kp hypothesis test.
Next: James opens live app → Kp ≥ 4 toggle on map → Correlations tab → submit real sighting.
