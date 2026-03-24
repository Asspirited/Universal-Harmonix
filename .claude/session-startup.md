# Universal Harmonix — Session Startup
# Extends: /home/rodent/leanspirited-standards/protocols/session-startup.md

---

## Project context (read before anything else)

**Product:** Universal Harmonix — UAP investigation and verification app
**Client/collaborator:** James Brodie, BUFOG investigator, 25+ years experience
**Theory underpinning the app:** Universal Harmonix — UAP and paranormal phenomena
linked through frequencies rooted in String Theory. Human consciousness interacts
with multi-dimensional beings through these frequencies.
**Current status:** v0.1 skeleton. Building fresh from a Base44 prototype James
had been struggling with for years.

**Core loop:**
Experience something → Log it → Cross-check against known phenomena → What's
left unexplained is genuinely interesting

**Why this matters:** This is what separates Universal Harmonix from Enigma and Phenom.
They're logging tools. James's insight is the verification step. A sighting that
survives cross-checking is a different class of evidence.

---

## Mandatory startup sequence

### Step 1: Orientation
State current date and confirm which product.

### Step 2: Read project files
Read `.claude/session-startup.md` (this file) in full.
Read `.claude/session-insession.md` in full.

### Step 3: Shared session state
Read `.claude/shared-session-state.md` — carries what was done last session,
what James has tested, what's open.

### Step 4: Backlog review
Read `docs/backlog.md` (BL — features/bugs). Read `docs/waste-log.md` (WL — waste observations and risks as potential waste).
Identify:
- Any items marked Critical or In Progress
- Top 3 by priority

### Step 5: HDD hypothesis status

```
HDD-001: Cross-checking a sighting against all known phenomena at time/place
         delivers enough signal-to-noise improvement that investigators can
         confidently distinguish unexplained sightings from explained ones.
Status:   OPEN
Evidence: None yet — James hasn't submitted a real sighting
Next:     James tests first real sighting via skeleton app
```

If HDD-001 is OPEN, state: "Today's work should serve James's ability to
log and verify a real sighting unless a pivot is agreed and recorded as an ADR."

### Step 6: SWOT
Run delta SWOT if any strategic input has arrived since last session
(James feedback, new API availability, competitive product updates).

### Step 7: Confirm session goal
State the one thing that makes this session a success. Confirm with Rod.

---

## Key reference

- App: `app/index.html` (vanilla JS SPA, no build step)
- Backlog: `docs/backlog.md` (prefix: UH-)
- ADRs: `docs/decisions/`
- SWOT: `docs/swot/`
- Open questions log: `docs/open-questions.md`

## Verification stack

| Source | Coverage | API | Key needed? |
|--------|----------|-----|-------------|
| OpenSky Network | Aircraft (ADS-B) | REST, bounding box + time | No (anonymous) |
| wheretheiss.at | ISS real-time | REST | No |
| N2YO | All satellites | REST | Yes — free registration |
| Open-Meteo | Weather: cloud, visibility, wind | REST | No |
| UK Met Office (static) | Radiosondes — Lerwick, Watnall, Herstmonceux, Camborne | Static schedule logic | N/A |
| Manual | Drones | User input | N/A |

## Known gaps / open questions

See `docs/open-questions.md` (UH-Q001–010)
