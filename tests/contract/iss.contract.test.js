// Universal Harmonix — Consumer contract: wheretheiss.at
//
// We consume: GET /v1/satellites/25544/positions?timestamps=<unix>&units=kilometers
// We depend on: array of position objects, each with:
//   satid (number), satname (string), timestamp (number),
//   latitude (number), longitude (number), altitude (number)

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const TIMESTAMP = 1700000000; // fixed past timestamp — stable for contract tests
const URL = `https://api.wheretheiss.at/v1/satellites/25544/positions?timestamps=${TIMESTAMP}&units=kilometers`;

// WL-007: wheretheiss.at has known intermittent outages.
// Tests skip gracefully when the API is unreachable rather than failing the contract layer.
async function fetchISS() {
  try {
    return await fetch(URL, { signal: AbortSignal.timeout(10000) });
  } catch {
    return null; // timeout or network error
  }
}

describe('wheretheiss.at — API contract', () => {
  it('responds with 200 when reachable', async () => {
    const res = await fetchISS();
    if (!res) { return; } // WL-007 — skip on outage
    assert.equal(res.status, 200, `Unexpected status: ${res.status}`);
  });

  it('returns an array with at least one position object', async () => {
    const res = await fetchISS();
    if (!res || res.status !== 200) return; // WL-007 — skip on outage
    const body = await res.json();
    assert.ok(Array.isArray(body), 'response should be an array');
    assert.ok(body.length >= 1,   'response should contain at least one position');
  });

  it('position object contains required fields with correct types', async () => {
    const res = await fetchISS();
    if (!res || res.status !== 200) return;
    const [pos] = await res.json();

    // API uses `id` and `name`, not `satid`/`satname`
    assert.ok(typeof pos.id        === 'number', 'id must be a number');
    assert.ok(typeof pos.name      === 'string', 'name must be a string');
    assert.ok(typeof pos.timestamp === 'number', 'timestamp must be a number');
    assert.ok(typeof pos.latitude  === 'number', 'latitude must be a number');
    assert.ok(typeof pos.longitude === 'number', 'longitude must be a number');
    assert.ok(typeof pos.altitude  === 'number', 'altitude must be a number');
  });

  it('id is 25544 (ISS NORAD ID)', async () => {
    const res = await fetchISS();
    if (!res || res.status !== 200) return;
    const [pos] = await res.json();
    assert.equal(pos.id, 25544);
  });

  it('latitude and longitude are within valid ranges', async () => {
    const res = await fetchISS();
    if (!res || res.status !== 200) return;
    const [pos] = await res.json();
    assert.ok(pos.latitude  >= -90  && pos.latitude  <= 90,  'latitude out of range');
    assert.ok(pos.longitude >= -180 && pos.longitude <= 180, 'longitude out of range');
  });
});
