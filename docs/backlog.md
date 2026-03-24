# Universal Harmonix — Backlog
# Prefix: UH-
# Last updated: 2026-03-24

---

## UH-001 — Core log and verify

**Status:** In Progress
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

**Status:** In Progress
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

**Status:** In Progress (part of UH-001)
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

## UH-004 — Cloud sync (future)

**Status:** Open
**Priority:** Low
**Loop:** HDD (phase 2)
**Raised:** 2026-03-24

### Notes
Depends on HDD-001 confirmation. Not before the verification step proves its value.
Requires backend infrastructure decision (ADR).

---

## UH-005 — Photo persistence (future)

**Status:** Open
**Priority:** Medium
**Loop:** BDD
**Raised:** 2026-03-24

### Notes
v0.1: photo upload is UI-only (not persisted).
Future: store as base64 in localStorage (small images only) or upload to cloud storage.

---

## UH-006 — Export for BUFOG reports

**Status:** Open
**Priority:** Medium
**Loop:** BDD
**Raised:** 2026-03-24

### Notes
Depends on UH-Q009 (what format does BUFOG use?).
Likely: PDF or structured JSON export of a sighting with full verification panel.

---

## UH-007 — Register UH- prefix in leanspirited-standards

**Status:** In Progress
**Priority:** Critical
**Loop:** Process
**Raised:** 2026-03-24

### Notes
Add `UH-` row to prefix registry in `/home/rodent/leanspirited-standards/standards/backlog-format.md`.
