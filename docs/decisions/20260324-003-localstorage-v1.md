# ADR-003: localStorage for sighting persistence (v1)

**Date:** 2026-03-24
**Status:** Decided
**Deciders:** Rod (LeanSpirited)
**Tags:** architecture, data

## Context

Universal Harmonix v0.1 is a beta for James + small BUFOG circle.
We need persistence without building or hosting a backend.

## Decision

All sighting records (including verification results) are stored in browser localStorage.
Photos are not persisted in v1 — they can be noted as "photo taken" but the image data
is not stored.

## Alternatives considered

| Option | Why rejected |
|--------|-------------|
| Cloudflare Workers + D1 | Premature before HDD-001 validated |
| Supabase/Firebase | Third-party dependency; overkill for beta |
| No persistence | Records would be lost on refresh — unacceptable for investigators |

## Consequences

**Positive:** Zero backend. James can run the app locally with no configuration. Fast to ship.
**Negative / trade-offs:** Data is device-specific; no sync across devices; no backup. Photos not preserved. Known trade-off — accepted for v1.
**Neutral:** localStorage has a ~5MB limit; fine for text records at beta scale.

## Linked items

- Backlog: UH-004 (cloud sync — future)
- Backlog: UH-005 (photo storage — future)
- Superseded by: new ADR when backend is introduced
