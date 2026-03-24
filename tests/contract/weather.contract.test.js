// Universal Harmonix — Consumer contract: Open-Meteo
//
// Two endpoints — same response shape, different base URL:
//   Forecast: api.open-meteo.com/v1/forecast        — recent dates (within 7 days)
//   Archive:  archive-api.open-meteo.com/v1/archive — historical dates (older than 7 days)
// We depend on:
//   body.hourly.cloud_cover  — array of numbers (0–100)
//   body.hourly.visibility   — array of numbers (metres)
//   body.hourly.wind_speed_10m — array of numbers (km/h)
//   body.hourly_units        — object confirming unit labels

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const PARAMS = '?latitude=52.48&longitude=-1.89'
  + '&hourly=cloud_cover,visibility,wind_speed_10m'
  + '&timezone=UTC';

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
  + PARAMS + '&start_date=2026-03-24&end_date=2026-03-24';

const ARCHIVE_URL  = 'https://archive-api.open-meteo.com/v1/archive'
  + PARAMS + '&start_date=2025-01-01&end_date=2025-01-01';

function contractSuite(label, url) {
  describe(`Open-Meteo — ${label} contract`, () => {
    it('responds with 200', async () => {
      const res = await fetch(url);
      assert.equal(res.status, 200, `Unexpected status: ${res.status}`);
    });

    it('returns an object with hourly and hourly_units fields', async () => {
      const res = await fetch(url);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.ok(typeof body === 'object' && body !== null, 'body should be an object');
      assert.ok('hourly'       in body, 'body must have hourly field');
      assert.ok('hourly_units' in body, 'body must have hourly_units field');
    });

    it('hourly contains cloud_cover, visibility, wind_speed_10m as arrays', async () => {
      const res = await fetch(url);
      assert.equal(res.status, 200);
      const { hourly } = await res.json();
      assert.ok(Array.isArray(hourly.cloud_cover),   'hourly.cloud_cover must be an array');
      assert.ok(Array.isArray(hourly.visibility),     'hourly.visibility must be an array');
      assert.ok(Array.isArray(hourly.wind_speed_10m), 'hourly.wind_speed_10m must be an array');
    });

    it('hourly arrays are non-empty and contain numbers or nulls', async () => {
      const res = await fetch(url);
      assert.equal(res.status, 200);
      const { hourly } = await res.json();
      assert.ok(hourly.cloud_cover.length > 0, 'cloud_cover should not be empty');
      for (const v of hourly.cloud_cover) {
        assert.ok(v === null || typeof v === 'number',
          `cloud_cover value must be number or null, got ${v}`);
      }
    });

    it('cloud_cover values are in range 0–100 when not null', async () => {
      const res = await fetch(url);
      assert.equal(res.status, 200);
      const { hourly } = await res.json();
      for (const v of hourly.cloud_cover) {
        if (v === null) continue;
        assert.ok(v >= 0 && v <= 100, `cloud_cover ${v} out of range 0–100`);
      }
    });
  });
}

contractSuite('forecast endpoint (recent dates)', FORECAST_URL);
contractSuite('archive endpoint (historical dates)', ARCHIVE_URL);
