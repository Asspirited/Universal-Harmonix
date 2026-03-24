// Universal Harmonix — Consumer contract: postcodes.io
//
// We consume: GET /postcodes/:postcode
// We depend on:
//   body.result.latitude   — number
//   body.result.longitude  — number

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const URL = 'https://api.postcodes.io/postcodes/B11BB';

describe('postcodes.io — postcode lookup contract', () => {
  it('responds with 200', async () => {
    const res = await fetch(URL);
    assert.equal(res.status, 200, `Unexpected status: ${res.status}`);
  });

  it('returns an object with a result field', async () => {
    const res = await fetch(URL);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(typeof body === 'object' && body !== null, 'body must be an object');
    assert.ok('result' in body, 'body must have result field');
  });

  it('result contains latitude and longitude as numbers', async () => {
    const res = await fetch(URL);
    const { result } = await res.json();
    assert.ok(typeof result.latitude  === 'number', 'result.latitude must be a number');
    assert.ok(typeof result.longitude === 'number', 'result.longitude must be a number');
  });

  it('latitude and longitude are within UK bounds', async () => {
    const res = await fetch(URL);
    const { result } = await res.json();
    assert.ok(result.latitude  >= 49 && result.latitude  <= 61, `lat ${result.latitude} out of UK range`);
    assert.ok(result.longitude >= -9 && result.longitude <=  2, `lng ${result.longitude} out of UK range`);
  });
});
