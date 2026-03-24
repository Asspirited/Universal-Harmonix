// Universal Harmonix — Gherkin / BDD acceptance tests
// UH-013: Enhanced location capture
// Run: node --test tests/acceptance/location.test.js

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  reverseGeocode,
  lookupPostcode,
  looksLikeUKPostcode,
  looksLikeCoords,
  parseCoords,
} from '../../app/js/location.js';

// ── Mock fetchers ──────────────────────────────────────────────────────────────

function makeNominatimFetch(address) {
  return async () => ({
    ok: true,
    json: async () => ({ address, display_name: 'Mock Location, England' }),
  });
}

function makePostcodesFetch(lat, lng) {
  return async () => ({
    ok: true,
    json: async () => ({ result: { latitude: lat, longitude: lng } }),
  });
}

const failingFetch = async () => { throw new Error('Network unavailable'); };
const notFoundFetch = async () => ({ ok: false, status: 404, json: async () => ({}) });

// ── Feature: Enhanced location capture ────────────────────────────────────────

describe('Feature: Enhanced location capture', () => {

  // Scenarios 1 and 4 (auto-GPS on page load, GPS unavailable) require browser
  // navigator.geolocation — covered in Playwright Layer 4 when James has tested v0.1.

  it('Scenario: Investigator updates location by postcode — coordinates resolve', async () => {
    // Given: a valid UK postcode
    const postcode = 'B1 1BB';

    // When: postcode lookup is performed
    const result = await lookupPostcode(postcode, makePostcodesFetch(52.4775, -1.8990));

    // Then: lat and lng are returned
    assert.ok(typeof result.lat === 'number', 'lat must be a number');
    assert.ok(typeof result.lng === 'number', 'lng must be a number');
    assert.ok(result.lat > 50 && result.lat < 56, 'lat must be within UK range');
    assert.ok(result.lng > -8 && result.lng < 2, 'lng must be within UK range');
  });

  it('Scenario: Postcode not found — error is thrown', async () => {
    // Given: an invalid postcode
    // When: lookup is attempted
    // Then: an error is thrown (caller shows "postcode not found" message)
    await assert.rejects(
      () => lookupPostcode('ZZ99 9ZZ', notFoundFetch),
      /Postcode not found/
    );
  });

  it('Scenario: Investigator pastes coordinates — address resolves', async () => {
    // Given: lat/lng coordinates
    const lat = 52.48;
    const lng = -1.89;

    // When: reverse geocode is called
    const address = await reverseGeocode(lat, lng,
      makeNominatimFetch({ town: 'Birmingham', county: 'West Midlands' })
    );

    // Then: a readable address string is returned
    assert.ok(typeof address === 'string', 'address must be a string');
    assert.ok(address.length > 0, 'address must not be empty');
    assert.ok(address.includes('Birmingham'), 'address must include town');
  });

  it('Scenario: Reverse geocode API unavailable — error propagates', async () => {
    // When: Nominatim is unreachable
    // Then: error is thrown (caller shows fallback "coordinates only" label)
    await assert.rejects(
      () => reverseGeocode(52.48, -1.89, failingFetch),
      /Network unavailable/
    );
  });

  it('Scenario: UK postcode detection — valid postcodes recognised', () => {
    // Standard formats with and without space
    assert.ok(looksLikeUKPostcode('B1 1BB'),   'B1 1BB should be postcode');
    assert.ok(looksLikeUKPostcode('SW1A 1AA'),  'SW1A 1AA should be postcode');
    assert.ok(looksLikeUKPostcode('EC1A1BB'),   'EC1A1BB (no space) should be postcode');
    assert.ok(looksLikeUKPostcode('m1 1ae'),    'lowercase should be accepted');
  });

  it('Scenario: UK postcode detection — non-postcodes not misidentified', () => {
    assert.ok(!looksLikeUKPostcode('52.48'),         'lat should not be a postcode');
    assert.ok(!looksLikeUKPostcode('52.48, -1.89'),  'coords should not be a postcode');
    assert.ok(!looksLikeUKPostcode('Birmingham'),    'city name should not be a postcode');
    assert.ok(!looksLikeUKPostcode(''),              'empty string should not be a postcode');
  });

  it('Scenario: Coordinate string parsing — valid inputs parsed correctly', () => {
    const a = parseCoords('52.48, -1.89');
    assert.ok(a !== null, 'comma-separated should parse');
    assert.strictEqual(a.lat, 52.48);
    assert.strictEqual(a.lng, -1.89);

    const b = parseCoords('52.48 -1.89');
    assert.ok(b !== null, 'space-separated should parse');

    const c = parseCoords('not coords');
    assert.strictEqual(c, null, 'non-coords should return null');
  });

});
