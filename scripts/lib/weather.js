// Universal Harmonix — Open-Meteo response parsing (pure)
// UH-033

// Open-Meteo archive: { hourly: { time: ['YYYY-MM-DDTHH:MM'], cloudcover: [...] } }
// Returns cloud cover % for the hour containing the sighting datetime.
export function parseWeatherResponse(json, isoString) {
  const { time, cloudcover } = json.hourly ?? {};
  if (!time?.length) return null;

  // Truncate sighting time to the hour for matching
  const d = new Date(isoString);
  const hourKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}T${String(d.getUTCHours()).padStart(2,'0')}:00`;

  const idx = time.indexOf(hourKey);
  if (idx === -1) return null;

  return { cloud_cover_pct: cloudcover[idx] };
}
