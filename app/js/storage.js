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
