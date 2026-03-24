// Universal Harmonix — Sighting Storage
// localStorage wrapper. Not importable in Node tests — keep logic-free.

const STORAGE_KEY = 'uh_sightings';

export function saveSighting(sighting) {
  const all = loadSightings();
  const record = { ...sighting, id: Date.now(), savedAt: new Date().toISOString() };
  all.unshift(record);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return record;
}

export function loadSightings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function deleteSighting(id) {
  const all = loadSightings().filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function mergeSightings(incoming) {
  const existing = loadSightings();
  const byId = new Map(existing.map(s => [s.id, s]));
  incoming.forEach(s => { if (!byId.has(s.id)) byId.set(s.id, s); });
  const merged = Array.from(byId.values()).sort((a, b) => b.id - a.id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged.length;
}
