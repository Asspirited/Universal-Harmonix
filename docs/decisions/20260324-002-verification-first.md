# ADR-002: Verification-first architecture

**Date:** 2026-03-24
**Status:** Decided
**Deciders:** Rod (LeanSpirited), James Brodie (domain expert)
**Tags:** architecture, product

## Context

Most UAP apps (Enigma, Phenom) are logging tools with community features.
James's 25 years of investigation have led to the insight that the verification step —
cross-checking a sighting against all known mundane phenomena at time and place —
is where the real investigative value lies.

## Decision

Verification runs automatically on every sighting submission. It is not optional.
The verification panel is a first-class citizen of every sighting record, not an add-on.
The verdict (UNEXPLAINED / PARTIAL MATCH / LIKELY EXPLAINED / UNVERIFIED) is the
primary output of the app.

## Alternatives considered

| Option | Why rejected |
|--------|-------------|
| Log first, verify later (manual trigger) | The friction would cause investigators to skip verification |
| Community-only verification (crowd-sourced) | Too slow; James needs real-time signal |
| No verification (just logging) | That's Enigma. Not differentiated. |

## Consequences

**Positive:** The core hypothesis (HDD-001) is testable from day one. Every sighting has a verification record. James can compare verified vs. unverified sightings immediately.
**Negative / trade-offs:** API failures during verification create a degraded-but-not-broken experience; each source must fail gracefully with a clear "could not verify" state.
**Neutral:** Adds API call overhead on every submission; acceptable at beta scale.

## Linked items

- Backlog: UH-001 (core log + verify)
- Related: ADR-001 (vanilla JS)
- HDD: HDD-001
