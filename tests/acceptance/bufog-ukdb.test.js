// Universal Harmonix — Gherkin / BDD acceptance tests
// UH-041: BUFOG cases in UKDB and Sightings Map

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { filterRecords, paginateRecords } from '../../app/js/ukdb.js';

const makeNuforc = (id, year, hynek) => ({
  id, source: 'NUFORC',
  datetime: `${year}-06-15T21:00`,
  city: 'london',
  tags: { shape: ['orb'], hynek },
});

const makeBufog = (id, year, hynek, outcome) => ({
  id, source: 'BUFOG',
  datetime: `${year}-03-10`,
  city: 'birmingham',
  tags: { shape: ['disc/saucer'], hynek, outcome },
});

const NUFORC_RECORDS = Array.from({ length: 50 }, (_, i) => makeNuforc(`n${i}`, 2005, 'NL'));
const BUFOG_RECORDS  = [
  makeBufog('b1', 2010, 'CE1', 'unexplained'),
  makeBufog('b2', 2012, 'CE2', 'inconclusive'),
  makeBufog('b3', 2015, 'unknown', 'unexplained'),
];
const COMBINED = [...NUFORC_RECORDS, ...BUFOG_RECORDS];

describe('Feature: BUFOG cases in UKDB and Map', () => {

  it('Scenario: BUFOG cases appear alongside NUFORC records', () => {
    // Given: combined dataset loaded
    const filtered = filterRecords(COMBINED, {});

    // Then: total record count includes both sources
    assert.strictEqual(filtered.length, 53);

    // And: BUFOG records are present
    const bufogInResult = filtered.filter(r => r.source === 'BUFOG');
    assert.strictEqual(bufogInResult.length, 3);
  });

  it('Scenario: Source filter — BUFOG only', () => {
    // When: source filter = BUFOG
    const filtered = filterRecords(COMBINED, { source: 'BUFOG' });

    // Then: only BUFOG records shown
    assert.ok(filtered.every(r => r.source === 'BUFOG'));
    assert.strictEqual(filtered.length, 3);
  });

  it('Scenario: Source filter — NUFORC only', () => {
    // When: source filter = NUFORC
    const filtered = filterRecords(COMBINED, { source: 'NUFORC' });

    // Then: only NUFORC records shown
    assert.ok(filtered.every(r => r.source === 'NUFORC'));
    assert.strictEqual(filtered.length, 50);
  });

  it('Scenario: Existing filters still apply to BUFOG records', () => {
    // When: hynek filter = CE1, source = BUFOG
    const filtered = filterRecords(COMBINED, { source: 'BUFOG', hynek: 'CE1' });

    assert.strictEqual(filtered.length, 1);
    assert.strictEqual(filtered[0].id, 'b1');
  });

  it('Scenario: Pagination works across combined dataset', () => {
    const filtered = filterRecords(COMBINED, {});
    const page = paginateRecords(filtered, 1, 50);

    // 53 records → 2 pages
    assert.strictEqual(page.totalCount, 53);
    assert.strictEqual(page.totalPages, 2);
    assert.strictEqual(page.items.length, 50);
  });

});
