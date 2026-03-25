# Universal Harmonix — Session In-Session Protocol
# Extends: /home/rodent/leanspirited-standards/protocols/session-insession.md

---

## Standard triggers (inherit from canonical)
See `/home/rodent/leanspirited-standards/protocols/session-insession.md`

---

## UH-specific triggers

### Trigger: James sends a real sighting to test
→ This is the HDD-001 validation event. Record it as evidence.
→ Note: did the verification panel actually help? What matched? What was left?
→ Update HDD-001 status in `.claude/shared-session-state.md`
→ Raise UH-backlog item for any gaps discovered

### Trigger: New API or data source identified
→ Assess: what gap does it fill? (drones, marine radar, NOTAM, etc.)
→ CD3+SWOT score it before adding to backlog
→ Write ADR if it changes the architecture

### Trigger: James describes a Universal Harmonix frequency correlation
→ This is design input for a future phase — do not build it yet
→ Raise a backlog item: UH-NNN, Loop: HDD, Priority: Low (phase 2+)
→ Note in open-questions.md if it generates new questions

### Trigger: User outside BUFOG wants to use the app
→ This is the expansion hypothesis. Don't build for them yet.
→ Record it — it's HDD-002 territory (broader community value)
→ Raise backlog item for account/auth consideration

### Trigger: Verification returns ambiguous result
→ The verdict engine is the core hypothesis. Any ambiguity is a learning.
→ Log it in `docs/open-questions.md` with the sighting details
→ Raise backlog item if it reveals a gap in the verification logic

---

## RAISE NEW WORK sequence

When a bug, gap, idea, or observation emerges mid-session:
1. Assign UH-NNN immediately (next number in `docs/backlog.md`)
2. Write the item to backlog in full (Story + Acceptance Criteria)
3. No sub-items — every item is first-class
4. Announce: "Raised UH-NNN: [title]"

---

## Checkpointing

Every 3 backlog items closed OR every 5 significant changes: announce checkpoint.
Offer to continue or stop. Do not silently bypass.

---

## MANDATORY — Service worker cache version on every HTML/JS change

Any commit that modifies `index.html` or adds/changes files in `app/js/` MUST bump the cache version in `app/sw.js`:
- Current: `uh-v3`
- Format: `uh-v{N+1}`

**Why:** The SW intercepts all same-origin requests. Users (including on mobile) will receive the old cached `index.html` regardless of hard refresh until the SW detects a byte change in `sw.js` itself. See WL-UH-009.

Checklist (run before every such commit):
- [ ] `const CACHE = 'uh-vN'` incremented in `app/sw.js`
- [ ] New version noted in WL-UH-009

---

## MANDATORY — Desktop + Mobile nav in lock step

Any change to desktop tabs (`.tabs` in `<header>`) MUST be mirrored to mobile bottom nav (`.bottom-nav`) in the same commit.
Any change to mobile bottom nav MUST be mirrored to desktop tabs in the same commit.

Checklist (run before every nav-related commit):
- [ ] Desktop tab labels match mobile bottom nav labels (allowing abbreviation for space — but same meaning)
- [ ] `data-tab` values are identical in both
- [ ] Tab count matches — no orphaned tabs on either surface
- [ ] New tab visible and tappable on mobile (44px min-height, bottom-nav-item present)

This is non-negotiable. Skipping it = waste log entry.

---

## UH-specific UI/UX lens

Who is using this, on what device, under what pressure?
→ James or a BUFOG member has just experienced something unusual.
→ They may be outdoors, at night, on mobile.
→ They are emotionally heightened — curious, possibly shaken.
→ The UI must be CALM, FAST, and TRUSTWORTHY.
→ No faff between "I saw something" and "here's what it probably was."

What is the ONE thing each screen must make effortless?
→ Log screen: submitting a sighting (date/time/location/description) in under 2 minutes
→ Verification panel: understanding what matched and what didn't at a glance
→ Records tab: finding a past sighting quickly

Professional user test (adapted):
→ Would James trust this to present as evidence to a senior BUFOG investigator?
→ Does the verification result look credible, not cobbled together?
