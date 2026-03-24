// Universal Harmonix — Consumer contract: OpenSky Network
//
// We consume: GET /api/states/all?lamin&lomin&lamax&lomax
// We depend on: body.time (number), body.states (null | Array of 17-element arrays)
// State array positions we use: [0] icao24, [1] callsign, [7] altitude (baro), [9] speed

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const URL = 'https://opensky-network.org/api/states/all?lamin=52&lomin=-2&lamax=53&lomax=-1';

describe('OpenSky Network — API contract', () => {
  it('responds with 200 or 429 (rate limit acceptable)', async () => {
    const res = await fetch(URL);
    assert.ok([200, 429].includes(res.status), `Unexpected status: ${res.status}`);
  });

  it('returns expected body shape on 200', async () => {
    const res = await fetch(URL);
    if (res.status !== 200) return; // rate-limited — shape test skipped

    const body = await res.json();
    assert.ok(typeof body === 'object' && body !== null, 'body should be an object');
    assert.ok('time' in body,   'body must have a time field');
    assert.ok(typeof body.time === 'number', 'body.time must be a number');
    assert.ok(body.states === null || Array.isArray(body.states),
      'body.states must be null or an array');
  });

  it('state array positions match expected types when states present', async () => {
    const res = await fetch(URL);
    if (res.status !== 200) return;
    const body = await res.json();
    if (!Array.isArray(body.states) || body.states.length === 0) return; // no aircraft in range

    const state = body.states[0];
    assert.ok(Array.isArray(state), 'each state must be an array');
    assert.ok(state.length >= 17,   'state array must have at least 17 elements');
    // [0] icao24 — string
    assert.ok(typeof state[0] === 'string', 'state[0] (icao24) must be a string');
    // [1] callsign — string or null
    assert.ok(state[1] === null || typeof state[1] === 'string',
      'state[1] (callsign) must be string or null');
    // [7] baro altitude — number or null
    assert.ok(state[7] === null || typeof state[7] === 'number',
      'state[7] (baro_altitude) must be number or null');
    // [9] velocity — number or null
    assert.ok(state[9] === null || typeof state[9] === 'number',
      'state[9] (velocity) must be number or null');
  });
});
