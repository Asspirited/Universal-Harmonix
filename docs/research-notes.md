# Universal Harmonix — Research Notes
# Session: 2026-03-24

---

## James Brodie — background

- UFO and paranormal investigator, 25+ years, West Midlands
- Embedded in the serious UK investigator community through BUFOG (Birmingham UFO Group)
- Personal close encounter in late teens sparked his interest
- Men in Black experience ten years later — a very specific data point that distinguishes him
- Lectured at BUFOG on Universal Harmonix theory

## Universal Harmonix theory

Hypothesis: UAP and paranormal phenomena are linked through a universal set of frequencies
rooted in String Theory. The human conscious mind interacts with multi-dimensional beings
through these frequencies.

This is James's distinctive intellectual contribution — not a casual belief but a
structured theoretical framework developed over decades of investigation.

## Prior app — Base44 prototype

James had been building something on `sky-watch-ufo-tracker-06c3c05e.base44.app` for years.
Base44 is a vibe-coding platform (AI app builder) — acquired by Wix in mid-2025.

The Base44 prototype is a good proof of concept but has likely hit the ceiling of:
- Robustness for real-world use
- Extendability beyond what the AI generator can manage
- Platform dependency risk (Wix acquisition)

The rebuild treats the Base44 app as a spec, not as working code to port.

## Market landscape

- **Enigma** and **Phenom**: Primary competitors. Straight reporting/logging tools with community features.
- **Universal Harmonix differentiator**: The verification step. Not just logging — cross-checking.
  A sighting that survives verification is a different class of evidence from an unverified report.

## Verification API research (2026-03-24)

| Source | Coverage | API | Key needed? | Notes |
|--------|----------|-----|-------------|-------|
| OpenSky Network | Aircraft (ADS-B) — commercial, private, military | REST, bounding box + time | No (anonymous) | Rate limited. Historical data (>1hr) needs free account |
| wheretheiss.at | ISS position | REST | No | Real-time + timestamp lookup |
| N2YO | All satellites overhead | REST | Yes — free at n2yo.com | Visual pass data over a location |
| Open-Meteo | Cloud cover, visibility, wind, precip | REST | No | Historical data freely available |
| UK Met Office | Radiosondes | None — static schedule | N/A | Launches at 00:00 and 12:00 UTC from Lerwick, Watnall, Herstmonceux, Camborne |
| Drone registry | Drones | None public exists | N/A | Manual user input for v1 |

## BUFOG context

James is embedded in a serious investigator community — not hobbyists. The initial user group
(James + small BUFOG circle) is a perfect closed beta: motivated, knowledgeable, and will give
real feedback if the verification step doesn't deliver.
