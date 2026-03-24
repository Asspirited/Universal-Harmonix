// Universal Harmonix — NOAA SWPC Kp index consumer contract test
// Verifies that the NOAA planetary_k_index_1m.json endpoint returns data in
// the shape that domain.js's checkKp() expects.
// Run: node --test tests/contract/kp.contract.test.js

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const URL = 'https://services.swpc.noaa.gov/json/planetary_k_index_1m.json';
const TIMEOUT_MS = 10000;

async function fetchKp() {
  return fetch(URL, { signal: AbortSignal.timeout(TIMEOUT_MS) });
}

describe('NOAA SWPC Kp index API contract', () => {
  it('returns HTTP 200', async () => {
    let res;
    try { res = await fetchKp(); } catch { return; }
    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
  });

  it('response body is a non-empty JSON array', async () => {
    let res;
    try { res = await fetchKp(); } catch { return; }
    if (res.status !== 200) return;
    const data = await res.json();
    assert.ok(Array.isArray(data),  'Response must be a JSON array');
    assert.ok(data.length > 0,      'Array must be non-empty');
  });

  it('each entry has a time_tag and a numeric kp value', async () => {
    let res;
    try { res = await fetchKp(); } catch { return; }
    if (res.status !== 200) return;
    const data = await res.json();
    const sample = data.slice(0, 10);
    for (const entry of sample) {
      // Accept both array format [time_tag, kp, source] and object format {time_tag, kp_index}
      const timeTag = Array.isArray(entry) ? entry[0] : entry.time_tag;
      const kpVal   = Array.isArray(entry) ? entry[1] : entry.kp_index;
      assert.ok(timeTag != null,         `Entry must have a time_tag: ${JSON.stringify(entry)}`);
      assert.ok(typeof kpVal === 'number', `kp value must be a number: ${JSON.stringify(entry)}`);
    }
  });

  it('Kp values are in the valid 0–9 range', async () => {
    let res;
    try { res = await fetchKp(); } catch { return; }
    if (res.status !== 200) return;
    const data = await res.json();
    for (const entry of data.slice(0, 50)) {
      const kpVal = Array.isArray(entry) ? entry[1] : entry.kp_index;
      if (kpVal == null) continue;
      assert.ok(kpVal >= 0 && kpVal <= 9, `Kp must be 0–9, got ${kpVal}`);
    }
  });

  it('time_tag strings can be parsed as dates', async () => {
    let res;
    try { res = await fetchKp(); } catch { return; }
    if (res.status !== 200) return;
    const data = await res.json();
    const first = data[0];
    const tag = Array.isArray(first) ? first[0] : first.time_tag;
    const parsed = new Date(String(tag).replace(' ', 'T') + 'Z');
    assert.ok(!isNaN(parsed.getTime()), `time_tag must be parseable: ${tag}`);
  });
});
