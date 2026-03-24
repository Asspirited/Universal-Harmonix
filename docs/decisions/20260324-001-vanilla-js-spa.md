# ADR-001: Vanilla JS SPA — no framework

**Date:** 2026-03-24
**Status:** Decided
**Deciders:** Rod (LeanSpirited)
**Tags:** architecture

## Context

Universal Harmonix v0.1 is being rebuilt from a Base44 vibe-coded prototype.
The verification suite makes parallel API calls to 5 sources. We need a web app
that is fast to build, easy for James to open locally or host anywhere, and
requires no build toolchain.

## Decision

Build the app as a single `app/index.html` file with vanilla JS. No framework,
no build step, no package.json. Open the file in a browser and it works.

## Alternatives considered

| Option | Why rejected |
|--------|-------------|
| React/Vite | Build toolchain overhead unjustified for a single investigator beta |
| Vue | Same reason |
| Base44 continued | Platform dependency risk; hit ceiling of AI-generated code |

## Consequences

**Positive:** Zero friction for James to run locally. No deployment infrastructure needed for v0.1. Fast to iterate.
**Negative / trade-offs:** As complexity grows (auth, cloud sync, sharing), vanilla JS will get harder to maintain. This is a known trade-off accepted for beta validation.
**Neutral:** Code is readable and auditable without knowing any framework conventions.

## Linked items

- Supersedes: N/A (first ADR)
- Related: ADR-002 (verification architecture)
