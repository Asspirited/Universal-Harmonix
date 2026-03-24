// Universal Harmonix — Gherkin / BDD acceptance tests
// UH-033: Enrichment pipeline — Kp, weather, moon phase

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildContext } from '../../scripts/lib/build-context.js';
import { kpLevel } from '../../scripts/lib/kp-index.js';
import { moonPhase } from '../../scripts/lib/moon-calc.js';

const makeRecord = (overrides = {}) => ({
  id: 'r1',
  datetime: '2005-06-15T21:00:00Z',
  lat: 52.48,
  lon: -1.90,
  tags: { hynek: 'NL', shape: ['orb'] },
  ...overrides,
});

const mockKpClient   = async () => ({ datetime: ['2005-06-15T21:00:00Z'], Kp: [3.7] });
const mockWeatherClient = async () => ({
  hourly: { time: ['2005-06-15T21:00'], cloudcover: [42] },
});

describe('Feature: Enrichment pipeline — environmental context', () => {

  it('Scenario: Record with coordinates is enriched successfully', async () => {
    const record  = makeRecord();
    const context = await buildContext(record, mockKpClient, mockWeatherClient);

    // Kp
    assert.ok(typeof context.kp_index === 'number');
    assert.ok(typeof context.kp_level === 'string');

    // Weather
    assert.ok(typeof context.cloud_cover_pct === 'number');

    // Moon
    assert.ok(typeof context.moon_phase === 'string');
    assert.ok(typeof context.moon_illumination === 'number');
  });

  it('Scenario: Record without coordinates is skipped cleanly', async () => {
    const record  = makeRecord({ lat: null, lon: null });
    const context = await buildContext(record, mockKpClient, mockWeatherClient);

    assert.strictEqual(context.skipped, true);
    assert.strictEqual(context.reason, 'no coordinates');
  });

  it('Scenario: Kp level label is derived correctly from index', () => {
    assert.strictEqual(kpLevel(1),   'quiet');
    assert.strictEqual(kpLevel(3.5), 'unsettled');
    assert.strictEqual(kpLevel(4.0), 'active');
    assert.strictEqual(kpLevel(5.0), 'minor storm');
    assert.strictEqual(kpLevel(6.0), 'major storm');
  });

  it('Scenario: Open-Meteo API failure does not abort the pipeline', async () => {
    const failWeather = async () => { throw new Error('API error'); };
    const record  = makeRecord();
    const context = await buildContext(record, mockKpClient, failWeather);

    assert.strictEqual(context.skipped, true);
    assert.strictEqual(context.reason, 'api error');
  });

  it('Scenario: Moon phase is calculated without an API call', () => {
    // moonPhase is a pure function — no async, no fetch
    const result = moonPhase('2005-06-15T21:00:00Z');
    assert.ok(result.moon_phase);
    assert.ok(result.moon_illumination >= 0 && result.moon_illumination <= 1);
  });

});
