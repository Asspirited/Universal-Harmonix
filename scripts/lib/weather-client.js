// Universal Harmonix — Open-Meteo archive API client (I/O boundary)
// UH-033

export async function weatherClient(isoString, lat, lon) {
  const date = isoString.slice(0, 10);
  const url  = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${date}&end_date=${date}&hourly=cloudcover&timezone=UTC`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error(`Weather API ${res.status}: ${url}`);
  return res.json();
}
