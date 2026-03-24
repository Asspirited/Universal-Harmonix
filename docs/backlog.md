# Universal Harmonix — Backlog
# Prefix: UH-
# Last updated: 2026-03-24 (session 5)

---

## UH-001 — Core log and verify

**Status:** Done
**Priority:** Critical
**Loop:** HDD (validates HDD-001)
**Raised:** 2026-03-24

### User Story
As a UAP investigator,
I want to log a sighting and immediately see what known phenomena were present at that time and place,
So that I can quickly determine whether my sighting has a mundane explanation.

### Acceptance Criteria

```gherkin
Feature: Sighting log and verification

  Scenario: Investigator logs a sighting and receives a verification panel
    Given I am on the Universal Harmonix log screen
    When I enter a date, time, location, phenomenon type, and description
    And I submit the sighting
    Then I see a verification panel with results from all available data sources
    And each source shows either a match, no match, or "could not verify"
    And the sighting is assigned a verdict: UNEXPLAINED, PARTIAL MATCH, LIKELY EXPLAINED, or UNVERIFIED

  Scenario: API source fails during verification
    Given I have submitted a sighting
    When one or more verification sources return an error
    Then the panel shows "could not verify" for that source
    And the remaining sources display their results normally
    And the overall verdict reflects the available data only

  Scenario: Investigator uses GPS for location
    Given I am on the log screen
    When I tap "Use my location"
    Then my device GPS coordinates are populated into the location fields
    And verification uses those coordinates
```

### Notes
- v0.1: verification runs automatically on submit
- Aircraft: OpenSky Network (anonymous, 55km radius)
- ISS: wheretheiss.at
- Satellites: N2YO (requires free API key from user)
- Weather: Open-Meteo
- Radiosondes: static schedule logic (UK Met Office)

---

## UH-002 — Sighting records list

**Status:** Done
**Priority:** High
**Loop:** BDD
**Raised:** 2026-03-24

### User Story
As an investigator,
I want to view all my logged sightings,
So that I can review my investigation history and compare sightings.

### Acceptance Criteria

```gherkin
Feature: Sighting records

  Scenario: Investigator views their sighting history
    Given I have logged one or more sightings
    When I navigate to the Records tab
    Then I see a list of all my sightings in reverse chronological order
    And each record shows: date, time, location, phenomenon type, verdict

  Scenario: Investigator views full detail of a sighting
    Given I am on the Records tab
    When I expand a sighting record
    Then I see the full description and the complete verification panel
```

### Notes
- localStorage for v1
- Expand/collapse per record

---

## UH-003 — GPS location capture

**Status:** Done
**Priority:** High
**Loop:** BDD
**Raised:** 2026-03-24

### User Story
As an investigator in the field,
I want to capture my exact GPS coordinates with one tap,
So that verification is accurate to my actual location.

### Acceptance Criteria

```gherkin
Feature: GPS location capture

  Scenario: GPS available
    Given I am on the log screen on a device with GPS
    When I tap "Use my location"
    Then my latitude and longitude are populated in the location fields

  Scenario: GPS unavailable or denied
    Given I am on the log screen
    When I tap "Use my location" and the device cannot provide coordinates
    Then I see a clear message explaining that GPS is unavailable
    And the location fields remain editable for manual entry
```

---

## UH-004 — Backup and restore

**Status:** Done
**Priority:** Low
**Loop:** HDD
**Raised:** 2026-03-24
**Closed:** 2026-03-24

### Notes
v1: file-based JSON backup/restore in the Data tab. James and Rod each manage their own
backup files. Deduplicates by ID on import. Includes photos.
Phase 2: cloud sync (Cloudflare D1 + Worker) when multi-device or shared access is needed.

---

## UH-005 — Photo persistence

**Status:** Done
**Priority:** Medium
**Loop:** BDD
**Raised:** 2026-03-24
**Closed:** 2026-03-24

### Notes
Photos resized client-side (Canvas, max 800px, JPEG 0.7) and stored as base64
in localStorage alongside the sighting record. Max 3 photos per sighting.
Thumbnails shown in Records tab when a sighting is expanded.

---

## UH-006 — Export for BUFOG reports

**Status:** Done
**Priority:** Medium
**Loop:** BDD
**Raised:** 2026-03-24
**Closed:** 2026-03-24

### Notes
Export report (PDF): opens print-ready BUFOG-branded report in new tab, auto-triggers browser print dialog.
Download JSON: downloads full sighting record including verification and photos.
UH-Q009 still open — when James confirms BUFOG's preferred format, adjust accordingly.

---

## UH-007 — Register UH- prefix in leanspirited-standards

**Status:** Done
**Priority:** Critical
**Loop:** Process
**Raised:** 2026-03-24

### Notes
Add `UH-` row to prefix registry in `/home/rodent/leanspirited-standards/standards/backlog-format.md`.

---

## UH-008 — GitHub Pages deployment confirmed live

**Status:** Done
**Priority:** Critical
**Loop:** Process
**Raised:** 2026-03-24
**Closed:** 2026-03-24

### Notes
Pages configured (Source: GitHub Actions). Deploy workflow run #3 triggered via empty commit.
Confirmed live: https://asspirited.github.io/Universal-Harmonix/ returns HTTP 200.

---

## UH-009 — Architecture: clean separation, contract tests, SOLID hardening

**Status:** Done
**Priority:** High
**Loop:** Process
**Raised:** 2026-03-24
**Closed:** 2026-03-24

### Notes
- App JS split: format.js (pure), photo.js (browser), render.js (browser), export.js (browser)
- index.html reduced to event wiring only
- Layer 2 activated: consumer contract tests for OpenSky, ISS, Open-Meteo
- VERIFICATION_SOURCES registry: new sources added in one place, verifySighting is generic
- SOURCES.shortName: SOURCES_SHORT derived, no duplication
- generateReportHtml loops SOURCES: new sources auto-appear in PDF reports
- Branch coverage: 80.88% → 84.51%
- WL-007 raised: wheretheiss.at outage downgraded to WARN

---

## UH-010 — Starlink train detection

**Status:** Done
**Priority:** Critical
**Loop:** HDD (validates HDD-001 — closes the single biggest IFO gap)
**Raised:** 2026-03-24
**Closed:** 2026-03-24

### User Story
As a UAP investigator,
I want to know whether a Starlink train was visible at my sighting location and time,
So that I can rule out or confirm the most common post-2019 UAP misidentification.

### Acceptance Criteria

```gherkin
Feature: Starlink train verification

  Scenario: Starlink train was visible at sighting location and time
    Given I submit a sighting at a location and time when a Starlink train was passing
    Then the verification panel shows a Starlink source card
    And the card status is MATCH
    And the detail includes the train name, pass elevation, and direction

  Scenario: No Starlink train visible at sighting time
    Given I submit a sighting when no Starlink train was passing overhead
    Then the Starlink card status is NO MATCH
    And the detail confirms no train was visible

  Scenario: Starlink data unavailable
    Given the Celestrak TLE feed is unreachable
    Then the Starlink card status is COULD NOT VERIFY
    And the overall verdict reflects available sources only
```

### Notes
- Source: Celestrak TLE data (free, no auth): https://celestrak.org/SOCRATES/
- Propagation: satellite.js SGP4 — npm install satellite.js (or CDN for browser)
- Return: train name, pass time, max elevation (degrees), direction (azimuth), approximate magnitude
- Add to VERIFICATION_SOURCES registry and SOURCES display array
- Gherkin gate applies: new code path requires new scenarios

---

## UH-011 — Geomagnetic Kp index check

**Status:** Done
**Priority:** Critical
**Loop:** HDD (directly relevant to Universal Harmonix frequency hypothesis)
**Raised:** 2026-03-24
**Closed:** 2026-03-24

### User Story
As a UAP investigator using the Universal Harmonix framework,
I want to know the geomagnetic Kp index at the time of my sighting,
So that I can assess whether elevated geomagnetic activity correlates with the sighting.

### Acceptance Criteria

```gherkin
Feature: Geomagnetic Kp index check

  Scenario: Kp index is elevated at sighting time
    Given I submit a sighting during a period of elevated geomagnetic activity (Kp ≥ 4)
    Then the verification panel shows a Geomagnetic source card
    And the card status is POSSIBLE MATCH
    And the detail includes the Kp value and flags it as elevated

  Scenario: Kp index is storm-level at sighting time
    Given I submit a sighting during a geomagnetic storm (Kp ≥ 5)
    Then the Geomagnetic card status is POSSIBLE MATCH
    And the detail flags it as storm-level

  Scenario: Kp index is normal at sighting time
    Given I submit a sighting when Kp < 4
    Then the Geomagnetic card status is NO MATCH
    And the detail shows the Kp value

  Scenario: NOAA SWPC feed unavailable
    Given the NOAA SWPC feed is unreachable
    Then the Geomagnetic card status is COULD NOT VERIFY
```

### Notes
- Source: NOAA SWPC free JSON: https://services.swpc.noaa.gov/json/planetary_k_index_1m.json
- Returns 1-minute resolution Kp data — match to sighting timestamp
- Thresholds: Kp ≥ 4 = elevated (POSSIBLE MATCH), Kp ≥ 5 = storm (POSSIBLE MATCH, stronger flag)
- Kp < 4 = NO MATCH
- UH theory: geomagnetic storms are one of the few environmental conditions scientifically linked
  to both UAP clustering and anomalous perception — this is the UH hypothesis validation path
- Add to VERIFICATION_SOURCES and SOURCES
- Add contract test for NOAA SWPC feed shape
- Gherkin gate applies

---

## UH-012 — Mobile-first responsive design + PWA

**Status:** Done
**Priority:** High
**Loop:** HDD (James uses this in the field on his phone)
**Raised:** 2026-03-24
**Closed:** 2026-03-24

### User Story
As a field investigator,
I want the app to work on my phone as well as a desktop monitor,
So that I can log sightings in the field and review them at my desk without switching tools.

### Acceptance Criteria

```gherkin
Feature: Mobile-responsive app

  Scenario: User opens app on mobile phone
    Given I open the app on a mobile device
    Then I see a bottom navigation bar with Log, Records, and Data tabs
    And all tap targets are at least 44px tall
    And the layout fills the screen without horizontal scroll

  Scenario: User installs app to home screen
    Given I open the app in a mobile browser
    When I choose "Add to Home Screen"
    Then the app installs with an icon and no browser chrome
    And the app loads offline after first visit
```

### Notes
- Bottom nav bar on ≤600px screens; top tabs remain on desktop
- PWA manifest: name, icons, theme colour, standalone display
- Service worker: cache-first for static assets (offline after first load)
- Safe area insets for iOS notch and home indicator

---

## UH-013 — Enhanced location capture

**Status:** Done
**Priority:** High
**Loop:** HDD (field use — James logs sightings at the moment of the event)
**Raised:** 2026-03-24
**Closed:** 2026-03-24

### User Story
As a field investigator,
I want my location to be captured instantly and resolved to a readable address,
So that I can log a sighting quickly without manually entering coordinates,
And also correct or override the location if needed.

### Acceptance Criteria

```gherkin
Feature: Enhanced location capture

  Scenario: Location auto-captured on page load
    Given I open the app
    Then my GPS coordinates are automatically populated
    And the address (town, county) is shown alongside the coordinates

  Scenario: Investigator updates location by postcode
    Given my location is already set
    When I type a UK postcode into the location field
    Then the coordinates and address update to match that postcode

  Scenario: Investigator pastes coordinates
    Given my location is already set
    When I paste or type lat/lng coordinates
    Then the address resolves and updates automatically

  Scenario: GPS unavailable
    Given the device cannot provide GPS
    Then the location field is empty and editable
    And a clear prompt invites manual entry
```

### Notes
- Auto-trigger GPS on page load (not just on button press)
- Reverse geocode via free API (e.g. nominatim.openstreetmap.org) to show address
- Postcode lookup: postcodes.io (free UK API, no auth)
- Show: address string, lat, lng, elevation (if available)
- "Update Location" button for manual override
- Gherkin gate applies

---

## UH-014 — Sky Activity panel (pre-submission context)

**Status:** Done
**Priority:** High
**Loop:** HDD (matches feature parity with James's sky-watch app)
**Raised:** 2026-03-24
**Closed:** 2026-03-24

### User Story
As a field investigator,
I want to see what is happening in the sky at my location right now,
So that I can add precise context to my sighting report before submitting.

### Acceptance Criteria

```gherkin
Feature: Sky Activity panel

  Scenario: Sky conditions shown on log screen
    Given I have a location set
    Then I see current weather conditions (temp, humidity, visibility, wind)
    And moon phase and illumination percentage
    And time of day classification (day / twilight / night)

  Scenario: Active sky objects shown
    Given I have a location set
    Then I see whether the ISS is currently visible overhead
    And any Starlink satellites currently visible
    And any active meteor showers at this time of year
    And visible planets (Venus, Mars, Jupiter, Saturn)

  Scenario: Aircraft in area shown pre-submission
    Given I have a location set
    Then I see a live list of aircraft currently in my area
    So I can note them before submitting the report
```

### Notes
- Moon phase: pure calculation, no API (same pattern as radiosonde logic)
- Meteor showers: static annual calendar (Perseids, Lyrids, Leonids etc.)
- Visible planets: astronomical calculation or free API
- ISS/Starlink: reuse existing domain.js logic
- Aircraft: reuse existing OpenSky call
- Weather: reuse existing Open-Meteo call
- Show as a collapsible "Sky Context" section on the Log tab, above the form
- Gherkin gate applies

---

## UH-015 — Photo as sighting background

**Status:** Open
**Priority:** Medium
**Loop:** BDD
**Raised:** 2026-03-24

### User Story
As a UAP investigator,
I want the photo I took at the time of my sighting to appear as the background of the verification panel,
So that the evidence stays in context as I review what sources matched.

### Acceptance Criteria

```gherkin
Feature: Photo as sighting background

  Scenario: Sighting with photo shows photo as verification panel background
    Given I have logged a sighting with a photo attached
    When I view the verification panel for that sighting
    Then the photo is shown as a full-bleed background
    And the verification results are readable over the photo via a semi-transparent overlay

  Scenario: Sighting without photo shows standard background
    Given I have logged a sighting with no photo
    When I view the verification panel
    Then the standard dark background is shown

  Scenario: Photo background is visible at night on mobile
    Given I am viewing the verification panel with a photo background
    Then the text overlay contrast is sufficient to read all source cards
```

### Notes
- Depends on: UH-005 (photo persistence — Done)
- Apply to Records tab expanded view and the immediate post-submit verification panel
- Semi-transparent dark overlay (e.g. rgba(0,0,0,0.6)) to ensure readability
- Mobile: test on dark screen, avoid excessive brightness
- Per-sighting: background is the first attached photo for that record
- Source: idea-uh-photo-background-2026-03-24.md (Downloads)
