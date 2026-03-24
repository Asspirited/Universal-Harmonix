// Universal Harmonix — unit tests for build-prompt.js
// UH-031: AI tagging pipeline

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildPrompt } from '../scripts/lib/build-prompt.js';

describe('buildPrompt', () => {

  it('returns a non-empty string', () => {
    const result = buildPrompt('A bright orange sphere hovered silently.');
    assert.ok(typeof result === 'string' && result.length > 0);
  });

  it('includes the witness comment verbatim', () => {
    const comment = 'Bright triangular object moving fast to the north.';
    const result = buildPrompt(comment);
    assert.ok(result.includes(comment), 'prompt must contain the witness comment');
  });

  it('references the taxonomy fields expected in response', () => {
    const result = buildPrompt('test');
    assert.ok(result.includes('shape'),  'prompt must mention shape');
    assert.ok(result.includes('motion'), 'prompt must mention motion');
    assert.ok(result.includes('sound'),  'prompt must mention sound');
  });

  it('requests JSON output', () => {
    const result = buildPrompt('test');
    assert.ok(result.toLowerCase().includes('json'), 'prompt must ask for JSON output');
  });

  it('handles empty comment without throwing', () => {
    assert.doesNotThrow(() => buildPrompt(''));
    assert.doesNotThrow(() => buildPrompt(null));
  });

});
