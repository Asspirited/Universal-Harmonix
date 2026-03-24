// Universal Harmonix — Consumer contract: Nominatim reverse geocode
//
// We consume: GET /reverse?lat&lon&format=json
// We depend on:
//   body.address          — object with address components
//   body.display_name     — full address string fallback

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const URL = 'https://nominatim.openstreetmap.org/reverse'
  + '?lat=52.48&lon=-1.89&format=json';

const HEADERS = {
  'Accept-Language': 'en',
  'User-Agent': 'UniversalHarmonix/0.1 (https://github.com/Asspirited/Universal-Harmonix)',
};

describe('Nominatim — reverse geocode contract', () => {
  it('responds with 200', async () => {
    const res = await fetch(URL, { headers: HEADERS });
    assert.equal(res.status, 200, `Unexpected status: ${res.status}`);
  });

  it('returns an object with address and display_name', async () => {
    const res = await fetch(URL, { headers: HEADERS });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(typeof body === 'object' && body !== null, 'body must be an object');
    assert.ok('address'      in body, 'body must have address field');
    assert.ok('display_name' in body, 'body must have display_name field');
  });

  it('address is an object', async () => {
    const res = await fetch(URL, { headers: HEADERS });
    const { address } = await res.json();
    assert.ok(typeof address === 'object' && address !== null, 'address must be an object');
  });

  it('display_name is a non-empty string', async () => {
    const res = await fetch(URL, { headers: HEADERS });
    const { display_name } = await res.json();
    assert.ok(typeof display_name === 'string' && display_name.length > 0,
      'display_name must be a non-empty string');
  });
});
