// Universal Harmonix — Verification Domain
// Pure ESM. No DOM. No globals except fetch (injectable for testing).
// Importable by: browser (app/index.html), Node tests (tests/).

import { twoline2satrec, propagate, gstime, eciToEcf, ecfToLookAngles, eciToGeodetic } from 'satellite.js';
import { moonPhase, activeMeteorShowers, timeOfDay } from './sky.js';

export const STARLINK_MIN_ELEVATION_DEG = 10;   // satellite must be above this to be visible
export const STARLINK_MAX_AGE_DAYS      = 7;    // TLE accuracy degrades beyond 7 days

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
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const baseUrl = dt < sevenDaysAgo
    ? 'https://archive-api.open-meteo.com/v1/archive'
    : 'https://api.open-meteo.com/v1/forecast';
  const url = `${baseUrl}?latitude=${lat}&longitude=${lng}` +
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

// ── Starlink train detection (Celestrak TLE + satellite.js SGP4) ──────────────

const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
function azimuthToDirection(azDeg) {
  return COMPASS[Math.round((((azDeg % 360) + 360) % 360) / 45) % 8];
}

// Pure: given Celestrak JSON satellite data, a Date, and observer lat/lng,
// returns all Starlinks above STARLINK_MIN_ELEVATION_DEG, sorted by elevation desc.
export function findVisibleStarlinks(satData, date, latDeg, lngDeg) {
  const gmst = gstime(date);
  const observerGd = {
    latitude:  latDeg * Math.PI / 180,
    longitude: lngDeg * Math.PI / 180,
    height: 0,
  };

  const visible = [];

  for (const sat of satData) {
    if (!sat.TLE_LINE1 || !sat.TLE_LINE2) continue;
    try {
      const satrec = twoline2satrec(sat.TLE_LINE1, sat.TLE_LINE2);
      const posVel  = propagate(satrec, date);
      if (!posVel.position || typeof posVel.position !== 'object') continue;

      const posEcf    = eciToEcf(posVel.position, gmst);
      const angles    = ecfToLookAngles(observerGd, posEcf);
      const elevDeg   = angles.elevation * 180 / Math.PI;
      if (isNaN(elevDeg) || elevDeg < STARLINK_MIN_ELEVATION_DEG) continue;

      const azDeg  = ((angles.azimuth * 180 / Math.PI) + 360) % 360;
      const posGd  = eciToGeodetic(posVel.position, gmst);

      visible.push({
        name:         (sat.OBJECT_NAME || sat.SATNAME || 'Unknown').trim(),
        elevationDeg: Math.round(elevDeg),
        azimuthDeg:   Math.round(azDeg),
        direction:    azimuthToDirection(azDeg),
        altitudeKm:   Math.round(posGd.height),
      });
    } catch {
      // skip satellites with TLE parse or propagation errors
    }
  }

  return visible.sort((a, b) => b.elevationDeg - a.elevationDeg);
}

export async function checkStarlink(isoDatetime, lat, lng, fetcher = fetch) {
  const dt    = new Date(isoDatetime);
  const ageMs = Date.now() - dt.getTime();

  if (ageMs > STARLINK_MAX_AGE_DAYS * 24 * 3600 * 1000) {
    return {
      status: 'unverified',
      detail: 'Sighting >7 days ago — TLE accuracy insufficient for historical Starlink verification',
    };
  }

  const url = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=TLE';

  try {
    const res = await fetcher(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();

    // Parse 3-line TLE groups: name / line1 / line2
    const lines   = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
    const satData = [];
    for (let i = 0; i + 2 < lines.length; i += 3) {
      satData.push({ OBJECT_NAME: lines[i], TLE_LINE1: lines[i + 1], TLE_LINE2: lines[i + 2] });
    }

    if (satData.length === 0) {
      return { status: 'unverified', detail: 'No Starlink TLE data returned from Celestrak' };
    }

    const visible = findVisibleStarlinks(satData, dt, lat, lng);

    if (visible.length === 0) {
      return {
        status: 'no_match',
        detail: 'No Starlink satellites above horizon at sighting time and location',
        satellites: [],
      };
    }

    const isTrain = visible.length >= 3;
    const top     = visible[0];
    return {
      status: 'match',
      detail: isTrain
        ? `Starlink train likely: ${visible.length} satellites visible. Highest at ${top.elevationDeg}° elevation, direction ${top.direction}`
        : `${visible.length} Starlink satellite${visible.length > 1 ? 's' : ''} visible at ${top.elevationDeg}° elevation, direction ${top.direction}`,
      satellites: visible.slice(0, 5),
      isTrain,
    };
  } catch (err) {
    return { status: 'unverified', detail: `Starlink check unavailable: ${err.message}` };
  }
}

// ── Geomagnetic Kp index (NOAA SWPC) ─────────────────────────────────────────
// Kp is global — lat/lng kept for API signature consistency only.

export const KP_ELEVATED_THRESHOLD = 4;   // POSSIBLE MATCH
export const KP_STORM_THRESHOLD    = 5;   // POSSIBLE MATCH — stronger flag
export const KP_MAX_AGE_HOURS      = 72;  // NOAA feed only covers recent activity

export async function checkKp(isoDatetime, lat, lng, fetcher = fetch) {
  const dt       = new Date(isoDatetime);
  const ageHours = (Date.now() - dt.getTime()) / 3_600_000;

  if (ageHours > KP_MAX_AGE_HOURS) {
    return {
      status: 'unverified',
      detail: 'Sighting >72 hours ago — NOAA Kp data only covers recent activity',
    };
  }

  const url = 'https://services.swpc.noaa.gov/json/planetary_k_index_1m.json';

  try {
    const res = await fetcher(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      return { status: 'unverified', detail: 'No Kp data available from NOAA' };
    }

    // Entries are either [time_tag, kp, source] arrays or { time_tag, kp_index, source } objects
    const targetMs = dt.getTime();
    let best = null, bestDiff = Infinity;

    for (const entry of data) {
      const timeTag = Array.isArray(entry) ? entry[0] : entry.time_tag;
      const kpVal   = Array.isArray(entry) ? entry[1] : entry.kp_index;
      if (!timeTag || kpVal == null) continue;
      const entryMs = new Date(String(timeTag).replace(' ', 'T') + 'Z').getTime();
      if (isNaN(entryMs)) continue;
      const diff = Math.abs(entryMs - targetMs);
      if (diff < bestDiff) { bestDiff = diff; best = { kp: kpVal }; }
    }

    if (!best || bestDiff > 3_600_000) {
      return { status: 'unverified', detail: 'No Kp reading found within 1 hour of sighting time' };
    }

    const kp = best.kp;
    if (kp >= KP_STORM_THRESHOLD) {
      return {
        status: 'possible_match',
        detail: `Storm-level geomagnetic activity: Kp ${kp.toFixed(1)} (Kp ≥ ${KP_STORM_THRESHOLD} = G1 storm)`,
        kp,
      };
    }
    if (kp >= KP_ELEVATED_THRESHOLD) {
      return {
        status: 'possible_match',
        detail: `Elevated geomagnetic activity: Kp ${kp.toFixed(1)} (Kp ≥ ${KP_ELEVATED_THRESHOLD} = elevated)`,
        kp,
      };
    }
    return {
      status: 'no_match',
      detail: `Geomagnetic activity normal: Kp ${kp.toFixed(1)}`,
      kp,
    };
  } catch (err) {
    return { status: 'unverified', detail: `Kp check unavailable: ${err.message}` };
  }
}

// ── checkBrightSatellites (Celestrak visual group — top 100 naked-eye) ────────

export async function checkBrightSatellites(isoDatetime, lat, lng, fetcher = fetch) {
  const dt    = new Date(isoDatetime);
  const ageMs = Date.now() - dt.getTime();

  if (ageMs > STARLINK_MAX_AGE_DAYS * 24 * 3600 * 1000) {
    return {
      status: 'unverified',
      detail: 'Sighting >7 days ago — TLE accuracy insufficient for historical satellite verification',
    };
  }

  const url = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=TLE';

  try {
    const res = await fetcher(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();

    const lines   = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
    const satData = [];
    for (let i = 0; i + 2 < lines.length; i += 3) {
      satData.push({ OBJECT_NAME: lines[i], TLE_LINE1: lines[i + 1], TLE_LINE2: lines[i + 2] });
    }

    if (satData.length === 0) {
      return { status: 'unverified', detail: 'No satellite TLE data returned from Celestrak' };
    }

    const visible = findVisibleStarlinks(satData, dt, lat, lng); // reuse SGP4 engine

    if (visible.length === 0) {
      return {
        status: 'no_match',
        detail: 'No bright naked-eye satellites above horizon at sighting time and location',
        satellites: [],
      };
    }

    const top = visible[0];
    return {
      status: 'match',
      detail: `${visible.length} bright satellite${visible.length > 1 ? 's' : ''} visible — ${top.name} at ${top.elevationDeg}° ${top.direction}`,
      satellites: visible.slice(0, 5),
    };
  } catch (err) {
    return { status: 'unverified', detail: `Bright satellite check unavailable: ${err.message}` };
  }
}

// ── checkMeteorShower (static — IMO calendar via sky.js) ─────────────────────

export function checkMeteorShower(isoDatetime) {
  const dt      = new Date(isoDatetime);
  const showers = activeMeteorShowers(dt);

  if (showers.length === 0) {
    return { status: 'no_match', detail: 'No major meteor showers active at time of sighting' };
  }

  const peak  = showers.reduce((a, b) => b.rate > a.rate ? b : a);
  const names = showers.map(s => s.name).join(', ');
  return {
    status: 'possible_match',
    detail: `${names} active — peak ~${peak.rate}/hr`,
    showers,
  };
}

// ── checkMoon (static — astronomy maths via sky.js) ───────────────────────────

export const MOON_BRIGHT_THRESHOLD = 85; // % illumination — bright enough to cause misidentifications

export function checkMoon(isoDatetime) {
  const dt   = new Date(isoDatetime);
  const moon = moonPhase(dt);

  if (moon.illumination >= MOON_BRIGHT_THRESHOLD) {
    return {
      status: 'possible_match',
      detail: `${moon.name} · ${moon.illumination}% illumination — bright moon can cause halos, reflections, misidentifications`,
      illumination: moon.illumination,
      name: moon.name,
    };
  }

  return {
    status: 'no_match',
    detail: `${moon.name} · ${moon.illumination}% illumination`,
    illumination: moon.illumination,
    name: moon.name,
  };
}

// ── checkNLC (static — noctilucent clouds, season + latitude) ────────────────
// NLC visible May–August, ≥ 48°N. Most vivid during civil twilight.

export function checkNLC(isoDatetime, lat) {
  const dt    = new Date(isoDatetime);
  const month = dt.getUTCMonth() + 1; // 1–12

  if (lat < 48) {
    return { status: 'no_match', detail: 'NLC require latitude ≥ 48°N' };
  }

  if (month >= 5 && month <= 8) {
    const tod = timeOfDay(dt, lat, 0);
    if (tod === 'twilight') {
      return {
        status: 'possible_match',
        detail: `NLC season at ${lat.toFixed(1)}°N · twilight — electric-blue mesospheric clouds at 82km altitude`,
      };
    }
    return {
      status: 'possible_match',
      detail: `NLC season (May–Aug) at ${lat.toFixed(1)}°N — most vivid during twilight`,
    };
  }

  return { status: 'no_match', detail: 'Outside NLC season (May–August)' };
}

// ── checkSolarWind (NOAA SWPC — Bz + solar wind speed) ────────────────────────

export const SOLAR_WIND_MAX_AGE_HOURS = 24; // NOAA feed covers last 24h only
export const BZ_ENHANCED_THRESHOLD    = -10; // nT — enhanced southward coupling
export const BZ_STORM_THRESHOLD       = -20; // nT — storm-level coupling

export async function checkSolarWind(isoDatetime, lat, lng, fetcher = fetch) {
  const dt       = new Date(isoDatetime);
  const ageHours = (Date.now() - dt.getTime()) / 3_600_000;

  if (ageHours > SOLAR_WIND_MAX_AGE_HOURS) {
    return {
      status: 'unverified',
      detail: 'Sighting >24 hours ago — NOAA solar wind data only covers recent 24h',
    };
  }

  const magUrl    = 'https://services.swpc.noaa.gov/products/solar-wind/mag-1-day.json';
  const plasmaUrl = 'https://services.swpc.noaa.gov/products/solar-wind/plasma-1-day.json';

  try {
    const [magRes, plasmaRes] = await Promise.all([
      fetcher(magUrl,    { signal: AbortSignal.timeout(8000) }),
      fetcher(plasmaUrl, { signal: AbortSignal.timeout(8000) }),
    ]);
    if (!magRes.ok)    throw new Error(`NOAA mag HTTP ${magRes.status}`);
    if (!plasmaRes.ok) throw new Error(`NOAA plasma HTTP ${plasmaRes.status}`);
    const [magData, plasmaData] = await Promise.all([magRes.json(), plasmaRes.json()]);

    // First row is the header; slice it off
    const magRows    = Array.isArray(magData)    ? magData.slice(1)    : [];
    const plasmaRows = Array.isArray(plasmaData) ? plasmaData.slice(1) : [];

    const targetMs = dt.getTime();
    let bestMag = null, bestMagDiff = Infinity;
    for (const row of magRows) {
      if (!Array.isArray(row) || row[0] == null || row[3] == null) continue;
      const t    = new Date(String(row[0]).replace(' ', 'T') + 'Z').getTime();
      const diff = Math.abs(t - targetMs);
      if (diff < bestMagDiff) { bestMagDiff = diff; bestMag = { bz: parseFloat(row[3]) }; }
    }

    let bestPlasma = null, bestPlasmaDiff = Infinity;
    for (const row of plasmaRows) {
      if (!Array.isArray(row) || row[0] == null || row[2] == null) continue;
      const t    = new Date(String(row[0]).replace(' ', 'T') + 'Z').getTime();
      const diff = Math.abs(t - targetMs);
      if (diff < bestPlasmaDiff) { bestPlasmaDiff = diff; bestPlasma = { speed: parseFloat(row[2]) }; }
    }

    if (!bestMag || bestMagDiff > 3_600_000) {
      return { status: 'unverified', detail: 'No solar wind data found near sighting time' };
    }

    const bz        = bestMag.bz;
    const speed     = bestPlasma?.speed;
    const speedStr  = speed != null ? ` · Wind: ${Math.round(speed)} km/s` : '';

    if (bz <= BZ_STORM_THRESHOLD) {
      return {
        status: 'possible_match',
        detail: `Storm-level southward Bz: ${bz.toFixed(1)} nT${speedStr} — strong geomagnetic coupling`,
        bz, speed,
      };
    }
    if (bz <= BZ_ENHANCED_THRESHOLD) {
      return {
        status: 'possible_match',
        detail: `Enhanced southward Bz: ${bz.toFixed(1)} nT${speedStr} — elevated geomagnetic coupling`,
        bz, speed,
      };
    }
    return {
      status: 'no_match',
      detail: `Bz: ${bz.toFixed(1)} nT${speedStr} — solar wind normal`,
      bz, speed,
    };
  } catch (err) {
    return { status: 'unverified', detail: `Solar wind check unavailable: ${err.message}` };
  }
}

// ── checkAurora (NOAA Kp + latitude visibility threshold) ─────────────────────

export const AURORA_MAX_AGE_HOURS = KP_MAX_AGE_HOURS;

const AURORA_THRESHOLDS = [
  { minLat: 65, minKp: 3 },
  { minLat: 60, minKp: 4 },
  { minLat: 55, minKp: 5 },
  { minLat: 50, minKp: 6 },
  { minLat: 45, minKp: 7 },
  { minLat: 40, minKp: 8 },
];

function kpRequiredForAurora(lat) {
  for (const t of AURORA_THRESHOLDS) {
    if (lat >= t.minLat) return t.minKp;
  }
  return Infinity;
}

export async function checkAurora(isoDatetime, lat, lng, fetcher = fetch) {
  const dt       = new Date(isoDatetime);
  const ageHours = (Date.now() - dt.getTime()) / 3_600_000;

  if (ageHours > AURORA_MAX_AGE_HOURS) {
    return {
      status: 'unverified',
      detail: 'Sighting >72 hours ago — NOAA Kp data only covers recent activity',
    };
  }

  const minKpNeeded = kpRequiredForAurora(lat);
  if (minKpNeeded === Infinity) {
    return {
      status: 'no_match',
      detail: `Aurora not typically visible below 40°N (sighting at ${lat.toFixed(1)}°)`,
    };
  }

  const url = 'https://services.swpc.noaa.gov/json/planetary_k_index_1m.json';
  try {
    const res = await fetcher(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      return { status: 'unverified', detail: 'No Kp data available from NOAA' };
    }

    const targetMs = dt.getTime();
    let best = null, bestDiff = Infinity;
    for (const entry of data) {
      const timeTag = Array.isArray(entry) ? entry[0] : entry.time_tag;
      const kpVal   = Array.isArray(entry) ? entry[1] : entry.kp_index;
      if (!timeTag || kpVal == null) continue;
      const entryMs = new Date(String(timeTag).replace(' ', 'T') + 'Z').getTime();
      if (isNaN(entryMs)) continue;
      const diff = Math.abs(entryMs - targetMs);
      if (diff < bestDiff) { bestDiff = diff; best = { kp: kpVal }; }
    }

    if (!best || bestDiff > 3_600_000) {
      return { status: 'unverified', detail: 'No Kp reading found within 1 hour of sighting time' };
    }

    const kp = best.kp;
    if (kp >= minKpNeeded) {
      return {
        status: 'possible_match',
        detail: `Aurora possible at ${lat.toFixed(1)}°N — Kp ${kp.toFixed(1)} (threshold Kp ${minKpNeeded} for this latitude)`,
        kp, threshold: minKpNeeded,
      };
    }

    return {
      status: 'no_match',
      detail: `Aurora unlikely at ${lat.toFixed(1)}°N — Kp ${kp.toFixed(1)}, need Kp ≥ ${minKpNeeded}`,
      kp, threshold: minKpNeeded,
    };
  } catch (err) {
    return { status: 'unverified', detail: `Aurora check unavailable: ${err.message}` };
  }
}

// ── checkSprites (Open-Meteo CAPE — storm conditions for TLEs) ────────────────

export const SPRITES_CAPE_MATCH    = 1000; // J/kg — severe storm
export const SPRITES_CAPE_POSSIBLE = 500;  // J/kg — moderate convection

export async function checkSprites(isoDatetime, lat, lng, fetcher = fetch) {
  const dt           = new Date(isoDatetime);
  const dateStr      = dt.toISOString().split('T')[0];
  const hourIndex    = dt.getUTCHours();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const baseUrl = dt < sevenDaysAgo
    ? 'https://archive-api.open-meteo.com/v1/archive'
    : 'https://api.open-meteo.com/v1/forecast';
  const url = `${baseUrl}?latitude=${lat}&longitude=${lng}` +
    `&hourly=cape&start_date=${dateStr}&end_date=${dateStr}&timezone=UTC`;

  try {
    const res = await fetcher(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const cape = data.hourly?.cape?.[hourIndex];

    if (cape == null) throw new Error('No CAPE data for this hour');

    if (cape >= SPRITES_CAPE_MATCH) {
      return {
        status: 'possible_match',
        detail: `Severe storm — CAPE ${Math.round(cape)} J/kg · Sprites and Transient Luminous Events documented at this intensity`,
        cape,
      };
    }
    if (cape >= SPRITES_CAPE_POSSIBLE) {
      return {
        status: 'possible_match',
        detail: `Moderate convection — CAPE ${Math.round(cape)} J/kg · Storm activity possible`,
        cape,
      };
    }
    return {
      status: 'no_match',
      detail: `No significant convection — CAPE ${Math.round(cape)} J/kg`,
      cape,
    };
  } catch (err) {
    return { status: 'unverified', detail: `Sprites check unavailable: ${err.message}` };
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
  { key: 'aircraft',          run: (dt, lat, lng, f) => checkAircraft(dt, lat, lng, f) },
  { key: 'iss',               run: (dt, lat, lng, f) => checkISS(dt, lat, lng, f) },
  { key: 'starlink',          run: (dt, lat, lng, f) => checkStarlink(dt, lat, lng, f) },
  { key: 'bright_satellites', run: (dt, lat, lng, f) => checkBrightSatellites(dt, lat, lng, f) },
  { key: 'weather',           run: (dt, lat, lng, f) => checkWeather(dt, lat, lng, f) },
  { key: 'radiosonde',        run: (dt, lat, lng)    => Promise.resolve(checkRadiosonde(dt, lat, lng)) },
  { key: 'kp',                run: (dt, lat, lng, f) => checkKp(dt, lat, lng, f) },
  { key: 'solar_wind',        run: (dt, lat, lng, f) => checkSolarWind(dt, lat, lng, f) },
  { key: 'aurora',            run: (dt, lat, lng, f) => checkAurora(dt, lat, lng, f) },
  { key: 'sprites',           run: (dt, lat, lng, f) => checkSprites(dt, lat, lng, f) },
  { key: 'meteor_shower',     run: (dt, lat, lng)    => Promise.resolve(checkMeteorShower(dt)) },
  { key: 'moon',              run: (dt, lat, lng)    => Promise.resolve(checkMoon(dt)) },
  { key: 'nlc',               run: (dt, lat, lng)    => Promise.resolve(checkNLC(dt, lat)) },
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
