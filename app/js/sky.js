// Universal Harmonix — Sky calculations
// Pure functions. No DOM. No async. No globals.
// Importable by: browser (app/index.html), Node tests (tests/).

// ── Moon phase ─────────────────────────────────────────────────────────────────

const MOON_PHASE_NAMES = [
  'New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous',
  'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent',
];

const KNOWN_NEW_MOON = new Date('2000-01-06T18:14:00Z');
const SYNODIC_MONTH  = 29.530588853; // days

export function moonPhase(date = new Date()) {
  const daysSince  = (date - KNOWN_NEW_MOON) / 86_400_000;
  const cyclePos   = ((daysSince % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
  const normalised = cyclePos / SYNODIC_MONTH; // 0–1
  const illumination = Math.round((1 - Math.cos(normalised * 2 * Math.PI)) / 2 * 100);
  const name         = MOON_PHASE_NAMES[Math.round(normalised * 8) % 8];
  return { phase: normalised, illumination, name };
}

// ── Time of day ────────────────────────────────────────────────────────────────
// Returns 'day' | 'twilight' | 'night' based on solar altitude.
// Civil twilight boundary: solar altitude = -6°.

export function timeOfDay(date = new Date(), latDeg = 51.5, lngDeg = -0.1) {
  const n      = date.getTime() / 86_400_000 + 2440587.5 - 2451545.0;
  const L      = (280.460 + 0.9856474 * n) % 360;
  const gRad   = ((357.528 + 0.9856003 * n) % 360) * Math.PI / 180;
  const lambda = (L + 1.915 * Math.sin(gRad) + 0.020 * Math.sin(2 * gRad)) * Math.PI / 180;
  const eps    = 23.439 * Math.PI / 180;
  const sinDec = Math.sin(eps) * Math.sin(lambda);
  const dec    = Math.asin(sinDec);

  const ut     = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const ha     = (ut + lngDeg / 15 - 12) * 15 * Math.PI / 180;
  const latRad = latDeg * Math.PI / 180;
  const sinAlt = Math.sin(latRad) * sinDec + Math.cos(latRad) * Math.cos(dec) * Math.cos(ha);
  const altDeg = Math.asin(Math.max(-1, Math.min(1, sinAlt))) * 180 / Math.PI;

  if (altDeg > 0)  return 'day';
  if (altDeg > -6) return 'twilight';
  return 'night';
}

// ── Meteor showers ─────────────────────────────────────────────────────────────
// Returns active showers within ±windowDays of annual peak.

export const METEOR_SHOWERS = [
  { name: 'Quadrantids',   peakMonth: 1,  peakDay: 3,  windowDays: 3, rate: 120 },
  { name: 'Lyrids',        peakMonth: 4,  peakDay: 22, windowDays: 3, rate: 18  },
  { name: 'Eta Aquariids', peakMonth: 5,  peakDay: 5,  windowDays: 5, rate: 50  },
  { name: 'Perseids',      peakMonth: 8,  peakDay: 12, windowDays: 5, rate: 100 },
  { name: 'Orionids',      peakMonth: 10, peakDay: 21, windowDays: 5, rate: 20  },
  { name: 'Leonids',       peakMonth: 11, peakDay: 17, windowDays: 3, rate: 15  },
  { name: 'Geminids',      peakMonth: 12, peakDay: 14, windowDays: 4, rate: 120 },
  { name: 'Ursids',        peakMonth: 12, peakDay: 22, windowDays: 3, rate: 10  },
];

export function activeMeteorShowers(date = new Date()) {
  return METEOR_SHOWERS.filter(s => {
    const peak     = new Date(date.getFullYear(), s.peakMonth - 1, s.peakDay);
    const diffDays = Math.abs((date - peak) / 86_400_000);
    return diffDays <= s.windowDays;
  });
}
