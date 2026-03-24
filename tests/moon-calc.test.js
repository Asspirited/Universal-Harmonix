// Universal Harmonix — unit tests for moon-calc.js
// UH-033: moon phase pure calculation

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { moonPhase } from '../scripts/lib/moon-calc.js';

describe('moonPhase', () => {

  it('returns moon_phase string and moon_illumination number', () => {
    const result = moonPhase('2005-06-15T21:00:00Z');
    assert.ok(typeof result.moon_phase === 'string');
    assert.ok(typeof result.moon_illumination === 'number');
  });

  it('illumination is between 0 and 1', () => {
    const result = moonPhase('2010-11-01T01:00:00Z');
    assert.ok(result.moon_illumination >= 0);
    assert.ok(result.moon_illumination <= 1);
  });

  it('full moon gives high illumination', () => {
    // 2010-01-30 was a full moon
    const result = moonPhase('2010-01-30T00:00:00Z');
    assert.ok(result.moon_illumination > 0.9, `expected >0.9, got ${result.moon_illumination}`);
    assert.strictEqual(result.moon_phase, 'Full Moon');
  });

  it('new moon gives low illumination', () => {
    // 2010-01-15 was a new moon
    const result = moonPhase('2010-01-15T00:00:00Z');
    assert.ok(result.moon_illumination < 0.1, `expected <0.1, got ${result.moon_illumination}`);
    assert.strictEqual(result.moon_phase, 'New Moon');
  });

  it('phase names are one of the 8 standard names', () => {
    const VALID = new Set([
      'New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous',
      'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent',
    ]);
    const dates = [
      '2005-01-01', '2005-04-15', '2005-07-20', '2005-10-31',
      '2010-03-07', '2010-06-26', '2010-09-12', '2010-12-05',
    ];
    for (const d of dates) {
      const { moon_phase } = moonPhase(`${d}T00:00:00Z`);
      assert.ok(VALID.has(moon_phase), `unexpected phase "${moon_phase}" for ${d}`);
    }
  });

});
