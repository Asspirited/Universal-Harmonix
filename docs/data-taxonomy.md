# Universal Harmonix — UK Sighting Data Sources & Labelling Taxonomy
*Research document — March 2026*

---

## Part 1: UK Historical Data Sources

### What actually exists and how to access it

#### 1. MOD / National Archives — 11,000 UK sightings, 1962–2009 ⭐ Primary
Over 200 UFO files from the Ministry of Defence were transferred to the National Archives at Kew. The files contain papers detailing some 11,000 sighting reports along with correspondence, Parliamentary business, and details of government policy. The earliest surviving sequence begins in 1962. Files were released in tranches 2008–2013 and are now publicly available.

**Access:** nationalarchives.gov.uk — searchable catalogue (DEFE, AIR series). Physical files at Kew; digital copies purchasable. A structured data export does not exist — records are scanned PDFs. **Practical approach:** The 11,000 reports contain structured fields (location, date/time, shape, weather, distance, duration) — a scraping/OCR project could extract these into a dataset. This is a UH project in its own right.

**Key fields in MOD sighting reports (from example report in National Archives):**
- Date and time
- Location (town/county)
- Shape of object
- Distance from observer
- Movement description
- Weather conditions at time
- Whether mist was present
- Duration
- Whether other witnesses present

#### 2. UFO Identified (ufoidentified.co.uk) — UK sightings 2020–present ⭐ Active
A UK-focused database compiled from multiple sources including direct reports, FOI requests to government organisations and police forces. Updated weekly. Covers UK sightings since 2021. Free to browse. No API but structured enough to scrape. **Best source for recent UK data.**

#### 3. NUFORC — 150,000+ global sightings, filterable by country
The National UFO Reporting Center databank is the largest independent collection globally. UK-filtered results are available. Free to browse; bulk CSV data has been distributed via Kaggle (80,000+ records to 2014) though NUFORC ToS technically restricts redistribution. **Practical approach:** Use the Kaggle dataset filtered to `country == 'gb'` — gives several thousand UK entries with structured fields: datetime, city, shape, duration, comments, lat/lon.

**NUFORC fields in the public CSV:**
- datetime
- city / state (county) / country
- shape
- duration (seconds)
- duration (hours/min, free text)
- comments (full witness narrative)
- date_posted
- latitude / longitude

#### 4. BUFOG case reports (bufog.com) — West Midlands deep investigations
BUFOG publishes detailed structured case reports for investigated sightings. Not a database but individually very rich. Fields include: witness count, occupations, emotional effects, physical effects, equipment interference, hypnotic regression notes, investigator conclusions. **James's own archive** — potentially the richest UK investigator-level dataset in the Midlands.

#### 5. West Midlands Police FOI data
West Midlands Police have released UAP call logs 2015–2024 via FOI (publicly available). Contains: date, brief description, location (area). Thin but useful for regional clustering.

#### 6. Project Condign (declassified 2006)
UK MoD's own scientific study 1997–2000. Concluded all UK sightings could be attributed to misidentified objects or poorly understood natural phenomena — but the underlying data and methodology are in the released files. Useful as a baseline classification framework.

---

## Part 2: The Labelling Taxonomy

The goal is a **consistent, machine-readable tag set** that can be applied to:
- Historical records ingested from the sources above
- New sightings logged directly in Universal Harmonix
- BUFOG case archive entries

Designed to support correlation analysis — each tag should be a discrete variable that can be cross-tabbed against others and against environmental data (Kp, weather, time, location clusters).

---

### CATEGORY A: OBSERVATION BASICS

#### A1 — Observation Type (Hynek primary classification)
Based on J. Allen Hynek's foundational system (1972), the most widely adopted scientific framework in ufology.

| Tag | Label | Description |
|-----|-------|-------------|
| `NL` | Nocturnal Light | Anomalous light at night, no discernible structure |
| `DD` | Daylight Disc | Structured object seen in daylight |
| `RV` | Radar-Visual | Simultaneously tracked on radar and visually observed |
| `CE1` | Close Encounter 1 | Within ~150m, observed in detail, no physical effect |
| `CE2` | Close Encounter 2 | Physical effects on environment, equipment or witnesses |
| `CE3` | Close Encounter 3 | Entity / occupant observed |
| `CE4` | Close Encounter 4 | Abduction (Vallée extension) |
| `CE5` | Close Encounter 5 | Witness-initiated contact |
| `USO` | Underwater/Sea Object | Observed in or emerging from water |
| `GND` | Ground Level | Object on or just above ground |

#### A2 — Object Shape
Standardised vocabulary across all sources. Multiple tags allowed.

`sphere` · `disc/saucer` · `triangle` · `cigar/cylinder` · `rectangle` · `boomerang/chevron` · `teardrop` · `diamond` · `star-like` · `orb` · `ring/torus` · `egg/oval` · `cross` · `irregular/amorphous` · `formation` · `unknown`

#### A3 — Object Colour
Primary colour of object or dominant light emitted.

`white` · `orange/amber` · `red` · `green` · `blue` · `yellow` · `silver/metallic` · `black` · `multicolour` · `changing` · `unknown`

#### A4 — Light Characteristics
`steady` · `pulsing` · `flashing/strobing` · `rotating` · `glowing` · `luminous-trail` · `none` · `unknown`

#### A5 — Angular Size (apparent size relative to moon disc)
`pinpoint (<1%)` · `small (1–10%)` · `medium (10–50%)` · `large (50–200%)` · `very-large (>200%)` · `unknown`

---

### CATEGORY B: MOVEMENT & BEHAVIOUR

#### B1 — Motion Type
`stationary/hovering` · `straight-line` · `curved-path` · `erratic/darting` · `pendulum` · `spiral` · `falling` · `ascending` · `rotating-in-place` · `zigzag` · `instant-acceleration` · `disappeared-in-place` · `unknown`

#### B2 — Speed
`stationary` · `very-slow` · `slow (aircraft-like)` · `fast` · `very-fast` · `instantaneous` · `variable` · `unknown`

#### B3 — Altitude
`ground-level` · `low (<300m)` · `medium (300m–3km)` · `high (3km–10km)` · `very-high (>10km)` · `unknown`

#### B4 — Direction of travel
`N` · `NE` · `E` · `SE` · `S` · `SW` · `W` · `NW` · `ascent` · `descent` · `unknown`

#### B5 — Unusual flight characteristics (multi-select)
`right-angle-turn` · `non-inertial-acceleration` · `silent-at-speed` · `impossible-hover` · `split-into-multiple` · `merged-from-multiple` · `transmedium` (air to water or vice versa)

---

### CATEGORY C: SENSORY DETAILS

#### C1 — Sound
`silent` · `humming` · `buzzing` · `whirring` · `whoosh` · `roaring` · `high-pitched` · `low-frequency/rumble` · `electronic-tone` · `clicking` · `unknown`

#### C2 — Smell
`none` · `ozone/electrical` · `burning` · `sulphur` · `unusual-sweet` · `unknown`

#### C3 — Physical sensation on witness
`none` · `heat` · `cold` · `vibration` · `static-electricity` · `nausea` · `paralysis` · `time-distortion` · `missing-time` · `unknown`

---

### CATEGORY D: PHYSICAL EFFECTS

#### D1 — Effects on environment
`none` · `ground-marks/scorching` · `vegetation-damage` · `soil-disturbance` · `burnt-circle` · `broken-branches` · `animal-reaction` · `unknown`

#### D2 — Effects on equipment/electronics
`none` · `car-engine-failure` · `car-lights-failure` · `compass-deflection` · `radio-interference` · `TV-interference` · `mobile-phone-failure` · `camera-malfunction` · `unknown`

#### D3 — Effects on witness health (post-sighting)
`none` · `eye-irritation` · `skin-burns` · `nausea-vomiting` · `headache` · `psychological-disturbance` · `psychic-ability-onset` · `unknown`

---

### CATEGORY E: OBSERVATION CONTEXT

#### E1 — Time of day
`dawn (4–7am)` · `morning (7–11am)` · `midday (11am–2pm)` · `afternoon (2–5pm)` · `dusk (5–8pm)` · `evening (8–11pm)` · `night (11pm–2am)` · `deep-night (2–4am)`

#### E2 — Sky conditions
`clear` · `partly-cloudy` · `overcast` · `fog/mist` · `rain` · `thunderstorm` · `snow` · `haze`

#### E3 — Visibility
`excellent (>20km)` · `good (10–20km)` · `moderate (4–10km)` · `poor (<4km)`

#### E4 — Moon phase at sighting
`new` · `crescent` · `quarter` · `gibbous` · `full`

#### E5 — Season
`spring (Mar–May)` · `summer (Jun–Aug)` · `autumn (Sep–Nov)` · `winter (Dec–Feb)`

---

### CATEGORY F: WITNESS PROFILE

#### F1 — Number of witnesses
`1` · `2–3` · `4–10` · `11–50` · `50+` · `unknown`

#### F2 — Witness type (highest credibility in group)
`general-public` · `trained-observer` (police, military) · `pilot/aircrew` · `maritime` · `scientist/researcher` · `multiple-independent` · `anonymous`

#### F3 — Witness prior experience
`first-sighting` · `repeat-experiencer` · `BUFOG-investigator` · `unknown`

#### F4 — Witness emotional state during sighting
`calm/curious` · `frightened` · `awe/wonder` · `confused` · `unknown`

---

### CATEGORY G: LOCATION CONTEXT

#### G1 — Terrain type
`urban` · `suburban` · `rural` · `coastal` · `inland-water` · `moorland/upland` · `forest` · `farmland` · `industrial`

#### G2 — Proximity to infrastructure
`near-military-base (<10km)` · `near-nuclear-site (<10km)` · `near-airport (<10km)` · `near-power-station (<10km)` · `near-fault-line` · `near-water` · `none-noted`

#### G3 — UK region
`West Midlands` · `East Midlands` · `Yorkshire` · `North West` · `North East` · `East Anglia` · `South East` · `South West` · `Wales` · `Scotland` · `Northern Ireland` · `Offshore/Maritime`

#### G4 — Known hotspot
`Falkirk-Triangle` · `Rendlesham` · `Warminster` · `Broad-Haven` · `Pennine-corridor` · `Bonnybridge` · `none`

---

### CATEGORY H: INVESTIGATION STATUS

#### H1 — Source
`MOD-files` · `NUFORC` · `BUFOG` · `UFO-Identified` · `FOI-police` · `direct-report` · `media-report` · `historical-account`

#### H2 — Corroboration
`single-witness-uncorroborated` · `multiple-independent-witnesses` · `radar-confirmation` · `photographic-evidence` · `video-evidence` · `physical-trace-evidence` · `multiple-source-types`

#### H3 — Investigation outcome
`unexplained` · `explained-IFO` · `partially-explained` · `under-investigation` · `inconclusive` · `not-investigated`

#### H4 — IFO explanation (if explained)
`aircraft` · `military-aircraft` · `helicopter` · `drone` · `satellite` · `starlink` · `ISS` · `meteor/fireball` · `chinese-lantern` · `LED-balloon` · `hot-air-balloon` · `weather-balloon` · `lenticular-cloud` · `NLC` · `aurora` · `ball-lightning` · `planet/star` · `other-known`

#### H5 — BUFOG investigation tier
`not-investigated` · `initial-assessment` · `full-investigation` · `published-case-report`

---

### CATEGORY I: UNIVERSAL HARMONIX LAYER
*James's theoretical framework — correlatable against space weather and frequency data*

#### I1 — Geomagnetic activity at time (from NOAA Kp)
`quiet (Kp 0–2)` · `unsettled (Kp 3)` · `active (Kp 4)` · `minor-storm (Kp 5)` · `moderate-storm (Kp 6–7)` · `severe-storm (Kp 8–9)`

#### I2 — Solar wind speed at time
`slow (<350 km/s)` · `moderate (350–500 km/s)` · `fast (500–700 km/s)` · `very-fast (>700 km/s)` · `unknown`

#### I3 — Bz orientation at time
`northward (suppressed)` · `southward (active)` · `variable` · `unknown`

#### I4 — Lunar phase influence
`new-moon` · `full-moon` · `quarter` · `other` (auto-populated from date)

#### I5 — Atmospheric electricity
`thunderstorm-active` · `high-CAPE` · `electrically-quiet` · `unknown`

#### I6 — Witness consciousness state (self-reported)
`normal-waking` · `sleep-deprived` · `meditative` · `altered-state` · `unknown`

#### I7 — Witness prior paranormal experience
`none-reported` · `previous-UAP` · `paranormal-experiences` · `contact-experience` · `unknown`

---

## Part 3: Correlation Hypotheses to Test

Once data is tagged, these are the first-order questions to ask:

1. **Time clustering** — Do UK sightings cluster by hour, day of week, season? (Base rate vs. human activity patterns)
2. **Geographic clustering** — Do unexplained sightings cluster near known hotspots, fault lines, military sites, nuclear facilities?
3. **Shape x time** — Are triangles predominantly nocturnal? Are orbs more common at dusk?
4. **Kp correlation** — Do unexplained sightings (vs. explained IFOs) cluster at higher Kp periods? (Core Universal Harmonix test)
5. **Multiple witness reliability** — Do multi-witness events have different shape distributions than single-witness events?
6. **Equipment interference** — How often do CE2 events involve EM effects? Any Kp or storm correlation?
7. **Hotspot persistence** — Are the same grid references generating sightings across decades?
8. **Seasonal pattern** — Is the summer peak (May–Aug) explained by increased outdoor activity, NLC season, Perseids, or something else?
9. **Witness type vs outcome** — Do trained observer (police/pilot) reports have different shape distributions or IFO rates?
10. **BUFOG West Midlands** — Is Birmingham's ranking as 3rd most active UK city consistent across time periods, or a recent phenomenon?

---

## Part 4: Recommended First Steps

### Step 1 — Seed dataset (this week)
Download the Kaggle NUFORC CSV, filter to `country == 'gb'`. This gives ~3,000–5,000 UK entries already structured. Apply the taxonomy above as new columns. This is the starting corpus.

### Step 2 — AI-assisted tagging
Use Claude (via the Anthropic API, same pattern as Cusslab) to parse the free-text `comments` field and auto-assign tags from Category A–H. Estimated accuracy ~80–85% on shape, movement, sound. Human review for Category F (witness profile) and H (investigation status).

### Step 3 — Add BUFOG archive
James and Dave have investigated hundreds of cases. Even a subset of 50–100 well-documented BUFOG cases, fully tagged to this schema, would be the highest-quality UK investigator data in existence.

### Step 4 — Enrich with environmental data
For each tagged sighting, auto-populate Category I using:
- NOAA SWPC Kp historical data (available back to 1994)
- Open-Meteo historical weather API (available back to 1940)
- Moon phase (calculated from date)

### Step 5 — Visualise and test hypotheses
Start with the 10 correlation questions above. Use a simple in-browser chart tool or export to a Jupyter notebook.

---

## Backlog items generated

| ID | Item |
|----|------|
| UH-030 | Download NUFORC Kaggle CSV, filter to UK, commit to `/data/` |
| UH-031 | Build AI tagging pipeline: parse NUFORC `comments` → auto-assign taxonomy tags |
| UH-032 | Design data tab UI in app: import/tag/view historical sightings |
| UH-033 | Enrich historical records with Kp, weather, moon phase (Category I) |
| UH-034 | Build correlation explorer: cross-tab any two tag categories |
| UH-035 | Approach James + Dave re: BUFOG case archive export to UH schema |
| UH-036 | Contact UFO Identified re: data sharing / API access |
| UH-037 | MOD files OCR project: extract structured data from National Archives PDFs |
