// Universal Harmonix — Location helpers (browser, geocoding)
// Nominatim reverse geocode + postcodes.io UK postcode lookup

/**
 * Reverse geocode lat/lng to a human-readable address string.
 * Returns e.g. "Birmingham, West Midlands, England"
 */
export async function reverseGeocode(lat, lng, fetcher = fetch) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
  const res = await fetcher(url, {
    headers: {
      'Accept-Language': 'en',
      'User-Agent': 'UniversalHarmonix/0.1 (https://github.com/Asspirited/Universal-Harmonix)',
    },
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const a = data.address ?? {};
  const parts = [
    a.village ?? a.town ?? a.city ?? a.municipality,
    a.county ?? a.state_district ?? a.state,
  ].filter(Boolean);
  return parts.length ? parts.join(', ') : (data.display_name ?? 'Unknown location');
}

/**
 * Look up a UK postcode and return { lat, lng }.
 * Throws if the postcode is invalid or not found.
 */
export async function lookupPostcode(postcode, fetcher = fetch) {
  const clean = postcode.replace(/\s+/g, '').toUpperCase();
  const url = `https://api.postcodes.io/postcodes/${encodeURIComponent(clean)}`;
  const res = await fetcher(url, { signal: AbortSignal.timeout(6000) });
  if (!res.ok) throw new Error(`Postcode not found: ${postcode}`);
  const data = await res.json();
  return { lat: data.result.latitude, lng: data.result.longitude };
}

/**
 * Returns true if the string looks like a valid UK postcode (with or without space).
 */
export function looksLikeUKPostcode(input) {
  return /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(input.trim());
}

/**
 * Returns true if the string looks like "lat, lng" or "lat lng".
 */
export function looksLikeCoords(input) {
  return /^-?\d+\.?\d*[\s,]+-?\d+\.?\d*$/.test(input.trim());
}

/**
 * Parse "lat, lng" or "lat lng" into { lat, lng } numbers.
 * Returns null if unparseable.
 */
export function parseCoords(input) {
  const parts = input.trim().split(/[\s,]+/);
  if (parts.length !== 2) return null;
  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);
  if (isNaN(lat) || isNaN(lng)) return null;
  return { lat, lng };
}
