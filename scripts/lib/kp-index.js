// Universal Harmonix — Kp index pure functions
// UH-033: Level labelling + GFZ Potsdam response parsing

export function kpLevel(kp) {
  if (kp < 3) return 'quiet';
  if (kp < 4) return 'unsettled';
  if (kp < 5) return 'active';
  if (kp < 6) return 'minor storm';
  return 'major storm';
}

// GFZ Potsdam JSON: { datetime: [...ISO strings], Kp: [...numbers] }
// Returns the Kp value for the 3-hour window containing the sighting datetime.
export function parseKpResponse(json, isoString) {
  const { datetime, Kp } = json;
  if (!datetime?.length) return null;

  const target = new Date(isoString).getTime();

  // Find the window: the entry whose start time <= target < start + 3h
  for (let i = 0; i < datetime.length; i++) {
    const windowStart = new Date(datetime[i]).getTime();
    const windowEnd   = windowStart + 3 * 60 * 60 * 1000;
    if (target >= windowStart && target < windowEnd) {
      const kp_index = Kp[i];
      return { kp_index, kp_level: kpLevel(kp_index) };
    }
  }

  return null;
}
