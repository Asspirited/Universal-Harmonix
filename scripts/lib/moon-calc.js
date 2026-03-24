// Universal Harmonix — moon phase pure calculation
// UH-033: No API calls. Uses Julian Date algorithm.

const PHASE_NAMES = [
  'New Moon',       // 0
  'Waxing Crescent',// 1
  'First Quarter',  // 2
  'Waxing Gibbous', // 3
  'Full Moon',      // 4
  'Waning Gibbous', // 5
  'Last Quarter',   // 6
  'Waning Crescent',// 7
];

// Known new moon reference: 2000-01-06T18:14:00Z
const KNOWN_NEW_MOON_JD = 2451549.26;
const SYNODIC_MONTH     = 29.530588853;

function toJulianDate(isoString) {
  const d = new Date(isoString);
  return d.getTime() / 86400000 + 2440587.5;
}

export function moonPhase(isoString) {
  const jd       = toJulianDate(isoString);
  const daysSince = jd - KNOWN_NEW_MOON_JD;
  const cycles   = ((daysSince % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
  const progress = cycles / SYNODIC_MONTH; // 0–1

  // Illumination: cos-based approximation
  const angle = progress * 2 * Math.PI;
  const moon_illumination = Math.round((1 - Math.cos(angle)) / 2 * 100) / 100;

  // Phase name: divide cycle into 8 equal segments
  const segment = Math.floor((progress * 8 + 0.5) % 8);
  const moon_phase = PHASE_NAMES[segment];

  return { moon_phase, moon_illumination };
}
