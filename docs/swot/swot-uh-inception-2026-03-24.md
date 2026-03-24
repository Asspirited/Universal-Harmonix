# SWOT — Universal Harmonix — Inception
# Date: 2026-03-24
# Context: First session. Establishing product position before v0.1 build.

---

## Strengths

- **Distinctive core loop** — verification-first is genuinely different from Enigma/Phenom
- **Expert domain knowledge** — 25 years of investigation in the founder; James knows what investigators actually need
- **Real user for beta** — James + BUFOG circle are motivated, knowledgeable testers who will give honest feedback
- **Free verification stack** — OpenSky, Open-Meteo, wheretheiss.at require no keys; low operational cost
- **Clean slate** — no legacy Base44 code to work around; rebuilding properly

## Weaknesses

- **No existing users** — the Base44 prototype had unknown adoption; we don't know the actual audience size
- **HDD-001 unvalidated** — the core hypothesis (verification delivers signal) has not been tested with a real sighting yet
- **Photo storage gap** — v0.1 has no persistent photo storage; evidence preservation is half-done
- **Drone gap** — no public API exists for drone positions; manual input is a workaround
- **Radiosonde logic is static** — UK only, fixed launch sites, no real-time data
- **Single developer / two Claudes** — bandwidth constraint on build velocity

## Opportunities

- **UAP disclosure moment** — 2025–2026 is a period of heightened mainstream interest in UAP following US government hearings; timing is good
- **BUFOG as launch community** — embedded expert community provides credibility and a real testing ground
- **Marine/ground phenomena gap** — most UAP apps are aerial-only; Universal Harmonix explicitly covers ground and sea
- **Universal Harmonix theory** — if the frequency correlation layer is ever built, it would be genuinely novel — no competitor has anything like it
- **N2YO + OpenSky free tier** — the verification stack is viable without any infrastructure cost at beta scale

## Threats

- **Enigma/Phenom incumbency** — established communities, existing data, network effects
- **Platform risk (past)** — Base44/Wix acquisition shows what happens with dependency on a vibe-coding platform; this rebuild removes that risk
- **API reliability** — OpenSky is community-run; N2YO is independent; both could change terms
- **James's time** — if James is the only real user driving requirements, and he's busy with BUFOG work, feedback loops could be slow
- **Scope creep to theory** — the Universal Harmonix frequency layer is intellectually fascinating but could consume build time before the basics are validated

---

## CD3+SWOT initial sequencing

| Item | C | D | D (complexity) | SWOT | Score |
|------|---|---|----------------|------|-------|
| v0.1 skeleton — log + verify | 5 | 5 | 3 | S+O (+3) | (5+5-3)+(3×1.5) = 11.5 |
| Photo persistence (backend storage) | 4 | 2 | 4 | W (+1) | (4+2-4)+(1×1.5) = 3.5 |
| N2YO satellite integration (full) | 3 | 2 | 2 | O (+1) | (3+2-2)+(1×1.5) = 4.5 |
| Export/sharing for BUFOG reports | 3 | 1 | 3 | O+W (+2) | (3+1-3)+(2×1.5) = 4 |
| UH frequency correlation layer | 5 | 1 | 5 | S+O (+2) | (5+1-5)+(2×1.5) = 4 |
| Account/auth (multi-user) | 2 | 3 | 4 | O (+1) | (2+3-4)+(1×1.5) = 2.5 |

**Confirmed sequence:**
1. v0.1 skeleton (this session) — overwhelmingly highest priority
2. N2YO full integration
3. Export/sharing (BUFOG format)
4. Photo persistence
5. UH frequency layer (phase 2+, after HDD-001 confirmed)
6. Multi-user auth (after community expansion begins)
