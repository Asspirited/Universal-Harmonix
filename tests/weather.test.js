// Universal Harmonix — unit tests for weather.js
// UH-033: Open-Meteo response parsing

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseWeatherResponse } from '../scripts/lib/weather.js';

describe('parseWeatherResponse', () => {

  // Open-Meteo archive returns hourly data arrays
  const MOCK_RESPONSE = {
    hourly: {
      time: [
        '2005-06-15T00:00', '2005-06-15T01:00', '2005-06-15T02:00',
        '2005-06-15T20:00', '2005-06-15T21:00', '2005-06-15T22:00',
      ],
      cloudcover: [10, 20, 30, 55, 72, 80],
    },
  };

  it('returns cloud_cover_pct for the hour matching the sighting time', () => {
    const result = parseWeatherResponse(MOCK_RESPONSE, '2005-06-15T21:00:00Z');
    assert.strictEqual(result.cloud_cover_pct, 72);
  });

  it('truncates to the hour — 21:47 matches 21:00', () => {
    const result = parseWeatherResponse(MOCK_RESPONSE, '2005-06-15T21:47:00Z');
    assert.strictEqual(result.cloud_cover_pct, 72);
  });

  it('returns null when no matching hour found', () => {
    const result = parseWeatherResponse({ hourly: { time: [], cloudcover: [] } }, '2005-06-15T21:00:00Z');
    assert.strictEqual(result, null);
  });

});
