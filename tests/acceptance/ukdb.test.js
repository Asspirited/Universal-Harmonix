// Universal Harmonix — Gherkin / BDD acceptance tests
// UH-032: UK Sighting Database tab

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { filterRecords, paginateRecords } from '../../app/js/ukdb.js';

const makeRecord = (id, year, shape, hynek) => ({
  id,
  datetime: `${year}-06-15T21:00`,
  city: 'birmingham',
  tags: { shape: Array.isArray(shape) ? shape : [shape], hynek },
});

const DATASET = [
  ...Array.from({ length: 80 }, (_, i) => makeRecord(`r${i}`,  2005, 'orb',      'NL')),
  ...Array.from({ length: 40 }, (_, i) => makeRecord(`t${i}`,  2010, 'triangle', 'DD')),
  ...Array.from({ length: 5  }, (_, i) => makeRecord(`s${i}`,  1990, 'sphere',   'unknown')),
];

describe('Feature: UK Sighting Database tab', () => {

  it('Scenario: Researcher views the database on first load', () => {
    // Given: dataset loaded, no filters
    const filtered = filterRecords(DATASET, {});
    const page     = paginateRecords(filtered, 1, 50);

    // Then: total record count is shown
    assert.strictEqual(page.totalCount, 125);

    // And: first 50 records are shown
    assert.strictEqual(page.items.length, 50);

    // And: pagination shows current page and total pages
    assert.strictEqual(page.currentPage, 1);
    assert.strictEqual(page.totalPages, 3);
  });

  it('Scenario: Researcher filters by shape', () => {
    // When: shape filter = triangle
    const filtered = filterRecords(DATASET, { shape: 'triangle' });
    const page     = paginateRecords(filtered, 1, 50);

    // Then: only triangle records shown
    assert.ok(filtered.every(r => r.tags.shape.includes('triangle')));

    // And: count updates
    assert.strictEqual(page.totalCount, 40);
  });

  it('Scenario: Researcher filters by Hynek type', () => {
    // When: hynek filter = NL
    const filtered = filterRecords(DATASET, { hynek: 'NL' });

    // Then: only NL records shown, count updates
    assert.ok(filtered.every(r => r.tags.hynek === 'NL'));
    assert.strictEqual(filtered.length, 80);
  });

  it('Scenario: Researcher filters by year range', () => {
    // When: year 2005–2010
    const filtered = filterRecords(DATASET, { yearFrom: 2005, yearTo: 2010 });

    // Then: only records in that range
    assert.strictEqual(filtered.length, 120); // 80 + 40
    assert.ok(filtered.every(r => {
      const y = new Date(r.datetime).getFullYear();
      return y >= 2005 && y <= 2010;
    }));
  });

  it('Scenario: Researcher combines filters', () => {
    // Given: shape=orb AND hynek=NL
    const filtered = filterRecords(DATASET, { shape: 'orb', hynek: 'NL' });

    // Then: only records matching both
    assert.strictEqual(filtered.length, 80);
    assert.ok(filtered.every(r => r.tags.shape.includes('orb') && r.tags.hynek === 'NL'));
  });

  it('Scenario: Researcher pages through results', () => {
    // Given: >50 results
    const filtered = filterRecords(DATASET, {});
    assert.ok(filtered.length > 50);

    // When: go to page 2
    const page2 = paginateRecords(filtered, 2, 50);

    // Then: records 51–100 shown, page indicator updates
    assert.strictEqual(page2.items.length, 50);
    assert.strictEqual(page2.currentPage, 2);
  });

  it('Scenario: No results match the filters', () => {
    // Given: filter that matches nothing
    const filtered = filterRecords(DATASET, { shape: 'boomerang/chevron' });
    const page     = paginateRecords(filtered, 1, 50);

    // Then: empty result
    assert.strictEqual(filtered.length, 0);
    assert.strictEqual(page.totalCount, 0);
    assert.strictEqual(page.totalPages, 0);
  });

});
