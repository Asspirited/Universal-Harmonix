// Universal Harmonix — Unit tests for format.js
// Pure functions only — no DOM, no fetch.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  tagFor,
  verdictClass,
  VERDICT_EMOJI,
  VERDICT_COLORS,
  SOURCES,
  SOURCES_SHORT,
  reportSourceRow,
  generateReportHtml,
} from '../app/js/format.js';

// ── tagFor ────────────────────────────────────────────────────────────────────

describe('tagFor', () => {
  it('returns correct class and label for match', () => {
    const t = tagFor('match');
    assert.equal(t.cls,   'tag-match');
    assert.equal(t.label, 'MATCH');
  });

  it('returns correct class and label for possible_match', () => {
    const t = tagFor('possible_match');
    assert.equal(t.cls,   'tag-possible');
    assert.equal(t.label, 'POSSIBLE MATCH');
  });

  it('returns correct class and label for no_match', () => {
    const t = tagFor('no_match');
    assert.equal(t.cls,   'tag-no-match');
    assert.equal(t.label, 'NO MATCH');
  });

  it('returns correct class and label for unverified', () => {
    const t = tagFor('unverified');
    assert.equal(t.cls,   'tag-unverified');
    assert.equal(t.label, 'COULD NOT VERIFY');
  });

  it('falls back gracefully for unknown status', () => {
    const t = tagFor('something_new');
    assert.equal(t.cls,   'tag-unverified');
    assert.equal(t.label, 'something_new');
  });
});

// ── verdictClass ──────────────────────────────────────────────────────────────

describe('verdictClass', () => {
  it('maps LIKELY EXPLAINED → EXPLAINED', () => {
    assert.equal(verdictClass('LIKELY EXPLAINED'), 'EXPLAINED');
  });

  it('maps PARTIAL MATCH → PARTIAL', () => {
    assert.equal(verdictClass('PARTIAL MATCH'), 'PARTIAL');
  });

  it('passes UNEXPLAINED through unchanged', () => {
    assert.equal(verdictClass('UNEXPLAINED'), 'UNEXPLAINED');
  });

  it('passes UNVERIFIED through unchanged', () => {
    assert.equal(verdictClass('UNVERIFIED'), 'UNVERIFIED');
  });

  it('defaults to UNVERIFIED for undefined', () => {
    assert.equal(verdictClass(undefined), 'UNVERIFIED');
  });
});

// ── VERDICT_EMOJI / VERDICT_COLORS ────────────────────────────────────────────

describe('VERDICT_EMOJI', () => {
  it('has an entry for all four verdict values', () => {
    for (const v of ['UNEXPLAINED', 'PARTIAL MATCH', 'LIKELY EXPLAINED', 'UNVERIFIED']) {
      assert.ok(VERDICT_EMOJI[v], `Missing emoji for ${v}`);
    }
  });
});

describe('VERDICT_COLORS', () => {
  it('returns a hex colour string for all four verdict values', () => {
    for (const v of ['UNEXPLAINED', 'PARTIAL MATCH', 'LIKELY EXPLAINED', 'UNVERIFIED']) {
      assert.match(VERDICT_COLORS[v], /^#[0-9a-f]{6}$/i, `Bad colour for ${v}`);
    }
  });
});

// ── SOURCES / SOURCES_SHORT ───────────────────────────────────────────────────

describe('SOURCES', () => {
  it('contains exactly 4 sources', () => {
    assert.equal(SOURCES.length, 4);
  });

  it('each source has key, icon, name', () => {
    for (const s of SOURCES) {
      assert.ok(s.key,  `Missing key in source: ${JSON.stringify(s)}`);
      assert.ok(s.icon, `Missing icon in source: ${s.key}`);
      assert.ok(s.name, `Missing name in source: ${s.key}`);
    }
  });
});

describe('SOURCES_SHORT', () => {
  it('has same keys as SOURCES', () => {
    const fullKeys  = SOURCES.map(s => s.key).sort();
    const shortKeys = SOURCES_SHORT.map(s => s.key).sort();
    assert.deepEqual(shortKeys, fullKeys);
  });
});

// ── reportSourceRow ───────────────────────────────────────────────────────────

describe('reportSourceRow', () => {
  it('returns empty string when res is falsy', () => {
    assert.equal(reportSourceRow('✈', 'Aircraft', null), '');
    assert.equal(reportSourceRow('✈', 'Aircraft', undefined), '');
  });

  it('includes the label text for match status', () => {
    const html = reportSourceRow('✈', 'Aircraft', { status: 'match', detail: 'Close pass' });
    assert.ok(html.includes('MATCH'));
    assert.ok(html.includes('Close pass'));
  });

  it('includes COULD NOT VERIFY for unverified status', () => {
    const html = reportSourceRow('☁', 'Weather', { status: 'unverified', detail: '' });
    assert.ok(html.includes('COULD NOT VERIFY'));
  });
});

// ── generateReportHtml ────────────────────────────────────────────────────────

describe('generateReportHtml', () => {
  const sighting = {
    id: 12345,
    datetime: '2026-03-24T20:00',
    lat: 52.4862,
    lng: -1.8904,
    type: 'aerial',
    duration: '2 minutes',
    description: 'Bright orange orb',
    photos: [],
    verification: {
      verdict: 'UNEXPLAINED',
      aircraft:   { status: 'no_match',  detail: 'No aircraft within 55km' },
      iss:        { status: 'no_match',  detail: 'ISS not overhead' },
      weather:    { status: 'no_match',  detail: 'Clear skies' },
      radiosonde: { status: 'no_match',  detail: 'Outside launch window' },
    },
  };

  it('returns a string starting with <!DOCTYPE html>', () => {
    const html = generateReportHtml(sighting);
    assert.ok(typeof html === 'string');
    assert.ok(html.startsWith('<!DOCTYPE html>'));
  });

  it('includes the verdict in the output', () => {
    const html = generateReportHtml(sighting);
    assert.ok(html.includes('UNEXPLAINED'));
  });

  it('includes the description', () => {
    const html = generateReportHtml(sighting);
    assert.ok(html.includes('Bright orange orb'));
  });

  it('includes the duration when present', () => {
    const html = generateReportHtml(sighting);
    assert.ok(html.includes('2 minutes'));
  });

  it('includes the report ID', () => {
    const html = generateReportHtml(sighting);
    assert.ok(html.includes('12345'));
  });

  it('handles a sighting with no photos without error', () => {
    assert.doesNotThrow(() => generateReportHtml({ ...sighting, photos: [] }));
    assert.doesNotThrow(() => generateReportHtml({ ...sighting, photos: undefined }));
  });

  it('handles missing verification gracefully', () => {
    const html = generateReportHtml({ ...sighting, verification: undefined });
    assert.ok(html.includes('UNVERIFIED'));
  });
});
