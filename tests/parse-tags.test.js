// Universal Harmonix — unit tests for parse-tags.js
// UH-031: AI tagging pipeline

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseTags } from '../scripts/lib/parse-tags.js';
import { TAG_FIELDS } from '../scripts/lib/taxonomy.js';

describe('parseTags', () => {

  it('returns a TagSet with all expected fields', () => {
    const raw = JSON.stringify({ shape: ['sphere'], sound: ['silent'] });
    const result = parseTags(raw);
    for (const field of Object.keys(TAG_FIELDS)) {
      assert.ok(Object.hasOwn(result, field), `missing field: ${field}`);
    }
  });

  it('accepts valid vocabulary values', () => {
    const raw = JSON.stringify({
      hynek: 'NL',
      shape: ['sphere', 'orb'],
      colour: ['orange/amber'],
      motion: ['ascending'],
      sound: ['silent'],
    });
    const result = parseTags(raw);
    assert.strictEqual(result.hynek,       'NL');
    assert.deepEqual(result.shape,         ['sphere', 'orb']);
    assert.deepEqual(result.colour,        ['orange/amber']);
    assert.deepEqual(result.motion,        ['ascending']);
    assert.deepEqual(result.sound,         ['silent']);
  });

  it('replaces out-of-vocabulary values with "unknown"', () => {
    const raw = JSON.stringify({ hynek: 'MADE_UP', shape: ['flying-teapot'] });
    const result = parseTags(raw);
    assert.strictEqual(result.hynek,  'unknown');
    assert.deepEqual(result.shape,    []);
  });

  it('returns all-unknown TagSet on malformed JSON', () => {
    const result = parseTags('not json at all');
    assert.strictEqual(result.hynek, 'unknown');
    assert.deepEqual(result.shape,   []);
    assert.deepEqual(result.sound,   []);
  });

  it('returns all-unknown TagSet on empty string', () => {
    const result = parseTags('');
    assert.strictEqual(result.hynek, 'unknown');
  });

  it('returns error-sentinel TagSet when called with null', () => {
    const result = parseTags(null);
    assert.strictEqual(result.hynek, 'error');
  });

});
