// Universal Harmonix — parse Claude response into a validated TagSet
// Pure function — no I/O, no API calls.

import { TAG_FIELDS, emptyTagSet } from './taxonomy.js';

function filterVocab(values, vocab) {
  if (!Array.isArray(values)) return [];
  return values.filter(v => vocab.includes(v));
}

function validateSingular(value, vocab) {
  return vocab.includes(value) ? value : 'unknown';
}

export function parseTags(responseText) {
  // null signals an API error — return error-sentinel
  if (responseText === null || responseText === undefined) {
    return emptyTagSet('error');
  }

  let raw;
  try {
    // Strip markdown code fences if Claude wraps in ```json ... ```
    const cleaned = String(responseText).replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    raw = JSON.parse(cleaned);
  } catch {
    return emptyTagSet('unknown');
  }

  const tags = {};
  for (const [field, { vocab, multi }] of Object.entries(TAG_FIELDS)) {
    if (multi) {
      tags[field] = filterVocab(raw[field], vocab);
    } else {
      tags[field] = validateSingular(raw[field], vocab);
    }
  }
  return tags;
}
