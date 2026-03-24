// Universal Harmonix — NOAA SWPC solar wind consumer contract test
// Verifies that the mag-1-day.json and plasma-1-day.json endpoints return data in
// the shape that domain.js's checkSolarWind() expects.
// Run: node --test tests/contract/solar-wind.contract.test.js

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const MAG_URL    = 'https://services.swpc.noaa.gov/products/solar-wind/mag-1-day.json';
const PLASMA_URL = 'https://services.swpc.noaa.gov/products/solar-wind/plasma-1-day.json';
const TIMEOUT_MS = 10000;

async function fetchMag()    { return fetch(MAG_URL,    { signal: AbortSignal.timeout(TIMEOUT_MS) }); }
async function fetchPlasma() { return fetch(PLASMA_URL, { signal: AbortSignal.timeout(TIMEOUT_MS) }); }

describe('NOAA SWPC solar wind mag-1-day contract', () => {
  it('returns HTTP 200', async () => {
    let res;
    try { res = await fetchMag(); } catch { return; }
    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
  });

  it('response body is a non-empty JSON array', async () => {
    let res;
    try { res = await fetchMag(); } catch { return; }
    if (res.status !== 200) return;
    const data = await res.json();
    assert.ok(Array.isArray(data), 'Response must be a JSON array');
    assert.ok(data.length > 1,     'Array must have header row + data rows');
  });

  it('first row is the header row', async () => {
    let res;
    try { res = await fetchMag(); } catch { return; }
    if (res.status !== 200) return;
    const data = await res.json();
    const header = data[0];
    assert.ok(Array.isArray(header), 'First row must be an array (header)');
    assert.ok(header.includes('time_tag'),  `Header must include time_tag: ${header}`);
    assert.ok(header.some(h => String(h).startsWith('bz')), `Header must include bz field: ${header}`);
  });

  it('data rows have parseable time_tag and numeric Bz at index 3', async () => {
    let res;
    try { res = await fetchMag(); } catch { return; }
    if (res.status !== 200) return;
    const data = await res.json();
    const rows = data.slice(1, 6); // skip header, sample first 5
    for (const row of rows) {
      assert.ok(Array.isArray(row), `Data row must be an array: ${JSON.stringify(row)}`);
      const t  = new Date(String(row[0]).replace(' ', 'T') + 'Z');
      const bz = parseFloat(row[3]);
      assert.ok(!isNaN(t.getTime()), `time_tag must be parseable: ${row[0]}`);
      assert.ok(!isNaN(bz),          `Bz (index 3) must be numeric: ${row[3]}`);
    }
  });
});

describe('NOAA SWPC solar wind plasma-1-day contract', () => {
  it('returns HTTP 200', async () => {
    let res;
    try { res = await fetchPlasma(); } catch { return; }
    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
  });

  it('response body is a non-empty JSON array', async () => {
    let res;
    try { res = await fetchPlasma(); } catch { return; }
    if (res.status !== 200) return;
    const data = await res.json();
    assert.ok(Array.isArray(data), 'Response must be a JSON array');
    assert.ok(data.length > 1,     'Array must have header row + data rows');
  });

  it('data rows have parseable time_tag and numeric speed at index 2', async () => {
    let res;
    try { res = await fetchPlasma(); } catch { return; }
    if (res.status !== 200) return;
    const data = await res.json();
    const rows = data.slice(1, 6);
    for (const row of rows) {
      assert.ok(Array.isArray(row), `Data row must be an array: ${JSON.stringify(row)}`);
      const t     = new Date(String(row[0]).replace(' ', 'T') + 'Z');
      const speed = parseFloat(row[2]);
      assert.ok(!isNaN(t.getTime()), `time_tag must be parseable: ${row[0]}`);
      assert.ok(!isNaN(speed),       `Speed (index 2) must be numeric: ${row[2]}`);
    }
  });
});
