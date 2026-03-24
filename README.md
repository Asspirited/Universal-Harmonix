# Universal Harmonix — UAP Investigation & Verification App

Built for James Brodie and the BUFOG community.

## What it does

Log any UAP/unidentified phenomenon sighting (aerial, ground, sea, other), then
immediately cross-check it against all known phenomena at that time and place:

- ✈️ Aircraft (OpenSky ADS-B — real-time + historical)
- 🛰️ ISS position at time of sighting
- 🌐 Satellites overhead (N2YO)
- ☁️ Weather conditions (Open-Meteo)
- 🎈 Radiosonde launches (UK Met Office static schedule logic)

The verdict engine tags each sighting: **UNEXPLAINED / PARTIAL MATCH / LIKELY EXPLAINED / UNVERIFIED**

## The hypothesis

James's insight after 25 years of investigation: a sighting that survives cross-checking
against all known mundane explanations is a completely different class of evidence.
This app makes that verification step fast, consistent, and shareable.

## Background

James Brodie — UFO/paranormal investigator, 25+ years, West Midlands.
Lecturer at Birmingham UFO Group (BUFOG).
Theory: Universal Harmonix — UAP and paranormal phenomena linked through frequencies
rooted in String Theory; human consciousness interacts with multi-dimensional beings
via these frequencies.

## Status

v0.1 skeleton — verification suite functional, localStorage persistence, photo upload.
Testing with James + BUFOG circle before any public release.

## Local dev

```bash
cd app
# Open index.html in browser — no build step, pure vanilla JS
open index.html
```
