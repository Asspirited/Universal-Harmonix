import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  hynekGroup,
  buildKpHynekCrossTab,
  crossTabToRows,
  buildHynekDistribution,
  crossTabToCsv,
  CROSSTAB_COLS,
  KP_ORDER,
} from '../app/js/correlations.js';

const samples = [
  { tags: { hynek: 'NL'  }, context: { kp_level: 'quiet'       } },
  { tags: { hynek: 'NL'  }, context: { kp_level: 'quiet'       } },
  { tags: { hynek: 'DD'  }, context: { kp_level: 'active'      } },
  { tags: { hynek: 'CE1' }, context: { kp_level: 'active'      } },
  { tags: { hynek: 'CE2' }, context: { kp_level: 'minor storm' } },
  { tags: { hynek: 'unknown' }, context: { kp_level: 'quiet'   } },
  { tags: { hynek: 'RV'  }, context: {}                          },
];

describe('hynekGroup', () => {
  it('maps NL, DD, RV to themselves', () => {
    assert.equal(hynekGroup('NL'), 'NL');
    assert.equal(hynekGroup('DD'), 'DD');
    assert.equal(hynekGroup('RV'), 'RV');
  });
  it('maps CE1–CE5 to CE*', () => {
    for (const ce of ['CE1', 'CE2', 'CE3', 'CE4', 'CE5']) {
      assert.equal(hynekGroup(ce), 'CE*', `expected CE* for ${ce}`);
    }
  });
  it('maps unknown, GND, USO to Other', () => {
    assert.equal(hynekGroup('unknown'), 'Other');
    assert.equal(hynekGroup('GND'), 'Other');
    assert.equal(hynekGroup('USO'), 'Other');
  });
  it('maps undefined to Other', () => {
    assert.equal(hynekGroup(undefined), 'Other');
  });
});

describe('buildKpHynekCrossTab', () => {
  it('counts NL correctly in quiet bucket', () => {
    const tab = buildKpHynekCrossTab(samples);
    assert.equal(tab.quiet.NL, 2);
  });
  it('counts Other (unknown hynek) in quiet bucket', () => {
    const tab = buildKpHynekCrossTab(samples);
    assert.equal(tab.quiet.Other, 1);
  });
  it('counts DD and CE* in active bucket', () => {
    const tab = buildKpHynekCrossTab(samples);
    assert.equal(tab.active.DD, 1);
    assert.equal(tab.active['CE*'], 1);
  });
  it('falls back kp_level to unknown when context is empty', () => {
    const tab = buildKpHynekCrossTab(samples);
    assert.equal(tab.unknown?.RV, 1);
  });
  it('returns empty object for empty records', () => {
    assert.deepEqual(buildKpHynekCrossTab([]), {});
  });
  it('handles records with no context', () => {
    const rec = [{ tags: { hynek: 'NL' } }];
    const tab = buildKpHynekCrossTab(rec);
    assert.equal(tab.unknown?.NL, 1);
  });
});

describe('crossTabToRows', () => {
  it('returns rows ordered by KP_ORDER', () => {
    const tab = buildKpHynekCrossTab(samples);
    const rows = crossTabToRows(tab);
    const levels = rows.map(r => r.kpLevel);
    assert.ok(levels.indexOf('quiet') < levels.indexOf('active'), 'quiet before active');
    assert.ok(levels.indexOf('active') < levels.indexOf('minor storm'), 'active before minor storm');
  });
  it('computes correct total for quiet row', () => {
    const tab = buildKpHynekCrossTab(samples);
    const rows = crossTabToRows(tab);
    const quiet = rows.find(r => r.kpLevel === 'quiet');
    assert.equal(quiet.total, 3); // 2 NL + 1 Other
  });
  it('skips KP levels with no data', () => {
    const tab = buildKpHynekCrossTab(samples);
    const rows = crossTabToRows(tab);
    assert.ok(!rows.find(r => r.kpLevel === 'major storm'));
  });
});

describe('buildHynekDistribution', () => {
  it('groups CE1 and CE2 under CE*', () => {
    const dist = buildHynekDistribution(samples);
    assert.equal(dist['CE*'], 2);
  });
  it('counts NL and DD correctly', () => {
    const dist = buildHynekDistribution(samples);
    assert.equal(dist.NL, 2);
    assert.equal(dist.DD, 1);
  });
  it('returns empty object for empty records', () => {
    assert.deepEqual(buildHynekDistribution([]), {});
  });
});

describe('crossTabToCsv', () => {
  it('generates a header row starting with Kp Level', () => {
    const tab = buildKpHynekCrossTab(samples);
    const csv = crossTabToCsv(tab);
    const [header] = csv.split('\n');
    assert.ok(header.startsWith('Kp Level,'));
  });
  it('includes all CROSSTAB_COLS in header', () => {
    const tab = buildKpHynekCrossTab(samples);
    const csv = crossTabToCsv(tab);
    for (const col of CROSSTAB_COLS) {
      assert.ok(csv.includes(col), `missing column: ${col}`);
    }
  });
  it('includes Total column in header', () => {
    const tab = buildKpHynekCrossTab(samples);
    assert.ok(crossTabToCsv(tab).includes('Total'));
  });
  it('has one data row per present Kp level', () => {
    const tab = buildKpHynekCrossTab(samples);
    const lines = crossTabToCsv(tab).split('\n');
    // header + 3 data rows (quiet, active, minor storm, unknown)
    assert.equal(lines.length, 5); // 1 header + 4 data rows
  });
  it('returns empty CSV for empty cross-tab', () => {
    const csv = crossTabToCsv({});
    assert.equal(csv, 'Kp Level,NL,DD,CE*,RV,Other,Total');
  });
});
