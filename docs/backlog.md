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

## UH-015 — Extended verification suite (v0.2 — 14-point engine)

**Status:** Done
**Closed:** 2026-03-24
**Priority:** Critical
**Loop:** HDD (directly validates HDD-001 — more checks = better signal-to-noise)
**Raised:** 2026-03-24

### User Story
As a UAP investigator,
I want to cross-check my sighting against a comprehensive suite of atmospheric, astronomical, and space weather phenomena,
So that I can be confident that anything unexplained has genuinely survived thorough scrutiny.

### Acceptance Criteria

```gherkin
Feature: Extended verification suite

  Scenario: Bright satellite pass detected
    Given I submit a sighting
    When a top-100 naked-eye satellite was passing overhead at that time
    Then the verification panel shows a Bright Satellites card with MATCH status

  Scenario: Meteor shower active at sighting time
    Given I submit a sighting during an active meteor shower window
    Then the verification panel shows a Meteor Showers card
    And the card status is POSSIBLE MATCH
    And the detail names the shower and its peak rate

  Scenario: Full moon at sighting time
    Given I submit a sighting when moon illumination is ≥ 85%
    Then the Lunar card status is POSSIBLE MATCH
    And the detail includes moon phase name and illumination percentage

  Scenario: Aurora visible at sighting latitude
    Given I submit a sighting during a geomagnetic storm (Kp ≥ 6)
    And my latitude is ≥ 50°N
    Then the Aurora card status is POSSIBLE MATCH
    And the detail explains why aurora may have been visible

  Scenario: Sprite conditions detected
    Given I submit a sighting during a severe thunderstorm (CAPE ≥ 1000 J/kg)
    Then the Sprites card status is POSSIBLE MATCH
    And the detail flags the storm-level CAPE value

  Scenario: Noctilucent cloud conditions met
    Given I submit a sighting in May–August at latitude ≥ 48°N
    And the time is within 2 hours of sunset or sunrise
    Then the Noctilucent Clouds card status is POSSIBLE MATCH

  Scenario: Verification sources grouped by category
    Given I submit any sighting
    Then the verification panel shows sources in labelled groups:
    Sky Objects / Weather / Space Weather / Atmospheric / Astronomical
```

### Notes
New sources:
- `checkBrightSatellites`: Celestrak visual group (top 100), same SGP4 as Starlink
- `checkMeteorShower`: from sky.js activeMeteorShowers — move into verification
- `checkMoon`: from sky.js moonPhase — illumination ≥ 85% = POSSIBLE MATCH
- `checkSolarWind`: NOAA SWPC mag-1-day.json — Bz southward component
- `checkAurora`: NOAA Kp + latitude threshold — UK-relevant from Kp ≈ 6
- `checkSprites`: Open-Meteo CAPE index — CAPE ≥ 1000 = storm-level
- `checkNLC`: static rule — May–Aug, lat ≥ 48°N, twilight hours
CORS: Celestrak needs Workers proxy (same as YGW pattern). NOAA SWPC is CORS-permissive.
UI: group sources in 5 labelled sections. Space weather chips (Kp/wind/Bz) as colour-coded tags.
Gherkin gate applies to all new code paths.

---

## UH-016 — Photo as sighting background

**Status:** Done
**Priority:** Medium
**Loop:** BDD
**Raised:** 2026-03-24
**Closed:** 2026-03-24

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

---

## UH-017 — Three-tab restructure (Log Sighting / My Records / UK Sighting Database)

**Status:** Done
**Priority:** High
**Loop:** BDD
**Raised:** 2026-03-24
**Closed:** 2026-03-24

### User Story
As a UAP investigator,
I want the app to have three clearly separated areas — logging, my records, and historical UK data,
So that the personal investigation workflow and the research layer are distinct and each tab feels purposeful.

### Acceptance Criteria

```gherkin
Feature: Three-tab navigation

  Scenario: Investigator can access all three tabs
    Given I am on any tab
    When I tap Log Sighting
    Then the log form is shown
    When I tap My Records
    Then my sighting records and backup/restore controls are shown
    When I tap UK Sighting Database
    Then the historical data panel is shown

  Scenario: Log Sighting is the default tab on first load
    Given I open the app for the first time
    Then the Log Sighting tab is active
```

### Notes
- Tab labels: Log Sighting · My Records · UK Sighting Database
- My Records absorbs current Records tab + backup/restore (currently in Data tab)
- UK Sighting Database is the new historical data panel (empty until UH-030 seeds data)
- Bottom nav updates to match (3 icons)
- Gherkin gate applies — write failing acceptance test before touching HTML

---

## UH-030 — Seed NUFORC UK dataset

**Status:** Done
**Priority:** High
**Loop:** Data
**Raised:** 2026-03-24
**Closed:** 2026-03-24

### User Story
As a UAP researcher,
I want UK historical sighting records from NUFORC loaded into the app,
So that I have a corpus to tag and correlate against environmental data.

### Notes
- Source: Kaggle NUFORC CSV filtered to `country == 'gb'` (~3,000–5,000 records)
- Fields: datetime, city/county, shape, duration, comments, lat/lon
- Commit to `/data/nuforc-uk.json` (processed, stripped of excessive free text)
- See docs/data-taxonomy.md for full field mapping

---

## UH-031 — AI tagging pipeline: NUFORC comments → taxonomy tags

**Status:** Done
**Priority:** High
**Loop:** Data
**Raised:** 2026-03-24
**Closed:** 2026-03-24

### Notes
- Parse NUFORC `comments` field via Claude API
- Auto-assign Category A–H tags from docs/data-taxonomy.md
- Expected accuracy ~80–85% on shape/movement/sound; human review for F/H
- Same pattern as Cusslab API calls (Anthropic API via Workers proxy)

---

## UH-032 — UK Sighting Database tab UI

**Status:** Done
**Priority:** High
**Loop:** BDD
**Raised:** 2026-03-24
**Closed:** 2026-03-24

### User Story
As a researcher,
I want to browse and filter the UK historical sighting database within the app,
So that I can explore patterns without leaving the tool.

### Notes
- Tab added in UH-017
- Filter controls: date range, region, shape, Hynek type, IFO/unexplained
- Record card: date · location · shape · Hynek type · verdict chips
- Pagination or virtual scroll (dataset may be thousands of records)

---

## UH-033 — Enrich historical records with Category I (UH layer)

**Status:** Done
**Priority:** High
**Loop:** Data
**Raised:** 2026-03-24
**Closed:** 2026-03-24

### Notes
- For each tagged sighting auto-populate: NOAA Kp (historical, back to 1994), Open-Meteo weather, moon phase (calculated)
- Same API pattern as verifySighting() — run against historical datetime + lat/lng
- Store enriched data in `/data/nuforc-uk-enriched.json`
- Coverage: Kp 97.5%, cloud 97.5%, moon 99.9% — 2,048/2,050 enriched

---

## UH-040 — Sightings Map tab

**Status:** Done
**Priority:** High
**Loop:** BDD
**Raised:** 2026-03-25
**Closed:** 2026-03-25

### User Story
As a researcher,
I want to see all UK sightings plotted on an interactive map,
So that I can explore geographical patterns and compare sightings visually.

### Acceptance Criteria

```gherkin
Feature: Sightings Map

  Scenario: Map tab loads all sightings
    Given I tap the Sightings Map tab
    Then a map centred on the UK is shown
    And all sightings with coordinates are plotted as colour-coded markers
    And markers are clustered at zoom-out and expand on zoom-in

  Scenario: Markers are coloured by Hynek type
    Given the map is loaded
    Then CE* sightings show purple markers with a glow
    And DD sightings show amber markers
    And NL sightings show blue markers
    And RV sightings show green markers

  Scenario: Popup shows enriched context
    Given I click a marker
    Then I see: date, location, Hynek type, shape, brief description
    And Kp index (highlighted if elevated), moon phase, cloud cover
    And a "Search online" link for the sighting

  Scenario: Kp ≥ 4 filter isolates geomagnetic events
    Given I enable "Kp ≥ 4 only"
    Then only sightings recorded during elevated geomagnetic activity remain
    And the stats bar updates to reflect the filtered count

  Scenario: Near Me centres the map on user location
    Given I tap Near Me
    Then the map pans and zooms to my GPS coordinates
```

### Notes
- Data: nuforc-uk-enriched.json (context fields needed for popup)
- Leaflet.js + Leaflet.markercluster via CDN
- Dark tile layer: CartoDB Dark Matter
- Significance label in popup (CE = Close Encounter, DD/RV = Physical Observation, NL = Nocturnal Light)
- "Search online" Google link per sighting (city + year + UK)
- Kp ≥ 4 toggle tests UH hypothesis visually
- Deployment fix: pages.yml now copies data/ → app/data before artifact upload (was broken)

---

## UH-034 — Correlation explorer

**Status:** Done
**Priority:** Medium
**Loop:** BDD
**Raised:** 2026-03-24
**Closed:** 2026-03-25

### User Story
As a researcher,
I want to cross-tab any two taxonomy tags against each other,
So that I can test whether correlations exist (e.g. high Kp × unexplained verdict).

### Notes
- Core UH hypothesis test: do unexplained sightings cluster at Kp ≥ 4?
- Simple pivot table or bar chart in-browser
- Export as CSV for deeper analysis

---

## UH-041 — Load BUFOG cases into UKDB tab and Sightings Map

**Status:** Open
**Priority:** High
**Loop:** BDD
**Raised:** 2026-03-25

### User Story
As a researcher,
I want to see BUFOG investigated cases alongside NUFORC records in the UK Sightings Database and on the Sightings Map,
So that investigator-level cases are visually distinct from self-reported data.

### Acceptance Criteria

```gherkin
Feature: BUFOG cases in UKDB and Map

  Scenario: BUFOG cases appear in the UK Sighting Database tab
    Given BUFOG cases are loaded from bufog-cases-clean.json
    Then they appear in the records table alongside NUFORC records
    And a BUFOG source badge distinguishes them from NUFORC records
    And filters (shape, Hynek, year) apply to BUFOG records too

  Scenario: BUFOG cases appear on the Sightings Map
    Given BUFOG cases are geocoded
    Then they are plotted on the Sightings Map
    And the popup shows outcome (unexplained / inconclusive / explained)
    And the popup shows witness count, witness type, and physical effects

  Scenario: Source filter lets user show NUFORC-only or BUFOG-only
    Given both datasets are loaded
    When I select "BUFOG only" in a source filter
    Then only BUFOG records are shown in the table and on the map
```

### Notes
- Depends on James reviewing 18 unknown Hynek records (UH-035)
- BUFOG cases use same schema as NUFORC enriched — should load cleanly
- Add source filter to UKDB filter bar and map filter bar
- BUFOG badge colour: green (matching source-tile-bufog border)
- Map popup: add outcome chip (unexplained = purple, inconclusive = amber, explained = green)
- Three Amigos before implementation — confirm source filter UX with Rod

---

## UH-035 — BUFOG archive export to UH schema

**Status:** Partial — 38 published cases scraped, James review pending
**Priority:** Medium
**Loop:** Stakeholder
**Raised:** 2026-03-24

### Notes
- 38 published BUFOG case reports scraped from reported-sightings.blogspot.com
- Saved to `data/bufog-cases-clean.json` — geocoded (38/38), shapes normalised to taxonomy
- Outcomes: 17 unexplained, 15 inconclusive, 6 explained
- Hynek: CE1 (7), CE2 (4), DD (2), CE5 (1), unknown (18) — 18 need manual classification by James
- Modern cases (2020–present) on Wix site are not scrapeable without headless browser
- Next: send James the data + ask him to (a) validate/correct, (b) add Hynek for the 18 unknowns, (c) export additional cases from his archive
- See UH-041 for app integration (load BUFOG tab in UKDB, add to map)

---

## UH-036 — UFO Identified data sharing

**Status:** Open
**Priority:** Low
**Loop:** Stakeholder
**Raised:** 2026-03-24

### Notes
- Contact ufoidentified.co.uk re: data sharing or API access
- Covers 2021–present UK sightings; best active UK source

---

## UH-037 — MOD National Archives OCR project

**Status:** Open
**Priority:** Low
**Loop:** Research
**Raised:** 2026-03-24

### Notes
- 11,000 MOD sighting reports 1962–2009, public at nationalarchives.gov.uk (DEFE, AIR series)
- Records are scanned PDFs — need OCR + structured extraction
- Significant standalone project; estimate before committing
- Would produce the definitive UK historical sighting dataset if completed

---

## UH-038 — AI tagging pipeline v2: extend to Categories D–H

**Status:** Open
**Priority:** Low
**Loop:** Data
**Raised:** 2026-03-24

### Notes
- Follows UH-031 (v1 covers A/B/C only)
- Categories D (physical effects), E (observation context), F (witness profile), G (location), H (investigation status)
- F and H likely need human review pass after AI tagging — accuracy expected lower than A/B/C
- E can be partially auto-populated from structured fields (datetime → E1/E5, lat/lng → G3) without Claude API
- Raise Three Amigos before implementing — scope each category separately

---

## UH-039 — Mobile: background image right-aligned, wordmark on dark background

**Status:** Done
**Closed:** 2026-03-24
**Priority:** High
**Loop:** BDD
**Raised:** 2026-03-24

### Notes
- Desktop: image left, content right (dark) — wordmark is readable
- Mobile: image currently left-positioned behind all content — wordmark sits against the photo
- Fix: on mobile, position image to right, reverse gradient overlay (dark left → light right)
- Wordmark and content sit on the dark left; image peeks out on the right edge
