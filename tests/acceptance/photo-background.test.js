// Universal Harmonix — Gherkin / BDD acceptance tests
// UH-016: Photo as sighting background
// Run: node --test tests/acceptance/photo-background.test.js

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { recordCardHtml } from '../../app/js/render.js';

const FAKE_PHOTO = 'data:image/jpeg;base64,/9j/FAKE';

const baseSighting = {
  datetime:     '2026-03-24T21:00:00Z',
  lat:          52.48,
  lng:          -1.89,
  type:         'light',
  description:  'Bright light moving silently',
  duration:     '10 seconds',
  verification: { verdict: 'UNEXPLAINED' },
};

// ── Feature: Photo as sighting background ──────────────────────────────────────

describe('Feature: Photo as sighting background', () => {

  it('Scenario: Sighting with photo shows photo as verification panel background', () => {
    // Given: a sighting with a photo attached
    const sighting = { ...baseSighting, photos: [FAKE_PHOTO] };

    // When: the record card is rendered
    const html = recordCardHtml(sighting, 0);

    // Then: the record body has the has-photo-bg class
    assert.ok(html.includes('has-photo-bg'),
      'record-body must carry has-photo-bg class when photo is present');

    // And: the background-image is set to the first photo
    assert.ok(html.includes(`url('${FAKE_PHOTO}')`),
      'record-body must have background-image set to the first photo');
  });

  it('Scenario: Sighting without photo shows standard background', () => {
    // Given: a sighting with no photos
    const sighting = { ...baseSighting, photos: [] };

    // When: the record card is rendered
    const html = recordCardHtml(sighting, 0);

    // Then: the record body does NOT carry the photo background class
    assert.ok(!html.includes('has-photo-bg'),
      'record-body must not carry has-photo-bg when no photo is present');
  });

});
