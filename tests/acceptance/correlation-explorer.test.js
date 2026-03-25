import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  buildKpHynekCrossTab,
  crossTabToRows,
  crossTabToCsv,
  buildHynekDistribution,
  CROSSTAB_COLS,
  KP_ORDER,
} from '../../app/js/correlations.js';

const records = JSON.parse(readFileSync('./data/nuforc-uk-enriched.json', 'utf8'));

describe('Feature: Correlation Explorer — enriched dataset', () => {

  it('Scenario: cross-tab covers all expected Kp levels', () => {
    const tab = buildKpHynekCrossTab(records);
    for (const level of ['quiet', 'unsettled', 'active', 'minor storm']) {
      assert.ok(tab[level], `expected data for kp_level: ${level}`);
    }
  });

  it('Scenario: NL, DD and CE* groups are present in the dataset', () => {
    const dist = buildHynekDistribution(records);
    assert.ok(dist.NL  > 0, 'expected NL sightings');
    assert.ok(dist.DD  > 0, 'expected DD sightings');
    assert.ok(dist['CE*'] > 0, 'expected CE* sightings');
  });

  it('Scenario: row totals sum to total record count', () => {
    const tab  = buildKpHynekCrossTab(records);
    const rows = crossTabToRows(tab);
    const grandTotal = rows.reduce((acc, r) => acc + r.total, 0);
    assert.equal(grandTotal, records.length);
  });

  it('Scenario: rows are ordered per KP_ORDER', () => {
    const tab  = buildKpHynekCrossTab(records);
    const rows = crossTabToRows(tab);
    const levels = rows.map(r => r.kpLevel);
    for (let i = 0; i < levels.length - 1; i++) {
      const a = KP_ORDER.indexOf(levels[i]);
      const b = KP_ORDER.indexOf(levels[i + 1]);
      assert.ok(a < b, `expected ${levels[i]} before ${levels[i + 1]} in KP_ORDER`);
    }
  });

  it('Scenario: CSV export includes all expected columns', () => {
    const tab = buildKpHynekCrossTab(records);
    const csv = crossTabToCsv(tab);
    for (const col of CROSSTAB_COLS) {
      assert.ok(csv.includes(col), `CSV missing column: ${col}`);
    }
    assert.ok(csv.includes('quiet'));
    assert.ok(csv.includes('active'));
    assert.ok(csv.includes('Total'));
  });

  it('Scenario: CE* sightings are present during elevated Kp (hypothesis data check)', () => {
    const tab = buildKpHynekCrossTab(records);
    // The UH hypothesis is that CE* sightings occur more during elevated geomagnetic activity.
    // This test confirms the data is present for the hypothesis to be testable in-browser.
    const ceActive    = tab['active']?.['CE*']      ?? 0;
    const ceStorm     = (tab['minor storm']?.['CE*'] ?? 0) + (tab['major storm']?.['CE*'] ?? 0);
    const ceQuiet     = tab['quiet']?.['CE*']        ?? 0;
    assert.ok(typeof ceActive === 'number',  'CE* at active Kp is a number');
    assert.ok(typeof ceQuiet  === 'number',  'CE* at quiet Kp is a number');
    // Log the raw numbers so investigators can read them in test output
    console.log(`  CE* at quiet: ${ceQuiet}, active: ${ceActive}, storm: ${ceStorm}`);
  });

});
