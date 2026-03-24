// Universal Harmonix — unit tests for ukdb.js
// UH-032: UK Sighting Database filter + pagination

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { filterRecords, paginateRecords } from '../app/js/ukdb.js';

const RECORDS = [
  { id: 'r1', datetime: '1999-06-15T21:00', city: 'birmingham', tags: { shape: ['orb'],      hynek: 'NL' } },
  { id: 'r2', datetime: '2005-03-20T22:30', city: 'london',     tags: { shape: ['triangle'], hynek: 'DD' } },
  { id: 'r3', datetime: '2010-11-01T01:00', city: 'cardiff',    tags: { shape: ['orb'],      hynek: 'CE1' } },
  { id: 'r4', datetime: '2001-08-10T23:00', city: 'manchester', tags: { shape: ['sphere'],   hynek: 'NL' } },
  { id: 'r5', datetime: '1985-04-22T20:00', city: 'edinburgh',  tags: { shape: ['unknown'],  hynek: 'unknown' } },
];

describe('filterRecords', () => {

  it('returns all records when no filters applied', () => {
    assert.strictEqual(filterRecords(RECORDS, {}).length, 5);
  });

  it('filters by shape', () => {
    const result = filterRecords(RECORDS, { shape: 'orb' });
    assert.strictEqual(result.length, 2);
    assert.ok(result.every(r => r.tags.shape.includes('orb')));
  });

  it('filters by hynek', () => {
    const result = filterRecords(RECORDS, { hynek: 'NL' });
    assert.strictEqual(result.length, 2);
    assert.ok(result.every(r => r.tags.hynek === 'NL'));
  });

  it('filters by yearFrom', () => {
    const result = filterRecords(RECORDS, { yearFrom: 2005 });
    assert.strictEqual(result.length, 2); // 2005, 2010
  });

  it('filters by yearTo', () => {
    const result = filterRecords(RECORDS, { yearTo: 2001 });
    assert.strictEqual(result.length, 3); // 1999, 2001, 1985
  });

  it('filters by yearFrom + yearTo range', () => {
    const result = filterRecords(RECORDS, { yearFrom: 2000, yearTo: 2006 });
    assert.strictEqual(result.length, 2); // 2005, 2001
  });

  it('combines shape and hynek filters', () => {
    const result = filterRecords(RECORDS, { shape: 'orb', hynek: 'NL' });
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].id, 'r1');
  });

  it('returns empty array when no records match', () => {
    const result = filterRecords(RECORDS, { shape: 'disc/saucer' });
    assert.strictEqual(result.length, 0);
  });

});

describe('paginateRecords', () => {

  const fifty = Array.from({ length: 120 }, (_, i) => ({ id: `r${i}` }));

  it('returns first page of pageSize items', () => {
    const result = paginateRecords(fifty, 1, 50);
    assert.strictEqual(result.items.length, 50);
    assert.strictEqual(result.items[0].id, 'r0');
  });

  it('returns correct totalPages', () => {
    const result = paginateRecords(fifty, 1, 50);
    assert.strictEqual(result.totalPages, 3); // 120 / 50 = 2.4 → 3
  });

  it('returns correct totalCount', () => {
    const result = paginateRecords(fifty, 1, 50);
    assert.strictEqual(result.totalCount, 120);
  });

  it('returns correct items for page 2', () => {
    const result = paginateRecords(fifty, 2, 50);
    assert.strictEqual(result.items.length, 50);
    assert.strictEqual(result.items[0].id, 'r50');
  });

  it('returns partial last page', () => {
    const result = paginateRecords(fifty, 3, 50);
    assert.strictEqual(result.items.length, 20);
  });

  it('returns empty items for empty array', () => {
    const result = paginateRecords([], 1, 50);
    assert.strictEqual(result.items.length, 0);
    assert.strictEqual(result.totalPages, 0);
    assert.strictEqual(result.totalCount, 0);
  });

});
