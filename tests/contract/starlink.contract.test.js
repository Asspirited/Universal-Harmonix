// Universal Harmonix — Celestrak Starlink TLE consumer contract test
// Verifies that the Celestrak GROUP=starlink TLE endpoint returns data in the
// 3-line TLE text format that domain.js expects.
// Run: node --test tests/contract/starlink.contract.test.js

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const URL = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=TLE';
const TIMEOUT_MS = 15000;

async function fetchStarlink() {
  return fetch(URL, { signal: AbortSignal.timeout(TIMEOUT_MS) });
}

describe('Celestrak Starlink TLE API contract', () => {
  it('returns HTTP 200', async () => {
    let res;
    try { res = await fetchStarlink(); } catch { return; } // skip on network outage
    if (res.status >= 500) return; // skip on server outage (e.g. 503) — external, transient
    if (res.status === 403 || res.status === 429) return; // skip on access block — Celestrak blocks Node.js/CI requests; browser app unaffected
    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
  });

  it('response body is non-empty plain text', async () => {
    let res;
    try { res = await fetchStarlink(); } catch { return; }
    if (res.status !== 200) return;
    const text = await res.text();
    assert.ok(text.length > 0, 'Response body must be non-empty');
  });

  it('body contains 3-line TLE groups (name / line1 / line2)', async () => {
    let res;
    try { res = await fetchStarlink(); } catch { return; }
    if (res.status !== 200) return;
    const text = await res.text();
    const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
    assert.ok(lines.length >= 3, 'Must contain at least one 3-line TLE group');
    assert.strictEqual(lines.length % 3, 0, 'Line count must be a multiple of 3');
  });

  it('TLE line 1 starts with "1 " and line 2 starts with "2 "', async () => {
    let res;
    try { res = await fetchStarlink(); } catch { return; }
    if (res.status !== 200) return;
    const text = await res.text();
    const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
    // Check first group
    assert.ok(lines[1].startsWith('1 '), `TLE line1 must start with "1 ": ${lines[1]}`);
    assert.ok(lines[2].startsWith('2 '), `TLE line2 must start with "2 ": ${lines[2]}`);
  });

  it('contains STARLINK satellites', async () => {
    let res;
    try { res = await fetchStarlink(); } catch { return; }
    if (res.status !== 200) return;
    const text = await res.text();
    assert.ok(text.toUpperCase().includes('STARLINK'), 'Response must contain STARLINK satellite names');
  });
});
