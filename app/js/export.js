// Universal Harmonix — Export utilities
// Browser only: uses window.open, Blob, URL.createObjectURL.

import { generateReportHtml } from './format.js';

export function triggerPdfExport(sighting) {
  const html = generateReportHtml(sighting);
  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 400);
}

export function downloadSightingJson(sighting) {
  const blob = new Blob([JSON.stringify(sighting, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  const dt = sighting.datetime ? sighting.datetime.replace(/[T:]/g, '-').slice(0, 16) : 'sighting';
  a.download = `uh-sighting-${dt}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function downloadBackup(sightings) {
  const blob = new Blob([JSON.stringify(sightings, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `uh-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}
