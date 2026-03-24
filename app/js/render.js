// Universal Harmonix — DOM rendering
// Browser only: reads and writes DOM elements.

import { tagFor, verdictClass, VERDICT_EMOJI, SOURCES, SOURCES_SHORT, SOURCE_GROUPS } from './format.js';

function sourceCardHtml(key, icon, name, res) {
  if (!res) return '';
  const tag = tagFor(res.status);
  let extra = '';
  if (key === 'aircraft' && res.aircraft?.length) {
    extra = `<div class="aircraft-list">${res.aircraft.slice(0, 5).map(a =>
      `<span>${a.callsign} · ${a.altitudeM != null ? a.altitudeM + 'm' : '?m'} · ${a.speedMs != null ? a.speedMs + 'm/s' : '?'}</span>`
    ).join('')}</div>`;
  }
  return `<div class="source-card">
    <div class="source-icon">${icon}</div>
    <div class="source-body">
      <div class="source-name">${name}</div>
      <div class="source-tag ${tag.cls}">${tag.label}</div>
      <div class="source-detail">${res.detail || ''}</div>
      ${extra}
    </div>
  </div>`;
}

export function renderVerificationPanel(v, verdictEl, sourcesEl) {
  const cls   = verdictClass(v.verdict);
  const emoji = VERDICT_EMOJI[v.verdict] || '⚪';

  verdictEl.innerHTML = `<div class="verdict-badge verdict-${cls}">${emoji} ${v.verdict}</div>`;

  const byGroup = {};
  for (const src of SOURCES) {
    (byGroup[src.group] = byGroup[src.group] || []).push(src);
  }

  sourcesEl.innerHTML = SOURCE_GROUPS.map(({ id, label }) => {
    const srcs = byGroup[id] || [];
    const cards = srcs.map(({ key, icon, name }) => sourceCardHtml(key, icon, name, v[key])).join('');
    if (!cards) return '';
    return `<div class="source-group-label">${label}</div>${cards}`;
  }).join('');
}

export function recordCardHtml(s, i) {
  const v   = s.verification;
  const cls = !v ? 'UNVERIFIED'
    : v.verdict === 'LIKELY EXPLAINED' ? 'EXPLAINED'
    : v.verdict === 'PARTIAL MATCH'    ? 'PARTIAL'
    : v.verdict || 'UNVERIFIED';
  const dt = s.datetime
    ? new Date(s.datetime).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
    : '—';

  let sourcesHtml = '';
  if (v) {
    sourcesHtml = `<div class="source-list" style="margin-top:8px;">` +
      SOURCES_SHORT.map(({ key, icon, name }) => {
        const res = v[key];
        if (!res) return '';
        const tag = tagFor(res.status);
        return `<div class="source-card">
          <div class="source-icon">${icon}</div>
          <div class="source-body">
            <div class="source-name">${name}</div>
            <div class="source-tag ${tag.cls}">${tag.label}</div>
            <div class="source-detail">${res.detail || ''}</div>
          </div>
        </div>`;
      }).join('') + `</div>`;
  }

  const typeLabel = s.type ? s.type.charAt(0).toUpperCase() + s.type.slice(1) : 'Sighting';

  return `<div class="record-card">
    <div class="record-header" onclick="toggleRecord(${i})">
      <div class="record-verdict-dot dot-${cls}"></div>
      <div class="record-meta">
        <div class="record-title">${typeLabel} · ${dt}</div>
        <div class="record-sub">${s.lat?.toFixed(4) ?? '—'}, ${s.lng?.toFixed(4) ?? '—'} · ${v?.verdict || 'UNVERIFIED'}</div>
      </div>
      <div class="record-chevron" id="chevron-${i}">›</div>
    </div>
    <div class="record-body" id="record-body-${i}">
      ${s.description ? `<div class="record-description">"${s.description}"</div>` : ''}
      ${s.duration ? `<div style="font-size:13px;color:var(--text-muted);margin-bottom:8px;">Duration: ${s.duration}</div>` : ''}
      ${s.photos?.length ? `<div class="photo-preview" style="margin-bottom:12px;">${s.photos.map(b64 => `<img src="${b64}">`).join('')}</div>` : ''}
      ${sourcesHtml}
      <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap;">
        <button type="button" onclick="exportPdf(${i})"
          style="background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius);
                 color:var(--text-muted);font-size:13px;padding:8px 14px;cursor:pointer;">
          ↓ Export report (PDF)
        </button>
        <button type="button" onclick="exportJson(${i})"
          style="background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius);
                 color:var(--text-muted);font-size:13px;padding:8px 14px;cursor:pointer;">
          ↓ Download JSON
        </button>
      </div>
    </div>
  </div>`;
}

export function renderRecords(sightings, container) {
  if (sightings.length === 0) {
    container.innerHTML = `<div class="records-empty">No sightings logged yet.<br>Use the Log Sighting tab to record your first observation.</div>`;
    return;
  }
  container.innerHTML = sightings.map((s, i) => recordCardHtml(s, i)).join('');
}
