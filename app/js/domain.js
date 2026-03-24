// Universal Harmonix — Verification Domain
// Pure ESM. No DOM. No globals except fetch (injectable for testing).
// Importable by: browser (app/index.html), Node tests (tests/).

export const RADIOSONDE_SITES = [
  { name: 'Lerwick',      lat: 60.139, lng: -1.185 },
  { name: 'Watnall',      lat: 52.950, lng: -1.250 },
  { name: 'Herstmonceux', lat: 50.895, lng:  0.323 },
  { name: 'Camborne',     lat: 50.218, lng: -5.327 },
];

export const RADIOSONDE_DRIFT_RADIUS_KM = 200;  // conservative: 10h drift at ~20km/h
export const AIRCRAFT_RADIUS_DEG        = 0.5;  // ~55km at UK latitudes
export const ISS_MATCH_DISTANCE_KM      = 500;  // ISS visible from ~500km on clear night

// ── Utilities ─────────────────────────────────────────────────────────────────

export function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Radiosonde (static logic — no API) ────────────────────────────────────────

export function checkRadiosonde(isoDatetime, lat, lng) {
  const dt = new Date(isoDatetime);
  const hourUtc = dt.getUTCHours() + dt.getUTCMinutes() / 60;

  // Launch windows: 00:00 and 12:00 UTC. Balloon drifts for up to 2h after launch.
  const nearLaunch = [0, 12].some(h => {
    const diff = Math.abs(hourUtc - h);
    return diff <= 2 || diff >= 22; // handles 23:xx → 00:xx wraparound
  });

  if (!nearLaunch) {
    return { status: 'no_match', detail: 'Outside UK radiosonde launch windows (00:00 ±2h, 12:00 ±2h UTC)' };
  }

  for (const site of RADIOSONDE_SITES) {
    const km = haversineKm(lat, lng, site.lat, site.lng);
    if (km <= RADIOSONDE_DRIFT_RADIUS_KM) {
      return {
        status: 'possible_match',
        detail: `${Math.round(km)}km from ${site.name} radiosonde site — within launch window`,
      };
    }
  }

  return { status: 'no_match', detail: 'No UK radiosonde sites within drift range' };
}

// ── Aircraft (OpenSky ADS-B) ───────────────────────────────────────────────────

export async function checkAircraft(isoDatetime, lat, lng, fetcher = fetch) {
  const dt = new Date(isoDatetime);
  const nowSec = Math.floor(Date.now() / 1000);
  const thenSec = Math.floor(dt.getTime() / 1000);

  if (nowSec - thenSec > 3600) {
    return {
      status: 'unverified',
      detail: 'Sighting >1 hour ago — historical ADS-B data requires free OpenSky account',
    };
  }

  const r = AIRCRAFT_RADIUS_DEG;
  const url = `https://opensky-network.org/api/states/all?lamin=${lat - r}&lomin=${lng - r}&lamax=${lat + r}&lomax=${lng + r}`;

  try {
    const res = await fetcher(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const states = data.states || [];

    if (states.length === 0) {
      return { status: 'no_match', detail: 'No ADS-B traffic detected in area at time of sighting' };
    }

    const aircraft = states.slice(0, 10).map(s => ({
      callsign: (s[1] || 'unknown').trim() || 'unknown',
      altitudeM: s[7] != null ? Math.round(s[7]) : null,
      speedMs:   s[9] != null ? Math.round(s[9]) : null,
    }));

    return {
      status: 'match',
      detail: `${states.length} aircraft detected in area`,
      aircraft,
    };
  } catch (err) {
    return { status: 'unverified', detail: `Aircraft check unavailable: ${err.message}` };
  }
}

// ── ISS (wheretheiss.at) ───────────────────────────────────────────────────────

export async function checkISS(isoDatetime, lat, lng, fetcher = fetch) {
  const dt = new Date(isoDatetime);
  const timestamp = Math.floor(dt.getTime() / 1000);
  const url = `https://api.wheretheiss.at/v1/satellites/25544/positions?timestamps=${timestamp}&units=kilometers`;

  try {
    const res = await fetcher(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const pos = data[0];
    if (!pos) throw new Error('No ISS position returned');

    const distKm = haversineKm(lat, lng, pos.latitude, pos.longitude);

    if (distKm <= ISS_MATCH_DISTANCE_KM) {
      return {
        status: 'possible_match',
        detail: `ISS was ${Math.round(distKm)}km away at time of sighting (altitude: ${Math.round(pos.altitude)}km)`,
        distanceKm: Math.round(distKm),
        altitudeKm: Math.round(pos.altitude),
      };
    }

    return {
      status: 'no_match',
      detail: `ISS was ${Math.round(distKm)}km away — too distant to explain sighting`,
      distanceKm: Math.round(distKm),
    };
  } catch (err) {
    return { status: 'unverified', detail: `ISS check unavailable: ${err.message}` };
  }
}

// ── Weather (Open-Meteo) ───────────────────────────────────────────────────────

export async function checkWeather(isoDatetime, lat, lng, fetcher = fetch) {
  const dt = new Date(isoDatetime);
  const dateStr = dt.toISOString().split('T')[0];
  const hourIndex = dt.getUTCHours();
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    `&hourly=cloud_cover,visibility,wind_speed_10m` +
    `&start_date=${dateStr}&end_date=${dateStr}&timezone=UTC`;

  try {
    const res = await fetcher(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const cloudCover = data.hourly?.cloud_cover?.[hourIndex];
    const visibility = data.hourly?.visibility?.[hourIndex];
    const windSpeed  = data.hourly?.wind_speed_10m?.[hourIndex];

    if (cloudCover == null) throw new Error('No weather data for this hour');

    const heavyCloud = cloudCover > 80;
    const poorVis    = visibility != null && visibility < 1000;

    const summary = [
      `Cloud: ${cloudCover}%`,
      visibility != null ? `Visibility: ${(visibility / 1000).toFixed(1)}km` : 'Visibility: unknown',
      windSpeed  != null ? `Wind: ${Math.round(windSpeed)}km/h` : 'Wind: unknown',
    ].join(' · ');

    return {
      status: heavyCloud || poorVis ? 'possible_match' : 'no_match',
      detail: heavyCloud || poorVis ? `Adverse conditions may affect visibility. ${summary}` : summary,
      cloudCover,
      visibility,
      windSpeed,
    };
  } catch (err) {
    return { status: 'unverified', detail: `Weather check unavailable: ${err.message}` };
  }
}

// ── Verdict ────────────────────────────────────────────────────────────────────

export function computeVerdict(results) {
  const statuses = Object.values(results).map(r => r?.status);
  if (statuses.every(s => s === 'unverified'))    return 'UNVERIFIED';
  if (statuses.some(s => s === 'match'))           return 'LIKELY EXPLAINED';
  if (statuses.some(s => s === 'possible_match'))  return 'PARTIAL MATCH';
  return 'UNEXPLAINED';
}

// ── Source registry ────────────────────────────────────────────────────────────
// Add new verification sources here. Each entry is { key, run }.
// verifySighting runs all sources generically — no manual wiring needed.

export const VERIFICATION_SOURCES = [
  { key: 'aircraft',   run: (dt, lat, lng, f) => checkAircraft(dt, lat, lng, f) },
  { key: 'iss',        run: (dt, lat, lng, f) => checkISS(dt, lat, lng, f) },
  { key: 'weather',    run: (dt, lat, lng, f) => checkWeather(dt, lat, lng, f) },
  { key: 'radiosonde', run: (dt, lat, lng)    => Promise.resolve(checkRadiosonde(dt, lat, lng)) },
];

// ── Main entry point ───────────────────────────────────────────────────────────

export async function verifySighting({ datetime, lat, lng }, fetcher = fetch) {
  const settled = await Promise.allSettled(
    VERIFICATION_SOURCES.map(src => src.run(datetime, lat, lng, fetcher))
  );

  const results = {};
  VERIFICATION_SOURCES.forEach((src, i) => {
    results[src.key] = settled[i].status === 'fulfilled'
      ? settled[i].value
      : { status: 'unverified', detail: 'Check failed unexpectedly' };
  });

  return { ...results, verdict: computeVerdict(results) };
}
