// Universal Harmonix — Correlation analysis pure functions
// No DOM, no I/O. All functions take records array and return plain data structures.

export const KP_ORDER = ['quiet', 'unsettled', 'active', 'minor storm', 'major storm', 'unknown'];

export const CROSSTAB_COLS = ['NL', 'DD', 'CE*', 'RV', 'Other'];

const HYNEK_GROUP_MAP = {
  NL: 'NL',
  DD: 'DD',
  RV: 'RV',
  CE1: 'CE*', CE2: 'CE*', CE3: 'CE*', CE4: 'CE*', CE5: 'CE*',
};

export function hynekGroup(hynek) {
  return HYNEK_GROUP_MAP[hynek] || 'Other';
}

/**
 * Build a cross-tab of kp_level × hynek group.
 * Returns: { [kpLevel]: { [hynekGroup]: count } }
 */
export function buildKpHynekCrossTab(records) {
  const tab = {};
  for (const r of records) {
    const kp    = r.context?.kp_level || 'unknown';
    const group = hynekGroup(r.tags?.hynek);
    if (!tab[kp]) tab[kp] = {};
    tab[kp][group] = (tab[kp][group] || 0) + 1;
  }
  return tab;
}

/**
 * Convert cross-tab to sorted row objects for table rendering.
 * Returns: [{ kpLevel, counts: { [group]: n }, total }]
 */
export function crossTabToRows(crossTab) {
  return KP_ORDER
    .filter(k => crossTab[k])
    .map(k => {
      const counts = crossTab[k];
      const total  = Object.values(counts).reduce((a, b) => a + b, 0);
      return { kpLevel: k, counts, total };
    });
}

/**
 * Build overall Hynek group distribution.
 * Returns: { [hynekGroup]: count }
 */
export function buildHynekDistribution(records) {
  const dist = {};
  for (const r of records) {
    const group = hynekGroup(r.tags?.hynek);
    dist[group] = (dist[group] || 0) + 1;
  }
  return dist;
}

/**
 * Serialise cross-tab to CSV string.
 */
export function crossTabToCsv(crossTab) {
  const header = ['Kp Level', ...CROSSTAB_COLS, 'Total'].join(',');
  const rows = KP_ORDER
    .filter(k => crossTab[k])
    .map(k => {
      const counts = crossTab[k] || {};
      const total  = Object.values(counts).reduce((a, b) => a + b, 0);
      return [k, ...CROSSTAB_COLS.map(h => counts[h] || 0), total].join(',');
    });
  return [header, ...rows].join('\n');
}
