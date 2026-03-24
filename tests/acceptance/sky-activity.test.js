// Universal Harmonix — Gherkin / BDD acceptance tests
// UH-014: Sky Activity panel
// Run: node --test tests/acceptance/sky-activity.test.js

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { moonPhase, timeOfDay, activeMeteorShowers } from '../../app/js/sky.js';

// ── Feature: Sky Activity panel ────────────────────────────────────────────────

describe('Feature: Sky Activity panel', () => {

  it('Scenario: Sky conditions shown — moon phase and illumination present', () => {
    // Given: a location and the current time
    const date = new Date('2026-03-24T21:00:00Z');

    // When: moon phase is calculated
    const result = moonPhase(date);

    // Then: moon phase and illumination are returned
    assert.ok(typeof result.name         === 'string',  'moon name must be present');
    assert.ok(typeof result.illumination === 'number',  'illumination must be present');
    assert.ok(result.illumination >= 0 && result.illumination <= 100,
      'illumination must be 0–100');
  });

  it('Scenario: Time of day classification shown — valid for UK night-time', () => {
    // Given: a UK location at midnight in winter
    const date   = new Date('2026-01-15T00:00:00Z');
    const latDeg = 52.48;
    const lngDeg = -1.89;

    // When: time of day is computed
    const result = timeOfDay(date, latDeg, lngDeg);

    // Then: result is one of the three expected classifications
    const valid = ['day', 'twilight', 'night'];
    assert.ok(valid.includes(result), `unexpected time of day: ${result}`);

    // And: it is night-time at midnight in January
    assert.strictEqual(result, 'night');
  });

  it('Scenario: Active meteor showers shown during Perseid peak', () => {
    // Given: the date is Perseid peak (12 August)
    const date = new Date('2026-08-12T21:00:00Z');

    // When: active showers are checked
    const showers = activeMeteorShowers(date);

    // Then: Perseids are returned
    assert.ok(showers.length > 0, 'at least one shower must be active on 12 Aug');
    assert.ok(showers.some(s => s.name === 'Perseids'),
      'Perseids must be active on their peak date');
  });

  it('Scenario: No active meteor showers shown when none are active', () => {
    // Given: a quiet date in March (no shower within any window)
    const date = new Date('2026-03-01T00:00:00Z');

    // When: active showers are checked
    const showers = activeMeteorShowers(date);

    // Then: the list is empty
    assert.deepEqual(showers, [], 'no showers should be active on 1 March');
  });

  it('Scenario: Time of day is "day" at UK noon in summer', () => {
    // Given: summer noon in London
    const date   = new Date('2026-06-21T11:00:00Z');
    const latDeg = 51.5;
    const lngDeg = -0.1;

    // When: time of day is computed
    const result = timeOfDay(date, latDeg, lngDeg);

    // Then: it is day-time
    assert.strictEqual(result, 'day');
  });

  it('Scenario: Each shower entry contains enough data to display', () => {
    // Given: Geminids peak date (14 December)
    const date    = new Date('2026-12-14T00:00:00Z');
    const showers = activeMeteorShowers(date);

    // Then: Geminids are present
    const gem = showers.find(s => s.name === 'Geminids');
    assert.ok(gem, 'Geminids must be present on 14 December');

    // And: all display fields are available
    assert.ok(typeof gem.name       === 'string', 'name must be string');
    assert.ok(typeof gem.rate       === 'number', 'rate must be number');
    assert.ok(typeof gem.peakMonth  === 'number', 'peakMonth must be number');
    assert.ok(typeof gem.peakDay    === 'number', 'peakDay must be number');
  });

});
