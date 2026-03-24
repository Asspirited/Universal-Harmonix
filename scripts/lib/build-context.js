// Universal Harmonix — enrichment orchestrator (pure, injectable clients)
// UH-033

import { parseKpResponse }     from './kp-index.js';
import { parseWeatherResponse } from './weather.js';
import { moonPhase }            from './moon-calc.js';

// Normalise NUFORC "MM/DD/YYYY HH:MM" or any parseable string → ISO 8601
function toISO(raw) {
  if (!raw) return null;
  // Already ISO-like (starts with 4-digit year)
  if (/^\d{4}-/.test(raw)) return raw;
  // MM/DD/YYYY HH:MM
  const m = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})/);
  if (m) {
    const [, mo, dy, yr, hh, mm] = m;
    return `${yr}-${mo.padStart(2,'0')}-${dy.padStart(2,'0')}T${hh.padStart(2,'0')}:${mm}:00Z`;
  }
  // Fallback: let Date parse it
  const d = new Date(raw);
  return isNaN(d) ? null : d.toISOString();
}

export async function buildContext(record, kpClient, weatherClient) {
  const { lat, lon } = record;
  const datetime = toISO(record.datetime);

  if (lat == null || lon == null) {
    return { skipped: true, reason: 'no coordinates' };
  }
  if (!datetime) {
    return { skipped: true, reason: 'no datetime' };
  }

  try {
    const [kpRaw, weatherRaw] = await Promise.all([
      kpClient(datetime, lat, lon),
      weatherClient(datetime, lat, lon),
    ]);

    const kp      = parseKpResponse(kpRaw, datetime)     ?? {};
    const weather = parseWeatherResponse(weatherRaw, datetime) ?? {};
    const moon    = moonPhase(datetime);

    return { ...kp, ...weather, ...moon };
  } catch {
    return { skipped: true, reason: 'api error' };
  }
}
