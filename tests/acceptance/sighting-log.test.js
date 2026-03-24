// Universal Harmonix — Gherkin / BDD acceptance tests
// UH-001: Sighting log and verification
// Run: node --test tests/acceptance/sighting-log.test.js

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { verifySighting } from '../../app/js/domain.js';

// ── Shared mock fetchers ───────────────────────────────────────────────────────

// Helper: build a mock response that supports both .json() and .text()
function mockRes(url) {
  const nowTag = new Date().toISOString().replace('T', ' ').replace('Z', '');
  const bodies = {
    opensky:     { json: { states: [] } },
    wheretheiss: { json: [{ latitude: 0, longitude: 0, altitude: 408 }] },
    'open-meteo':{ json: { hourly: { cloud_cover: new Array(24).fill(5), visibility: new Array(24).fill(30000), wind_speed_10m: new Array(24).fill(3) } } },
    celestrak:   { text: '' },  // empty TLE → no_match
    'swpc.noaa': { json: [[nowTag, 2.0, 'estimated']] },  // Kp 2 → no_match
  };
  const key = Object.keys(bodies).find(k => url.includes(k));
  const body = bodies[key] || { json: {} };
  return {
    ok:   true,
    json: async () => body.json ?? {},
    text: async () => body.text ?? JSON.stringify(body.json ?? {}),
  };
}

// All sources return clear-sky / no-match data
const cleanSkyFetcher = async (url) => mockRes(url);

// All external sources fail (network outage)
const failingFetcher = async () => { throw new Error('Network unavailable'); };

// Aircraft detected in area
const aircraftFetcher = async (url) => {
  if (url.includes('opensky')) {
    return {
      ok: true,
      json: async () => ({ states: [['abc', 'BAW001 ', 'UK', 0, 0, -1.89, 52.48, 8000, false, 250, 90, null, null, null, 'ADSB', null, 0]] }),
      text: async () => '',
    };
  }
  return mockRes(url);
};

// ── Feature: Sighting log and verification ─────────────────────────────────────

describe('Feature: Sighting log and verification', () => {

  it('Scenario: Investigator submits a sighting and receives a full verification panel', async () => {
    // Given: a valid sighting — recent, Birmingham area
    const recentTime = new Date(Date.now() - 60_000).toISOString();
    const sighting = { datetime: recentTime, lat: 52.48, lng: -1.89 };

    // When: the sighting is submitted for verification
    const result = await verifySighting(sighting, cleanSkyFetcher);

    // Then: verification panel includes results from all data sources
    assert.ok(result.aircraft,   'verification panel must include aircraft result');
    assert.ok(result.iss,        'verification panel must include ISS result');
    assert.ok(result.starlink,   'verification panel must include starlink result');
    assert.ok(result.weather,    'verification panel must include weather result');
    assert.ok(result.radiosonde, 'verification panel must include radiosonde result');
    assert.ok(result.kp,         'verification panel must include kp result');

    // And: each source shows a valid status
    const validStatuses = ['match', 'no_match', 'possible_match', 'unverified'];
    for (const [source, res] of Object.entries({ aircraft: result.aircraft, iss: result.iss, starlink: result.starlink, weather: result.weather, radiosonde: result.radiosonde, kp: result.kp })) {
      assert.ok(validStatuses.includes(res.status), `${source} has invalid status: ${res.status}`);
      assert.ok(res.detail, `${source} must include a human-readable detail string`);
    }

    // And: the sighting is assigned one of the four valid verdicts
    const validVerdicts = ['UNEXPLAINED', 'PARTIAL MATCH', 'LIKELY EXPLAINED', 'UNVERIFIED'];
    assert.ok(validVerdicts.includes(result.verdict), `Unexpected verdict: ${result.verdict}`);
  });

  it('Scenario: An API source fails — remaining sources display normally, verdict still assigned', async () => {
    // Given: a valid recent sighting
    const recentTime = new Date(Date.now() - 60_000).toISOString();
    const sighting = { datetime: recentTime, lat: 52.48, lng: -1.89 };

    // When: all external APIs are unavailable
    const result = await verifySighting(sighting, failingFetcher);

    // Then: external sources show "unverified"
    assert.strictEqual(result.aircraft.status, 'unverified', 'failed aircraft API must show unverified');
    assert.strictEqual(result.iss.status,      'unverified', 'failed ISS API must show unverified');
    assert.strictEqual(result.starlink.status, 'unverified', 'failed starlink API must show unverified');
    assert.strictEqual(result.weather.status,  'unverified', 'failed weather API must show unverified');
    assert.strictEqual(result.kp.status,       'unverified', 'failed kp API must show unverified');

    // And: radiosonde (static logic) still returns a result
    assert.ok(['no_match', 'possible_match'].includes(result.radiosonde.status),
      'radiosonde must return a result even when network fails');

    // And: a verdict is still assigned despite API failures
    const validVerdicts = ['UNEXPLAINED', 'PARTIAL MATCH', 'LIKELY EXPLAINED', 'UNVERIFIED'];
    assert.ok(validVerdicts.includes(result.verdict), `Must still return a verdict: got ${result.verdict}`);
  });

  it('Scenario: Aircraft detected in area — sighting is LIKELY EXPLAINED', async () => {
    // Given: a recent sighting near Birmingham
    const recentTime = new Date(Date.now() - 60_000).toISOString();
    const sighting = { datetime: recentTime, lat: 52.48, lng: -1.89 };

    // When: verification detects aircraft in the area
    const result = await verifySighting(sighting, aircraftFetcher);

    // Then: aircraft source shows a match
    assert.strictEqual(result.aircraft.status, 'match', 'aircraft source must show match');

    // And: verdict is LIKELY EXPLAINED
    assert.strictEqual(result.verdict, 'LIKELY EXPLAINED', 'aircraft match must produce LIKELY EXPLAINED verdict');
  });

  it('Scenario: All sources clear — sighting returns UNEXPLAINED or PARTIAL MATCH', async () => {
    // Given: a sighting outside radiosonde windows (06:00 UTC) in a clear-sky area
    const sighting = { datetime: '2026-03-24T06:00:00Z', lat: 52.48, lng: -1.89 };

    // When: verification finds no matches
    const result = await verifySighting(sighting, cleanSkyFetcher);

    // Then: verdict is UNEXPLAINED or PARTIAL MATCH (no full match)
    assert.ok(
      ['UNEXPLAINED', 'PARTIAL MATCH'].includes(result.verdict),
      `Expected UNEXPLAINED or PARTIAL MATCH when all sources clear, got: ${result.verdict}`
    );
    assert.notStrictEqual(result.verdict, 'LIKELY EXPLAINED', 'should not be LIKELY EXPLAINED with no matches');
  });

  it('Scenario: Geomagnetic storm detected — sighting returns PARTIAL MATCH', async () => {
    // Given: a recent sighting during a storm-level Kp event (Kp ≥ 5)
    const recentTime = new Date(Date.now() - 60_000).toISOString();
    const nowTag = new Date().toISOString().replace('T', ' ').replace('Z', '');

    const kpStormFetcher = async (url) => {
      if (url.includes('swpc.noaa')) {
        return { ok: true, json: async () => [[nowTag, 5.67, 'estimated']], text: async () => '' };
      }
      return mockRes(url);
    };

    // When: verification detects storm-level Kp, all other sources clear
    const result = await verifySighting({ datetime: recentTime, lat: 52.48, lng: -1.89 }, kpStormFetcher);

    // Then: Kp shows possible_match with storm flag
    assert.strictEqual(result.kp.status, 'possible_match', 'storm Kp must produce possible_match');
    assert.ok(result.kp.detail.toLowerCase().includes('storm'), 'detail must mention storm');

    // And: verdict is PARTIAL MATCH (possible_match but no full match)
    assert.strictEqual(result.verdict, 'PARTIAL MATCH', 'storm Kp alone must produce PARTIAL MATCH');
  });

});
