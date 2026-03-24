// Universal Harmonix — Gherkin / BDD acceptance tests
// UH-031: AI tagging pipeline
// Uses a mock claude client — no real API calls.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { tagSightings } from '../../scripts/tag-sightings.js';
import { TAG_FIELDS } from '../../scripts/lib/taxonomy.js';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const SAMPLE_RECORDS = Array.from({ length: 5 }, (_, i) => ({
  id:       `nuforc-${i}`,
  datetime: '2010-06-15T22:00:00',
  city:     'Birmingham',
  shape:    'sphere',
  comments: i === 2 ? '' : `Witness ${i}: bright orange orb hovering silently then ascending fast.`,
  lat:      52.48,
  lon:      -1.89,
}));

// Mock claude client: returns valid JSON tags for non-empty comments
const MOCK_TAGS = JSON.stringify({
  hynek:     'NL',
  shape:     ['orb'],
  colour:    ['orange/amber'],
  light:     ['steady'],
  motion:    ['ascending'],
  speed:     'fast',
  altitude:  'low (<300m)',
  direction: 'ascent',
  unusual:   [],
  sound:     ['silent'],
  smell:     'none',
  sensation: 'none',
});

function mockClaudeClient(_prompt) {
  return Promise.resolve(MOCK_TAGS);
}

// Mock client that throws on the first call, succeeds on rest
let failCount = 0;
function mockFailingClient(_prompt) {
  if (failCount++ === 0) return Promise.reject(new Error('API error'));
  return Promise.resolve(MOCK_TAGS);
}

// ── Feature: AI tagging pipeline ──────────────────────────────────────────────

describe('Feature: AI tagging pipeline — NUFORC comments to taxonomy tags', () => {

  it('Scenario: Pipeline tags a sample of records from the NUFORC UK dataset', async () => {
    // Given: a set of records
    // When: the pipeline runs with sample size 5
    const result = await tagSightings(SAMPLE_RECORDS, mockClaudeClient, { sample: 5 });

    // Then: output contains exactly 5 records
    assert.strictEqual(result.length, 5, 'output must contain exactly 5 records');

    // And: each record preserves original fields
    for (const r of result) {
      assert.ok(Object.hasOwn(r, 'id'),       'original id must be preserved');
      assert.ok(Object.hasOwn(r, 'comments'), 'original comments must be preserved');
      assert.ok(Object.hasOwn(r, 'lat'),      'original lat must be preserved');
    }

    // And: each record has a tags object with all A/B/C fields
    for (const r of result) {
      assert.ok(typeof r.tags === 'object', 'each record must have a tags object');
      for (const field of Object.keys(TAG_FIELDS)) {
        assert.ok(Object.hasOwn(r.tags, field), `tags must contain field: ${field}`);
      }
    }
  });

  it('Scenario: Each tag value is drawn from the taxonomy vocabulary', async () => {
    // Given: tagged records
    const result = await tagSightings(SAMPLE_RECORDS.slice(0, 1), mockClaudeClient, {});

    const r = result[0];
    // Then: shape values are valid A2 items
    for (const v of r.tags.shape) {
      const { vocab } = TAG_FIELDS.shape;
      assert.ok(vocab.includes(v), `invalid shape tag: ${v}`);
    }
    // And: motion values are valid B1 items
    for (const v of r.tags.motion) {
      const { vocab } = TAG_FIELDS.motion;
      assert.ok(vocab.includes(v), `invalid motion tag: ${v}`);
    }
    // And: sound values are valid C1 items
    for (const v of r.tags.sound) {
      const { vocab } = TAG_FIELDS.sound;
      assert.ok(vocab.includes(v), `invalid sound tag: ${v}`);
    }
  });

  it('Scenario: Record with no comments produces an unknown tag set', async () => {
    // Given: record index 2 has empty comments
    const emptyRecord = [SAMPLE_RECORDS[2]];
    const result = await tagSightings(emptyRecord, mockClaudeClient, {});

    // Then: all tag fields are unknown / empty
    const tags = result[0].tags;
    assert.strictEqual(tags.hynek,   'unknown');
    assert.deepEqual(tags.shape,     []);
    assert.deepEqual(tags.sound,     []);
  });

  it('Scenario: API failure on one record does not abort the pipeline', async () => {
    // Given: first call to claude client will throw — use 3 records with non-empty comments
    failCount = 0;
    const nonEmpty = SAMPLE_RECORDS.filter(r => r.comments).slice(0, 3);
    const result = await tagSightings(nonEmpty, mockFailingClient, {});

    // Then: all 3 records appear in output (pipeline did not abort)
    assert.strictEqual(result.length, 3);

    // And: the failed record has error-sentinel tags
    assert.strictEqual(result[0].tags.hynek, 'error');

    // And: the remaining records were tagged normally
    assert.strictEqual(result[1].tags.hynek, 'NL');
    assert.strictEqual(result[2].tags.hynek, 'NL');
  });

});
