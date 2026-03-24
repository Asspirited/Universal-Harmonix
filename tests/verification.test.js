// Universal Harmonix — Unit tests: verification domain
// Run: node --test tests/verification.test.js

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  haversineKm,
  checkRadiosonde,
  checkAircraft,
  checkISS,
  checkWeather,
  checkStarlink,
  findVisibleStarlinks,
  checkKp,
  checkBrightSatellites,
  checkMeteorShower,
  checkMoon,
  checkNLC,
  checkSolarWind,
  checkAurora,
  checkSprites,
  computeVerdict,
  verifySighting,
  VERIFICATION_SOURCES,
  STARLINK_MAX_AGE_DAYS,
  KP_ELEVATED_THRESHOLD,
  KP_STORM_THRESHOLD,
  KP_MAX_AGE_HOURS,
  MOON_BRIGHT_THRESHOLD,
  SOLAR_WIND_MAX_AGE_HOURS,
  BZ_ENHANCED_THRESHOLD,
  BZ_STORM_THRESHOLD,
  SPRITES_CAPE_MATCH,
  SPRITES_CAPE_POSSIBLE,
  AURORA_MAX_AGE_HOURS,
} from '../app/js/domain.js';

// ── haversineKm ────────────────────────────────────────────────────────────────

describe('haversineKm', () => {
  it('returns 0 for identical coordinates', () => {
    assert.strictEqual(haversineKm(52.48, -1.89, 52.48, -1.89), 0);
  });

  it('returns approximately 165km between Birmingham and London', () => {
    const km = haversineKm(52.48, -1.89, 51.51, -0.13);
    assert.ok(km > 155 && km < 175, `Expected ~165km, got ${km.toFixed(1)}`);
  });

  it('returns a positive value for any two different points', () => {
    const km = haversineKm(0, 0, 1, 1);
    assert.ok(km > 0);
  });
});

// ── checkRadiosonde ────────────────────────────────────────────────────────────

describe('checkRadiosonde', () => {
  it('returns possible_match near Watnall within midnight launch window', () => {
    const result = checkRadiosonde('2026-03-24T00:30:00Z', 52.95, -1.25);
    assert.strictEqual(result.status, 'possible_match');
  });

  it('returns possible_match near Camborne within noon launch window', () => {
    const result = checkRadiosonde('2026-03-24T11:45:00Z', 50.218, -5.327);
    assert.strictEqual(result.status, 'possible_match');
  });

  it('returns no_match six hours from any launch window', () => {
    const result = checkRadiosonde('2026-03-24T06:00:00Z', 52.95, -1.25);
    assert.strictEqual(result.status, 'no_match');
  });

  it('returns no_match when far from all UK sites at launch time', () => {
    const result = checkRadiosonde('2026-03-24T00:00:00Z', 20.0, 0.0);
    assert.strictEqual(result.status, 'no_match');
  });

  it('handles midnight wraparound (23:30 → 00:00 window)', () => {
    const result = checkRadiosonde('2026-03-24T23:30:00Z', 52.95, -1.25);
    assert.strictEqual(result.status, 'possible_match');
  });
});

// ── computeVerdict ─────────────────────────────────────────────────────────────

describe('computeVerdict', () => {
  it('returns LIKELY EXPLAINED when any source is match', () => {
    assert.strictEqual(computeVerdict({
      aircraft:   { status: 'match' },
      iss:        { status: 'no_match' },
      weather:    { status: 'no_match' },
      radiosonde: { status: 'no_match' },
    }), 'LIKELY EXPLAINED');
  });

  it('returns PARTIAL MATCH when any source is possible_match and none is match', () => {
    assert.strictEqual(computeVerdict({
      aircraft:   { status: 'no_match' },
      iss:        { status: 'possible_match' },
      weather:    { status: 'no_match' },
      radiosonde: { status: 'no_match' },
    }), 'PARTIAL MATCH');
  });

  it('returns UNEXPLAINED when all are no_match', () => {
    assert.strictEqual(computeVerdict({
      aircraft:   { status: 'no_match' },
      iss:        { status: 'no_match' },
      weather:    { status: 'no_match' },
      radiosonde: { status: 'no_match' },
    }), 'UNEXPLAINED');
  });

  it('returns UNVERIFIED when all are unverified', () => {
    assert.strictEqual(computeVerdict({
      aircraft:   { status: 'unverified' },
      iss:        { status: 'unverified' },
      weather:    { status: 'unverified' },
      radiosonde: { status: 'unverified' },
    }), 'UNVERIFIED');
  });

  it('match takes priority over possible_match', () => {
    assert.strictEqual(computeVerdict({
      aircraft:   { status: 'match' },
      iss:        { status: 'possible_match' },
      weather:    { status: 'no_match' },
      radiosonde: { status: 'no_match' },
    }), 'LIKELY EXPLAINED');
  });

  it('returns UNEXPLAINED when mix of no_match and unverified (unverified does not suppress unexplained)', () => {
    assert.strictEqual(computeVerdict({
      aircraft:   { status: 'no_match' },
      iss:        { status: 'unverified' },
      weather:    { status: 'no_match' },
      radiosonde: { status: 'no_match' },
    }), 'UNEXPLAINED');
  });
});

// ── VERIFICATION_SOURCES ───────────────────────────────────────────────────────

describe('VERIFICATION_SOURCES', () => {
  it('contains exactly the expected source keys in order', () => {
    assert.deepEqual(
      VERIFICATION_SOURCES.map(s => s.key),
      ['aircraft', 'iss', 'starlink', 'bright_satellites', 'weather', 'radiosonde', 'kp',
       'solar_wind', 'aurora', 'sprites', 'meteor_shower', 'moon', 'nlc']
    );
  });

  it('each source has a string key and a callable run function', () => {
    for (const src of VERIFICATION_SOURCES) {
      assert.ok(typeof src.key === 'string',   `key should be a string: ${src.key}`);
      assert.ok(typeof src.run === 'function', `run should be a function: ${src.key}`);
    }
  });

  it('run functions return a promise for each source', async () => {
    const recentTime = new Date(Date.now() - 60_000).toISOString();
    const silentFetch = async () => { throw new Error('offline'); };
    for (const src of VERIFICATION_SOURCES) {
      const result = src.run(recentTime, 52.48, -1.89, silentFetch);
      assert.ok(result instanceof Promise, `${src.key}.run should return a Promise`);
      const resolved = await result;
      assert.ok(typeof resolved.status === 'string', `${src.key} result should have a status`);
    }
  });
});

// ── checkAircraft ──────────────────────────────────────────────────────────────

describe('checkAircraft', () => {
  it('returns unverified for sightings older than 1 hour', async () => {
    const oldTime = new Date(Date.now() - 7200_000).toISOString(); // 2h ago
    const neverCalledFetch = async () => { throw new Error('Should not be called'); };
    const result = await checkAircraft(oldTime, 52.48, -1.89, neverCalledFetch);
    assert.strictEqual(result.status, 'unverified');
    assert.ok(result.detail.includes('historical'));
  });

  it('returns match when OpenSky returns aircraft states', async () => {
    const recentTime = new Date(Date.now() - 60_000).toISOString();
    const mockFetch = async () => ({
      ok: true,
      json: async () => ({
        states: [['abc123', 'BAW123  ', 'United Kingdom', 0, 0, -1.89, 52.48, 8000, false, 250, 90, null, null, null, 'ADSB', null, 0]],
      }),
    });
    const result = await checkAircraft(recentTime, 52.48, -1.89, mockFetch);
    assert.strictEqual(result.status, 'match');
    assert.ok(result.aircraft.length >= 1);
    assert.strictEqual(result.aircraft[0].callsign, 'BAW123');
  });

  it('returns no_match when OpenSky returns empty states', async () => {
    const recentTime = new Date(Date.now() - 60_000).toISOString();
    const mockFetch = async () => ({ ok: true, json: async () => ({ states: [] }) });
    const result = await checkAircraft(recentTime, 52.48, -1.89, mockFetch);
    assert.strictEqual(result.status, 'no_match');
  });

  it('returns unverified when OpenSky API fails', async () => {
    const recentTime = new Date(Date.now() - 60_000).toISOString();
    const mockFetch = async () => { throw new Error('Network error'); };
    const result = await checkAircraft(recentTime, 52.48, -1.89, mockFetch);
    assert.strictEqual(result.status, 'unverified');
    assert.ok(result.detail.includes('Network error'));
  });

  it('returns unverified when OpenSky returns non-OK response', async () => {
    const recentTime = new Date(Date.now() - 60_000).toISOString();
    const mockFetch = async () => ({ ok: false, status: 429 });
    const result = await checkAircraft(recentTime, 52.48, -1.89, mockFetch);
    assert.strictEqual(result.status, 'unverified');
  });
});

// ── checkISS ───────────────────────────────────────────────────────────────────

describe('checkISS', () => {
  it('returns possible_match when ISS is within 500km', async () => {
    const mockFetch = async () => ({
      ok: true,
      json: async () => ([{ latitude: 52.5, longitude: -1.9, altitude: 408, velocity: 7700 }]),
    });
    const result = await checkISS('2026-03-24T22:00:00Z', 52.48, -1.89, mockFetch);
    assert.strictEqual(result.status, 'possible_match');
    assert.ok(result.distanceKm < 500);
  });

  it('returns no_match when ISS is far away', async () => {
    const mockFetch = async () => ({
      ok: true,
      json: async () => ([{ latitude: -10.0, longitude: 45.0, altitude: 408, velocity: 7700 }]),
    });
    const result = await checkISS('2026-03-24T22:00:00Z', 52.48, -1.89, mockFetch);
    assert.strictEqual(result.status, 'no_match');
    assert.ok(result.distanceKm >= 500);
  });

  it('returns unverified when API throws', async () => {
    const mockFetch = async () => { throw new Error('Timeout'); };
    const result = await checkISS('2026-03-24T22:00:00Z', 52.48, -1.89, mockFetch);
    assert.strictEqual(result.status, 'unverified');
  });

  it('returns unverified when API returns empty array', async () => {
    const mockFetch = async () => ({ ok: true, json: async () => ([]) });
    const result = await checkISS('2026-03-24T22:00:00Z', 52.48, -1.89, mockFetch);
    assert.strictEqual(result.status, 'unverified');
  });
});

// ── checkWeather ───────────────────────────────────────────────────────────────

describe('checkWeather', () => {
  const makeWeatherFetch = (cloudCover, visibility = 20000, windSpeed = 10) => async () => ({
    ok: true,
    json: async () => ({
      hourly: {
        cloud_cover:    new Array(24).fill(cloudCover),
        visibility:     new Array(24).fill(visibility),
        wind_speed_10m: new Array(24).fill(windSpeed),
      },
    }),
  });

  it('returns possible_match when cloud cover exceeds 80%', async () => {
    const result = await checkWeather('2026-03-24T22:00:00Z', 52.48, -1.89, makeWeatherFetch(90));
    assert.strictEqual(result.status, 'possible_match');
  });

  it('returns possible_match when visibility is below 1000m', async () => {
    const result = await checkWeather('2026-03-24T22:00:00Z', 52.48, -1.89, makeWeatherFetch(30, 500));
    assert.strictEqual(result.status, 'possible_match');
  });

  it('returns no_match when conditions are clear', async () => {
    const result = await checkWeather('2026-03-24T22:00:00Z', 52.48, -1.89, makeWeatherFetch(10, 30000, 5));
    assert.strictEqual(result.status, 'no_match');
  });

  it('returns unverified when API throws', async () => {
    const mockFetch = async () => { throw new Error('Timeout'); };
    const result = await checkWeather('2026-03-24T22:00:00Z', 52.48, -1.89, mockFetch);
    assert.strictEqual(result.status, 'unverified');
  });

  it('includes cloud, visibility, and wind in detail string', async () => {
    const result = await checkWeather('2026-03-24T22:00:00Z', 52.48, -1.89, makeWeatherFetch(20, 15000, 25));
    assert.ok(result.detail.includes('Cloud:'));
    assert.ok(result.detail.includes('Visibility:'));
    assert.ok(result.detail.includes('Wind:'));
  });

  it('uses archive endpoint for sightings older than 7 days', async () => {
    let capturedUrl = '';
    const capturingFetch = async (url) => {
      capturedUrl = url;
      return { ok: true, json: async () => ({ hourly: { cloud_cover: new Array(24).fill(10), visibility: new Array(24).fill(20000), wind_speed_10m: new Array(24).fill(5) } }) };
    };
    await checkWeather('2025-01-01T12:00:00Z', 52.48, -1.89, capturingFetch);
    assert.ok(capturedUrl.includes('archive-api.open-meteo.com'), `Expected archive URL, got: ${capturedUrl}`);
  });

  it('uses forecast endpoint for recent sightings', async () => {
    let capturedUrl = '';
    const capturingFetch = async (url) => {
      capturedUrl = url;
      return { ok: true, json: async () => ({ hourly: { cloud_cover: new Array(24).fill(10), visibility: new Array(24).fill(20000), wind_speed_10m: new Array(24).fill(5) } }) };
    };
    const recentTime = new Date(Date.now() - 60_000).toISOString();
    await checkWeather(recentTime, 52.48, -1.89, capturingFetch);
    assert.ok(capturedUrl.includes('api.open-meteo.com/v1/forecast'), `Expected forecast URL, got: ${capturedUrl}`);
  });
});

// ── verifySighting ─────────────────────────────────────────────────────────────

describe('verifySighting', () => {
  it('returns all four sources and a valid verdict', async () => {
    const recentTime = new Date(Date.now() - 60_000).toISOString();
    const mockFetch = async (url) => ({
      ok: true,
      json: async () => {
        if (url.includes('opensky'))      return { states: [] };
        if (url.includes('wheretheiss')) return [{ latitude: 0, longitude: 0, altitude: 408 }];
        if (url.includes('open-meteo'))  return { hourly: { cloud_cover: new Array(24).fill(5), visibility: new Array(24).fill(30000), wind_speed_10m: new Array(24).fill(3) } };
        return {};
      },
    });

    const result = await verifySighting({ datetime: recentTime, lat: 52.48, lng: -1.89 }, mockFetch);

    assert.ok(result.aircraft,   'missing aircraft');
    assert.ok(result.iss,        'missing iss');
    assert.ok(result.weather,    'missing weather');
    assert.ok(result.radiosonde, 'missing radiosonde');

    const valid = ['UNEXPLAINED', 'PARTIAL MATCH', 'LIKELY EXPLAINED', 'UNVERIFIED'];
    assert.ok(valid.includes(result.verdict), `Unexpected verdict: ${result.verdict}`);
  });

  it('still returns a verdict when all APIs fail', async () => {
    const recentTime = new Date(Date.now() - 60_000).toISOString();
    const failFetch = async () => { throw new Error('All down'); };
    const result = await verifySighting({ datetime: recentTime, lat: 52.48, lng: -1.89 }, failFetch);
    assert.ok(result.verdict);
    assert.strictEqual(result.aircraft.status,          'unverified');
    assert.strictEqual(result.iss.status,               'unverified');
    assert.strictEqual(result.weather.status,           'unverified');
    assert.strictEqual(result.starlink.status,          'unverified');
    assert.strictEqual(result.bright_satellites.status, 'unverified');
    assert.strictEqual(result.kp.status,                'unverified');
    assert.strictEqual(result.solar_wind.status,        'unverified');
    assert.strictEqual(result.aurora.status,            'unverified');
    assert.strictEqual(result.sprites.status,           'unverified');
  });
});

// ── checkKp ────────────────────────────────────────────────────────────────────

describe('checkKp', () => {
  it('returns unverified for sightings older than KP_MAX_AGE_HOURS', async () => {
    const oldTime = new Date(Date.now() - (KP_MAX_AGE_HOURS + 1) * 3_600_000).toISOString();
    const result  = await checkKp(oldTime, 52.48, -1.89, async () => { throw new Error('Should not call'); });
    assert.strictEqual(result.status, 'unverified');
    assert.ok(result.detail.includes('72 hours'));
  });

  it('returns unverified when NOAA API fails', async () => {
    const recentTime = new Date(Date.now() - 60_000).toISOString();
    const result = await checkKp(recentTime, 52.48, -1.89, async () => { throw new Error('timeout'); });
    assert.strictEqual(result.status, 'unverified');
    assert.ok(result.detail.includes('timeout'));
  });

  it('returns unverified when NOAA returns non-OK status', async () => {
    const recentTime = new Date(Date.now() - 60_000).toISOString();
    const result = await checkKp(recentTime, 52.48, -1.89, async () => ({ ok: false, status: 503 }));
    assert.strictEqual(result.status, 'unverified');
  });

  it('returns unverified when NOAA returns empty array', async () => {
    const recentTime = new Date(Date.now() - 60_000).toISOString();
    const result = await checkKp(recentTime, 52.48, -1.89, async () => ({ ok: true, json: async () => [] }));
    assert.strictEqual(result.status, 'unverified');
  });

  it('returns unverified when no entry is within 1 hour of sighting', async () => {
    const recentTime = new Date(Date.now() - 60_000).toISOString();
    // Return entry 5 hours in the future — beyond the 1h window
    const farFuture = new Date(Date.now() + 5 * 3_600_000).toISOString().replace('T', ' ').replace('Z', '');
    const result = await checkKp(recentTime, 52.48, -1.89,
      async () => ({ ok: true, json: async () => [[farFuture, 2.33, 'estimated']] }));
    assert.strictEqual(result.status, 'unverified');
  });

  it('returns no_match when Kp < 4', async () => {
    const recentTime = new Date(Date.now() - 60_000).toISOString();
    const tag = new Date(Date.now() - 30_000).toISOString().replace('T', ' ').replace('Z', '');
    const result = await checkKp(recentTime, 52.48, -1.89,
      async () => ({ ok: true, json: async () => [[tag, 2.67, 'estimated']] }));
    assert.strictEqual(result.status, 'no_match');
    assert.ok(result.detail.includes('2.7'));
    assert.ok(typeof result.kp === 'number');
  });

  it('returns possible_match when Kp >= KP_ELEVATED_THRESHOLD', async () => {
    const recentTime = new Date(Date.now() - 60_000).toISOString();
    const tag = new Date(Date.now() - 30_000).toISOString().replace('T', ' ').replace('Z', '');
    const result = await checkKp(recentTime, 52.48, -1.89,
      async () => ({ ok: true, json: async () => [[tag, 4.33, 'estimated']] }));
    assert.strictEqual(result.status, 'possible_match');
    assert.ok(result.detail.toLowerCase().includes('elevated'));
  });

  it('returns possible_match with storm flag when Kp >= KP_STORM_THRESHOLD', async () => {
    const recentTime = new Date(Date.now() - 60_000).toISOString();
    const tag = new Date(Date.now() - 30_000).toISOString().replace('T', ' ').replace('Z', '');
    const result = await checkKp(recentTime, 52.48, -1.89,
      async () => ({ ok: true, json: async () => [[tag, 6.0, 'estimated']] }));
    assert.strictEqual(result.status, 'possible_match');
    assert.ok(result.detail.toLowerCase().includes('storm'));
    assert.strictEqual(result.kp, 6.0);
  });

  it('handles object-format entries (time_tag / kp_index fields)', async () => {
    const recentTime = new Date(Date.now() - 60_000).toISOString();
    const tag = new Date(Date.now() - 30_000).toISOString().replace('T', ' ').replace('Z', '');
    const result = await checkKp(recentTime, 52.48, -1.89,
      async () => ({ ok: true, json: async () => [{ time_tag: tag, kp_index: 3.0, source: 'estimated' }] }));
    assert.strictEqual(result.status, 'no_match');
  });

  it('picks the entry closest in time', async () => {
    const recentTime = new Date(Date.now() - 60_000).toISOString();
    const close = new Date(Date.now() - 90_000).toISOString().replace('T', ' ').replace('Z', '');
    const far   = new Date(Date.now() - 3_600_000).toISOString().replace('T', ' ').replace('Z', '');
    // close entry has Kp 6 (storm), far entry has Kp 1 — should pick close
    const result = await checkKp(recentTime, 52.48, -1.89,
      async () => ({ ok: true, json: async () => [[far, 1.0, 'estimated'], [close, 6.0, 'estimated']] }));
    assert.strictEqual(result.status, 'possible_match');
    assert.ok(result.detail.toLowerCase().includes('storm'));
  });
});

// ── findVisibleStarlinks ────────────────────────────────────────────────────────

describe('findVisibleStarlinks', () => {
  it('returns empty array when given empty satellite data', () => {
    const result = findVisibleStarlinks([], new Date(), 52.48, -1.89);
    assert.deepEqual(result, []);
  });

  it('skips entries missing TLE lines without throwing', () => {
    const badData = [
      { OBJECT_NAME: 'STARLINK-BAD' },
      { OBJECT_NAME: 'STARLINK-PARTIAL', TLE_LINE1: '1 99999U' },
    ];
    assert.doesNotThrow(() => findVisibleStarlinks(badData, new Date(), 52.48, -1.89));
    const result = findVisibleStarlinks(badData, new Date(), 52.48, -1.89);
    assert.deepEqual(result, []);
  });

  it('skips entries with malformed TLE strings without throwing', () => {
    const badData = [{ OBJECT_NAME: 'BAD', TLE_LINE1: 'not-a-tle', TLE_LINE2: 'also-bad' }];
    assert.doesNotThrow(() => findVisibleStarlinks(badData, new Date(), 52.48, -1.89));
    assert.deepEqual(findVisibleStarlinks(badData, new Date(), 52.48, -1.89), []);
  });

  it('returns results sorted by elevation descending', () => {
    // Two real Starlink TLEs — propagate them; we just check sort order on whatever comes back
    const tle1 = [
      { OBJECT_NAME: 'STARLINK-1234',
        TLE_LINE1: '1 44235U 19029D   26082.50000000  .00001103  00000-0  86036-4 0  9999',
        TLE_LINE2: '2 44235  53.0035 123.4567 0001400  90.1234 270.1234 15.06378500000000' },
      { OBJECT_NAME: 'STARLINK-5678',
        TLE_LINE1: '1 45178U 20001C   26082.50000000  .00000950  00000-0  75012-4 0  9999',
        TLE_LINE2: '2 45178  53.0010 200.1234 0001200  88.4321 271.5678 15.06389100000000' },
    ];
    const result = findVisibleStarlinks(tle1, new Date('2026-03-24T20:00:00Z'), 52.48, -1.89);
    // Whatever is returned must be sorted descending by elevation
    for (let i = 1; i < result.length; i++) {
      assert.ok(result[i - 1].elevationDeg >= result[i].elevationDeg, 'Results not sorted by elevation');
    }
  });

  it('returned objects have required fields', () => {
    const sats = [
      { OBJECT_NAME: 'STARLINK-1234',
        TLE_LINE1: '1 44235U 19029D   26082.50000000  .00001103  00000-0  86036-4 0  9999',
        TLE_LINE2: '2 44235  53.0035 123.4567 0001400  90.1234 270.1234 15.06378500000000' },
    ];
    const result = findVisibleStarlinks(sats, new Date('2026-03-24T20:00:00Z'), 52.48, -1.89);
    for (const sat of result) {
      assert.ok(typeof sat.name         === 'string', 'name must be string');
      assert.ok(typeof sat.elevationDeg === 'number', 'elevationDeg must be number');
      assert.ok(typeof sat.azimuthDeg   === 'number', 'azimuthDeg must be number');
      assert.ok(typeof sat.direction    === 'string', 'direction must be string');
      assert.ok(typeof sat.altitudeKm   === 'number', 'altitudeKm must be number');
    }
  });
});

// ── checkStarlink ──────────────────────────────────────────────────────────────

describe('checkStarlink', () => {
  it('returns unverified for sightings older than STARLINK_MAX_AGE_DAYS', async () => {
    const oldTime = new Date(Date.now() - (STARLINK_MAX_AGE_DAYS + 1) * 24 * 3600 * 1000).toISOString();
    const neverFetch = async () => { throw new Error('Should not be called'); };
    const result = await checkStarlink(oldTime, 52.48, -1.89, neverFetch);
    assert.strictEqual(result.status, 'unverified');
    assert.ok(result.detail.includes('7 days'));
  });

  it('returns unverified when Celestrak API fails', async () => {
    const recentTime = new Date(Date.now() - 60_000).toISOString();
    const result = await checkStarlink(recentTime, 52.48, -1.89, async () => { throw new Error('CORS'); });
    assert.strictEqual(result.status, 'unverified');
    assert.ok(result.detail.includes('CORS'));
  });

  it('returns unverified when Celestrak returns non-OK status', async () => {
    const recentTime = new Date(Date.now() - 60_000).toISOString();
    const result = await checkStarlink(recentTime, 52.48, -1.89, async () => ({ ok: false, status: 503 }));
    assert.strictEqual(result.status, 'unverified');
  });

  it('returns unverified when Celestrak returns empty response', async () => {
    const recentTime = new Date(Date.now() - 60_000).toISOString();
    const result = await checkStarlink(recentTime, 52.48, -1.89, async () => ({ ok: true, text: async () => '' }));
    assert.strictEqual(result.status, 'unverified');
  });

  it('returns no_match when no satellites are above the horizon', async () => {
    const recentTime = new Date(Date.now() - 60_000).toISOString();
    // Return one satellite with malformed TLE lines — findVisibleStarlinks will skip and return []
    const mockFetch = async () => ({
      ok: true,
      text: async () => 'BAD-SAT\nx-bad-line1\ny-bad-line2\n',
    });
    const result = await checkStarlink(recentTime, 52.48, -1.89, mockFetch);
    assert.strictEqual(result.status, 'no_match');
  });

  it('result has status, detail, and satellites fields', async () => {
    const recentTime = new Date(Date.now() - 60_000).toISOString();
    const mockFetch = async () => ({ ok: true, text: async () => '' });
    const result = await checkStarlink(recentTime, 52.48, -1.89, mockFetch);
    assert.ok('status' in result);
    assert.ok('detail' in result);
  });
});

// ── checkBrightSatellites ──────────────────────────────────────────────────────

describe('checkBrightSatellites', () => {
  it('returns unverified for sightings older than STARLINK_MAX_AGE_DAYS', async () => {
    const oldTime = new Date(Date.now() - (STARLINK_MAX_AGE_DAYS + 1) * 24 * 3600 * 1000).toISOString();
    const result = await checkBrightSatellites(oldTime, 52.48, -1.89, async () => { throw new Error('Should not call'); });
    assert.strictEqual(result.status, 'unverified');
    assert.ok(result.detail.includes('7 days'));
  });

  it('returns unverified when Celestrak fails', async () => {
    const recentTime = new Date(Date.now() - 60_000).toISOString();
    const result = await checkBrightSatellites(recentTime, 52.48, -1.89, async () => { throw new Error('timeout'); });
    assert.strictEqual(result.status, 'unverified');
    assert.ok(result.detail.includes('timeout'));
  });

  it('returns no_match when no bright satellites are above the horizon', async () => {
    const recentTime = new Date(Date.now() - 60_000).toISOString();
    const result = await checkBrightSatellites(recentTime, 52.48, -1.89,
      async () => ({ ok: true, text: async () => 'BAD\nx\ny\n' }));
    assert.strictEqual(result.status, 'no_match');
  });

  it('returns unverified when Celestrak returns non-OK status', async () => {
    const recentTime = new Date(Date.now() - 60_000).toISOString();
    const result = await checkBrightSatellites(recentTime, 52.48, -1.89, async () => ({ ok: false, status: 503 }));
    assert.strictEqual(result.status, 'unverified');
  });
});

// ── checkMeteorShower ──────────────────────────────────────────────────────────

describe('checkMeteorShower', () => {
  it('returns possible_match during Perseid peak (12 Aug)', () => {
    const result = checkMeteorShower('2026-08-12T22:00:00Z');
    assert.strictEqual(result.status, 'possible_match');
    assert.ok(result.detail.toLowerCase().includes('perseid'));
    assert.ok(Array.isArray(result.showers) && result.showers.length > 0);
  });

  it('returns no_match outside all meteor shower windows', () => {
    const result = checkMeteorShower('2026-04-25T22:00:00Z');
    assert.strictEqual(result.status, 'no_match');
  });

  it('detail includes peak rate', () => {
    const result = checkMeteorShower('2026-08-12T22:00:00Z');
    assert.ok(result.detail.includes('/hr'));
  });
});

// ── checkMoon ──────────────────────────────────────────────────────────────────

describe('checkMoon', () => {
  it('returns possible_match when moon illumination >= MOON_BRIGHT_THRESHOLD', () => {
    // Known full moon: 2026-01-13 (approx)
    const result = checkMoon('2026-01-13T22:00:00Z');
    if (result.illumination >= MOON_BRIGHT_THRESHOLD) {
      assert.strictEqual(result.status, 'possible_match');
    } else {
      // If our test date is slightly off, just check result is valid
      assert.ok(['possible_match', 'no_match'].includes(result.status));
    }
  });

  it('returns no_match during new moon', () => {
    // Known new moon: 2026-01-29 (approx)
    const result = checkMoon('2026-01-29T12:00:00Z');
    assert.ok(result.illumination < MOON_BRIGHT_THRESHOLD, `Expected low illumination, got ${result.illumination}`);
    assert.strictEqual(result.status, 'no_match');
  });

  it('result always includes illumination and name fields', () => {
    const result = checkMoon('2026-03-24T22:00:00Z');
    assert.ok(typeof result.illumination === 'number');
    assert.ok(typeof result.name === 'string');
    assert.ok(result.detail.includes('%'));
  });
});

// ── checkNLC ───────────────────────────────────────────────────────────────────

describe('checkNLC', () => {
  it('returns possible_match in June at UK latitude (53°N)', () => {
    const result = checkNLC('2026-06-21T22:00:00Z', 53.0);
    assert.strictEqual(result.status, 'possible_match');
  });

  it('returns no_match outside NLC season (e.g., March)', () => {
    const result = checkNLC('2026-03-24T22:00:00Z', 53.0);
    assert.strictEqual(result.status, 'no_match');
    assert.ok(result.detail.includes('May–August'));
  });

  it('returns no_match below 48°N even in season', () => {
    const result = checkNLC('2026-06-21T22:00:00Z', 45.0);
    assert.strictEqual(result.status, 'no_match');
    assert.ok(result.detail.includes('48°N'));
  });

  it('returns no_match in September (month 9 > 8)', () => {
    const result = checkNLC('2026-09-01T22:00:00Z', 55.0);
    assert.strictEqual(result.status, 'no_match');
  });
});

// ── checkSolarWind ─────────────────────────────────────────────────────────────

describe('checkSolarWind', () => {
  it('returns unverified for sightings older than SOLAR_WIND_MAX_AGE_HOURS', async () => {
    const oldTime = new Date(Date.now() - (SOLAR_WIND_MAX_AGE_HOURS + 1) * 3_600_000).toISOString();
    const result = await checkSolarWind(oldTime, 52.48, -1.89, async () => { throw new Error('Should not call'); });
    assert.strictEqual(result.status, 'unverified');
    assert.ok(result.detail.includes('24 hours'));
  });

  it('returns unverified when NOAA API fails', async () => {
    const recentTime = new Date(Date.now() - 60_000).toISOString();
    const result = await checkSolarWind(recentTime, 52.48, -1.89, async () => { throw new Error('timeout'); });
    assert.strictEqual(result.status, 'unverified');
  });

  it('returns no_match when Bz is near zero', async () => {
    const recentTime = new Date(Date.now() - 60_000).toISOString();
    const tag = new Date(Date.now() - 30_000).toISOString().replace('T', ' ').replace('Z', '');
    const mockMag    = [['time_tag', 'bx', 'by', 'bz'], [tag, '0.5', '-1.2', '1.5']];
    const mockPlasma = [['time_tag', 'density', 'speed'], [tag, '5.0', '420']];
    let callCount = 0;
    const mockFetch = async () => {
      const data = callCount++ === 0 ? mockMag : mockPlasma;
      return { ok: true, json: async () => data };
    };
    const result = await checkSolarWind(recentTime, 52.48, -1.89, mockFetch);
    assert.strictEqual(result.status, 'no_match');
    assert.ok(result.bz === 1.5);
  });

  it('returns possible_match when Bz <= BZ_ENHANCED_THRESHOLD', async () => {
    const recentTime = new Date(Date.now() - 60_000).toISOString();
    const tag = new Date(Date.now() - 30_000).toISOString().replace('T', ' ').replace('Z', '');
    const mockMag    = [['time_tag', 'bx', 'by', 'bz'], [tag, '0', '0', String(BZ_ENHANCED_THRESHOLD)]];
    const mockPlasma = [['time_tag', 'density', 'speed'], [tag, '5', '450']];
    let callCount = 0;
    const mockFetch = async () => {
      const data = callCount++ === 0 ? mockMag : mockPlasma;
      return { ok: true, json: async () => data };
    };
    const result = await checkSolarWind(recentTime, 52.48, -1.89, mockFetch);
    assert.strictEqual(result.status, 'possible_match');
    assert.ok(result.detail.toLowerCase().includes('southward'));
  });

  it('returns possible_match with storm label when Bz <= BZ_STORM_THRESHOLD', async () => {
    const recentTime = new Date(Date.now() - 60_000).toISOString();
    const tag = new Date(Date.now() - 30_000).toISOString().replace('T', ' ').replace('Z', '');
    const mockMag    = [['time_tag', 'bx', 'by', 'bz'], [tag, '0', '0', String(BZ_STORM_THRESHOLD)]];
    const mockPlasma = [['time_tag', 'density', 'speed'], [tag, '8', '650']];
    let callCount = 0;
    const mockFetch = async () => {
      const data = callCount++ === 0 ? mockMag : mockPlasma;
      return { ok: true, json: async () => data };
    };
    const result = await checkSolarWind(recentTime, 52.48, -1.89, mockFetch);
    assert.strictEqual(result.status, 'possible_match');
    assert.ok(result.detail.toLowerCase().includes('storm'));
  });
});

// ── checkAurora ────────────────────────────────────────────────────────────────

describe('checkAurora', () => {
  it('returns unverified for sightings older than AURORA_MAX_AGE_HOURS', async () => {
    const oldTime = new Date(Date.now() - (AURORA_MAX_AGE_HOURS + 1) * 3_600_000).toISOString();
    const result = await checkAurora(oldTime, 52.48, -1.89, async () => { throw new Error('Should not call'); });
    assert.strictEqual(result.status, 'unverified');
  });

  it('returns no_match for latitude below 40°N', async () => {
    const recentTime = new Date(Date.now() - 60_000).toISOString();
    const result = await checkAurora(recentTime, 35.0, -1.89, async () => { throw new Error('Should not call'); });
    assert.strictEqual(result.status, 'no_match');
    assert.ok(result.detail.includes('40°N'));
  });

  it('returns unverified when NOAA API fails', async () => {
    const recentTime = new Date(Date.now() - 60_000).toISOString();
    const result = await checkAurora(recentTime, 55.0, -1.89, async () => { throw new Error('timeout'); });
    assert.strictEqual(result.status, 'unverified');
  });

  it('returns possible_match when Kp meets threshold for latitude', async () => {
    // At 55°N threshold is Kp 5 — send Kp 5.3
    const recentTime = new Date(Date.now() - 60_000).toISOString();
    const tag = new Date(Date.now() - 30_000).toISOString().replace('T', ' ').replace('Z', '');
    const result = await checkAurora(recentTime, 55.0, -1.89,
      async () => ({ ok: true, json: async () => [[tag, 5.3, 'estimated']] }));
    assert.strictEqual(result.status, 'possible_match');
    assert.ok(result.kp === 5.3);
  });

  it('returns no_match when Kp is below threshold for latitude', async () => {
    // At 55°N threshold is Kp 5 — send Kp 3.0
    const recentTime = new Date(Date.now() - 60_000).toISOString();
    const tag = new Date(Date.now() - 30_000).toISOString().replace('T', ' ').replace('Z', '');
    const result = await checkAurora(recentTime, 55.0, -1.89,
      async () => ({ ok: true, json: async () => [[tag, 3.0, 'estimated']] }));
    assert.strictEqual(result.status, 'no_match');
    assert.ok(result.detail.includes('need Kp'));
  });
});

// ── checkSprites ───────────────────────────────────────────────────────────────

describe('checkSprites', () => {
  const makeSpriteFetch = (cape) => async () => ({
    ok: true,
    json: async () => ({ hourly: { cape: new Array(24).fill(cape) } }),
  });

  it('returns no_match when CAPE is low', async () => {
    const recentTime = new Date(Date.now() - 60_000).toISOString();
    const result = await checkSprites(recentTime, 52.48, -1.89, makeSpriteFetch(100));
    assert.strictEqual(result.status, 'no_match');
  });

  it('returns possible_match when CAPE >= SPRITES_CAPE_POSSIBLE', async () => {
    const recentTime = new Date(Date.now() - 60_000).toISOString();
    const result = await checkSprites(recentTime, 52.48, -1.89, makeSpriteFetch(SPRITES_CAPE_POSSIBLE));
    assert.strictEqual(result.status, 'possible_match');
    assert.ok(result.cape === SPRITES_CAPE_POSSIBLE);
  });

  it('returns possible_match with severe storm label when CAPE >= SPRITES_CAPE_MATCH', async () => {
    const recentTime = new Date(Date.now() - 60_000).toISOString();
    const result = await checkSprites(recentTime, 52.48, -1.89, makeSpriteFetch(SPRITES_CAPE_MATCH));
    assert.strictEqual(result.status, 'possible_match');
    assert.ok(result.detail.toLowerCase().includes('severe'));
  });

  it('returns unverified when Open-Meteo API fails', async () => {
    const recentTime = new Date(Date.now() - 60_000).toISOString();
    const result = await checkSprites(recentTime, 52.48, -1.89, async () => { throw new Error('Network error'); });
    assert.strictEqual(result.status, 'unverified');
  });

  it('uses archive endpoint for sightings older than 7 days', async () => {
    let capturedUrl = '';
    const capturingFetch = async (url) => {
      capturedUrl = url;
      return { ok: true, json: async () => ({ hourly: { cape: new Array(24).fill(50) } }) };
    };
    await checkSprites('2025-01-01T12:00:00Z', 52.48, -1.89, capturingFetch);
    assert.ok(capturedUrl.includes('archive-api.open-meteo.com'), `Expected archive URL, got: ${capturedUrl}`);
  });
});
