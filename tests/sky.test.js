// Universal Harmonix — Unit tests: sky calculations
// Run: node --test tests/sky.test.js

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  moonPhase,
  timeOfDay,
  activeMeteorShowers,
  METEOR_SHOWERS,
} from '../app/js/sky.js';

// ── moonPhase ─────────────────────────────────────────────────────────────────

describe('moonPhase', () => {
  it('returns an object with phase, illumination, and name', () => {
    const result = moonPhase(new Date('2026-03-24T00:00:00Z'));
    assert.ok(typeof result.phase        === 'number', 'phase must be a number');
    assert.ok(typeof result.illumination === 'number', 'illumination must be a number');
    assert.ok(typeof result.name         === 'string', 'name must be a string');
  });

  it('phase is normalised between 0 and 1', () => {
    const result = moonPhase(new Date('2026-03-24T00:00:00Z'));
    assert.ok(result.phase >= 0 && result.phase < 1, `phase out of range: ${result.phase}`);
  });

  it('illumination is between 0 and 100', () => {
    const result = moonPhase(new Date('2026-03-24T00:00:00Z'));
    assert.ok(result.illumination >= 0 && result.illumination <= 100,
      `illumination out of range: ${result.illumination}`);
  });

  it('name is one of the eight recognised phase names', () => {
    const valid = [
      'New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous',
      'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent',
    ];
    const result = moonPhase(new Date('2026-03-24T00:00:00Z'));
    assert.ok(valid.includes(result.name), `unexpected phase name: ${result.name}`);
  });

  it('known new moon epoch returns phase ≈ 0 and low illumination', () => {
    const result = moonPhase(new Date('2000-01-06T18:14:00Z'));
    assert.ok(result.phase < 0.05, `expected phase ≈ 0, got ${result.phase}`);
    assert.ok(result.illumination < 5, `expected illumination ≈ 0, got ${result.illumination}`);
  });

  it('roughly full moon ~14.7 days after new moon has illumination > 90', () => {
    const base   = new Date('2000-01-06T18:14:00Z');
    const fullMoon = new Date(base.getTime() + 14.77 * 86_400_000);
    const result = moonPhase(fullMoon);
    assert.ok(result.illumination > 90, `expected illumination > 90, got ${result.illumination}`);
  });

  it('defaults to approximately now without throwing', () => {
    assert.doesNotThrow(() => moonPhase());
    const result = moonPhase();
    assert.ok(result.illumination >= 0 && result.illumination <= 100);
  });
});

// ── timeOfDay ─────────────────────────────────────────────────────────────────

describe('timeOfDay', () => {
  it('returns one of day / twilight / night', () => {
    const valid = ['day', 'twilight', 'night'];
    const result = timeOfDay(new Date('2026-03-24T12:00:00Z'), 51.5, -0.1);
    assert.ok(valid.includes(result), `unexpected value: ${result}`);
  });

  it('returns "day" for UK noon in summer', () => {
    // Summer solstice UTC noon, London — sun is well above horizon
    const result = timeOfDay(new Date('2026-06-21T11:00:00Z'), 51.5, -0.1);
    assert.strictEqual(result, 'day');
  });

  it('returns "night" for UK midnight in winter', () => {
    const result = timeOfDay(new Date('2026-01-15T00:00:00Z'), 51.5, -0.1);
    assert.strictEqual(result, 'night');
  });

  it('defaults to approximately now without throwing', () => {
    assert.doesNotThrow(() => timeOfDay());
    const result = timeOfDay();
    assert.ok(['day', 'twilight', 'night'].includes(result));
  });
});

// ── activeMeteorShowers ────────────────────────────────────────────────────────

describe('activeMeteorShowers', () => {
  it('returns an array', () => {
    const result = activeMeteorShowers(new Date('2026-03-24T00:00:00Z'));
    assert.ok(Array.isArray(result));
  });

  it('returns empty array when no shower is active', () => {
    // 1 March — no shower peaks nearby
    const result = activeMeteorShowers(new Date('2026-03-01T00:00:00Z'));
    assert.deepEqual(result, []);
  });

  it('returns Perseids on their peak date (12 Aug)', () => {
    const result = activeMeteorShowers(new Date('2026-08-12T00:00:00Z'));
    const names = result.map(s => s.name);
    assert.ok(names.includes('Perseids'), `Perseids not found in: ${names}`);
  });

  it('returns Perseids within their window (±5 days of 12 Aug)', () => {
    const result = activeMeteorShowers(new Date('2026-08-10T00:00:00Z'));
    assert.ok(result.some(s => s.name === 'Perseids'), 'Perseids should be active 2 days before peak');
  });

  it('does not return Perseids 10 days before their peak', () => {
    const result = activeMeteorShowers(new Date('2026-08-02T00:00:00Z'));
    assert.ok(!result.some(s => s.name === 'Perseids'), 'Perseids should not be active 10 days early');
  });

  it('each result has required fields', () => {
    const result = activeMeteorShowers(new Date('2026-08-12T00:00:00Z'));
    for (const s of result) {
      assert.ok(typeof s.name       === 'string', 'name must be string');
      assert.ok(typeof s.peakMonth  === 'number', 'peakMonth must be number');
      assert.ok(typeof s.peakDay    === 'number', 'peakDay must be number');
      assert.ok(typeof s.windowDays === 'number', 'windowDays must be number');
      assert.ok(typeof s.rate       === 'number', 'rate must be number');
    }
  });

  it('METEOR_SHOWERS contains 8 well-known annual showers', () => {
    assert.strictEqual(METEOR_SHOWERS.length, 8);
    const names = METEOR_SHOWERS.map(s => s.name);
    assert.ok(names.includes('Perseids'),   'Perseids must be present');
    assert.ok(names.includes('Geminids'),   'Geminids must be present');
    assert.ok(names.includes('Leonids'),    'Leonids must be present');
    assert.ok(names.includes('Quadrantids'),'Quadrantids must be present');
  });
});
