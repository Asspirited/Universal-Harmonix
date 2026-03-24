// Universal Harmonix — Formatting and template utilities
// Pure ESM. No DOM. No globals. Importable by Node tests.

export function tagFor(status) {
  return {
    match:          { cls: 'tag-match',      label: 'MATCH' },
    possible_match: { cls: 'tag-possible',   label: 'POSSIBLE MATCH' },
    no_match:       { cls: 'tag-no-match',   label: 'NO MATCH' },
    unverified:     { cls: 'tag-unverified', label: 'COULD NOT VERIFY' },
  }[status] || { cls: 'tag-unverified', label: String(status) };
}

export function verdictClass(verdict) {
  if (verdict === 'LIKELY EXPLAINED') return 'EXPLAINED';
  if (verdict === 'PARTIAL MATCH')    return 'PARTIAL';
  return verdict || 'UNVERIFIED';
}

export const VERDICT_EMOJI = {
  UNEXPLAINED:        '🔵',
  'PARTIAL MATCH':    '🟡',
  'LIKELY EXPLAINED': '🔴',
  UNVERIFIED:         '⚪',
};

export const VERDICT_COLORS = {
  UNEXPLAINED:        '#9c6cf7',
  'PARTIAL MATCH':    '#f0a040',
  'LIKELY EXPLAINED': '#e05555',
  UNVERIFIED:         '#6b7399',
};

export const SOURCES = [
  { key: 'aircraft',   icon: '✈️',  name: 'Aircraft (OpenSky ADS-B)' },
  { key: 'iss',        icon: '🛰️', name: 'ISS Position' },
  { key: 'weather',    icon: '☁️', name: 'Weather Conditions' },
  { key: 'radiosonde', icon: '🎈', name: 'Weather Balloon (Radiosonde)' },
];

export const SOURCES_SHORT = [
  { key: 'aircraft',   icon: '✈️',  name: 'Aircraft' },
  { key: 'iss',        icon: '🛰️', name: 'ISS' },
  { key: 'weather',    icon: '☁️', name: 'Weather' },
  { key: 'radiosonde', icon: '🎈', name: 'Radiosonde' },
];

// HTML string for one row in the PDF report's source table
export function reportSourceRow(icon, name, res) {
  if (!res) return '';
  const labels = { match: 'MATCH', possible_match: 'POSSIBLE MATCH', no_match: 'NO MATCH', unverified: 'COULD NOT VERIFY' };
  const colors = { match: '#e05555', possible_match: '#f0a040', no_match: '#4caf84', unverified: '#6b7399' };
  const label = labels[res.status] || res.status;
  const color = colors[res.status] || '#6b7399';
  return `<tr>
    <td style="padding:8px 12px;font-size:13px;">${icon} ${name}</td>
    <td style="padding:8px 12px;"><span style="font-size:11px;font-weight:700;color:${color};letter-spacing:0.05em;">${label}</span></td>
    <td style="padding:8px 12px;font-size:13px;color:#555;">${res.detail || ''}</td>
  </tr>`;
}

// Full HTML string for the PDF report window — pure, no DOM
export function generateReportHtml(sighting) {
  const v = sighting.verification || {};
  const dt = sighting.datetime
    ? new Date(sighting.datetime).toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' })
    : '—';
  const verdict = v.verdict || 'UNVERIFIED';
  const color = VERDICT_COLORS[verdict] || '#6b7399';

  const photosHtml = sighting.photos?.length
    ? `<div style="margin:16px 0;display:flex;gap:8px;flex-wrap:wrap;">${
        sighting.photos.map(b64 =>
          `<img src="${b64}" style="width:120px;height:120px;object-fit:cover;border-radius:4px;border:1px solid #ddd;">`
        ).join('')
      }</div>`
    : '';

  const typeLabel = sighting.type
    ? sighting.type.charAt(0).toUpperCase() + sighting.type.slice(1)
    : '—';

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>UH Sighting Report — ${dt}</title>
    <style>
      body { font-family: system-ui, sans-serif; max-width: 720px; margin: 40px auto; color: #1a1a2e; padding: 0 20px; }
      h1 { font-size: 18px; font-weight: 700; margin: 0 0 4px; }
      .sub { font-size: 13px; color: #666; margin-bottom: 24px; }
      .verdict { display: inline-block; font-size: 14px; font-weight: 700; letter-spacing: 0.08em;
                 color: ${color}; border: 1px solid ${color}; border-radius: 100px;
                 padding: 6px 16px; margin-bottom: 24px; }
      .section-title { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
                       color: #888; margin: 20px 0 8px; }
      .field { margin-bottom: 10px; font-size: 14px; }
      .field strong { display: inline-block; min-width: 110px; color: #444; font-size: 13px; }
      .description { background: #f7f7fa; border-left: 3px solid #ccc; padding: 10px 14px;
                     font-style: italic; font-size: 14px; color: #333; border-radius: 0 4px 4px 0; }
      table { width: 100%; border-collapse: collapse; font-size: 13px; }
      tr { border-bottom: 1px solid #eee; }
      th { text-align: left; padding: 8px 12px; font-size: 11px; letter-spacing: 0.08em;
           text-transform: uppercase; color: #888; background: #f7f7fa; }
      .footer { margin-top: 40px; font-size: 11px; color: #aaa; border-top: 1px solid #eee; padding-top: 12px; }
      @media print { body { margin: 20px; } }
    </style>
  </head><body>
    <h1>Universal Harmonix — Sighting Report</h1>
    <div class="sub">BUFOG Investigation · Generated ${new Date().toLocaleString('en-GB')}</div>

    <div class="section-title">Observation</div>
    <div class="field"><strong>Date / Time</strong>${dt}</div>
    <div class="field"><strong>Location</strong>${sighting.lat?.toFixed(6) ?? '—'}, ${sighting.lng?.toFixed(6) ?? '—'}</div>
    <div class="field"><strong>Type</strong>${typeLabel}</div>
    ${sighting.duration ? `<div class="field"><strong>Duration</strong>${sighting.duration}</div>` : ''}
    <div class="description">${sighting.description || ''}</div>

    ${photosHtml}

    <div class="section-title">Verdict</div>
    <div class="verdict">${verdict}</div>

    <div class="section-title">Verification Sources</div>
    <table>
      <thead><tr><th>Source</th><th>Result</th><th>Detail</th></tr></thead>
      <tbody>
        ${reportSourceRow('✈', 'Aircraft (OpenSky ADS-B)', v.aircraft)}
        ${reportSourceRow('🛰', 'ISS Position', v.iss)}
        ${reportSourceRow('☁', 'Weather Conditions', v.weather)}
        ${reportSourceRow('🎈', 'Weather Balloon (Radiosonde)', v.radiosonde)}
      </tbody>
    </table>

    <div class="footer">Universal Harmonix · universalharmonix.app · Report ID: ${sighting.id || '—'}</div>
  </body></html>`;
}
