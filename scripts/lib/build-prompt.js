// Universal Harmonix — build Claude prompt for taxonomy tagging
// Pure function — no I/O, no API calls.

import {
  A1_HYNEK, A2_SHAPE, A3_COLOUR, A4_LIGHT,
  B1_MOTION, B2_SPEED, B3_ALTITUDE, B4_DIRECTION, B5_UNUSUAL,
  C1_SOUND, C2_SMELL, C3_SENSATION
} from './taxonomy.js';

export function buildPrompt(comment) {
  const text = comment ? String(comment).trim() : '';

  return `You are a UAP sighting analyst. Extract taxonomy tags from the witness account below.

Return ONLY valid JSON — no explanation, no markdown fences.

WITNESS ACCOUNT:
"${text}"

TAXONOMY (use only values listed — use "unknown" if unclear, empty array [] if multi-select and nothing applies):

hynek (single):     ${A1_HYNEK.join(' | ')}
shape (multi):      ${A2_SHAPE.join(' | ')}
colour (multi):     ${A3_COLOUR.join(' | ')}
light (multi):      ${A4_LIGHT.join(' | ')}
motion (multi):     ${B1_MOTION.join(' | ')}
speed (single):     ${B2_SPEED.join(' | ')}
altitude (single):  ${B3_ALTITUDE.join(' | ')}
direction (single): ${B4_DIRECTION.join(' | ')}
unusual (multi):    ${B5_UNUSUAL.join(' | ')}
sound (multi):      ${C1_SOUND.join(' | ')}
smell (single):     ${C2_SMELL.join(' | ')}
sensation (single): ${C3_SENSATION.join(' | ')}

Respond with a single JSON object containing all 12 fields.`;
}
