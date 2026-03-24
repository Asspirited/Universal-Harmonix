// Universal Harmonix — unit tests for kp-index.js
// UH-033: Kp level labelling + response parsing

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { kpLevel, parseKpResponse } from '../scripts/lib/kp-index.js';

describe('kpLevel', () => {

  it('0–2.9 → quiet', () => {
    assert.strictEqual(kpLevel(0),   'quiet');
    assert.strictEqual(kpLevel(1.5), 'quiet');
    assert.strictEqual(kpLevel(2.9), 'quiet');
  });

  it('3–3.9 → unsettled', () => {
    assert.strictEqual(kpLevel(3),   'unsettled');
    assert.strictEqual(kpLevel(3.67),'unsettled');
  });

  it('4–4.9 → active', () => {
    assert.strictEqual(kpLevel(4),   'active');
    assert.strictEqual(kpLevel(4.5), 'active');
  });

  it('5–5.9 → minor storm', () => {
    assert.strictEqual(kpLevel(5),   'minor storm');
    assert.strictEqual(kpLevel(5.9), 'minor storm');
  });

  it('6+ → major storm', () => {
    assert.strictEqual(kpLevel(6),   'major storm');
    assert.strictEqual(kpLevel(9),   'major storm');
  });

});

describe('parseKpResponse', () => {

  // GFZ Potsdam returns arrays: datetime (3-hourly) + Kp values
  const MOCK_RESPONSE = {
    datetime: [
      '2005-06-15T00:00:00Z',
      '2005-06-15T03:00:00Z',
      '2005-06-15T06:00:00Z',
      '2005-06-15T09:00:00Z',
      '2005-06-15T12:00:00Z',
      '2005-06-15T15:00:00Z',
      '2005-06-15T18:00:00Z',
      '2005-06-15T21:00:00Z',
    ],
    Kp: [1.0, 1.3, 2.0, 2.7, 3.3, 4.0, 2.3, 3.7],
  };

  it('returns the Kp value for the 3-hour window containing the sighting time', () => {
    // 21:00 → window starting at 21:00
    const result = parseKpResponse(MOCK_RESPONSE, '2005-06-15T21:00:00Z');
    assert.strictEqual(result.kp_index, 3.7);
    assert.strictEqual(result.kp_level, 'unsettled');
  });

  it('15:30 falls in the 15:00 window', () => {
    const result = parseKpResponse(MOCK_RESPONSE, '2005-06-15T15:30:00Z');
    assert.strictEqual(result.kp_index, 4.0);
    assert.strictEqual(result.kp_level, 'active');
  });

  it('returns null when no matching window found', () => {
    const result = parseKpResponse({ datetime: [], Kp: [] }, '2005-06-15T21:00:00Z');
    assert.strictEqual(result, null);
  });

});
