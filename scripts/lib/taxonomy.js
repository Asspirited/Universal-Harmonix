// Universal Harmonix — AI tagging taxonomy vocabulary
// Categories A, B, C only (v1). Source: docs/data-taxonomy.md

export const A1_HYNEK = [
  'NL','DD','RV','CE1','CE2','CE3','CE4','CE5','USO','GND','unknown'
];

export const A2_SHAPE = [
  'sphere','disc/saucer','triangle','cigar/cylinder','rectangle',
  'boomerang/chevron','teardrop','diamond','star-like','orb','ring/torus',
  'egg/oval','cross','irregular/amorphous','formation','unknown'
];

export const A3_COLOUR = [
  'white','orange/amber','red','green','blue','yellow','silver/metallic',
  'black','multicolour','changing','unknown'
];

export const A4_LIGHT = [
  'steady','pulsing','flashing/strobing','rotating','glowing',
  'luminous-trail','none','unknown'
];

export const B1_MOTION = [
  'stationary/hovering','straight-line','curved-path','erratic/darting',
  'pendulum','spiral','falling','ascending','rotating-in-place','zigzag',
  'instant-acceleration','disappeared-in-place','unknown'
];

export const B2_SPEED = [
  'stationary','very-slow','slow (aircraft-like)','fast',
  'very-fast','instantaneous','variable','unknown'
];

export const B3_ALTITUDE = [
  'ground-level','low (<300m)','medium (300m–3km)',
  'high (3km–10km)','very-high (>10km)','unknown'
];

export const B4_DIRECTION = [
  'N','NE','E','SE','S','SW','W','NW','ascent','descent','unknown'
];

export const B5_UNUSUAL = [
  'right-angle-turn','non-inertial-acceleration','silent-at-speed',
  'impossible-hover','split-into-multiple','merged-from-multiple','transmedium'
];

export const C1_SOUND = [
  'silent','humming','buzzing','whirring','whoosh','roaring',
  'high-pitched','low-frequency/rumble','electronic-tone','clicking','unknown'
];

export const C2_SMELL = [
  'none','ozone/electrical','burning','sulphur','unusual-sweet','unknown'
];

export const C3_SENSATION = [
  'none','heat','cold','vibration','static-electricity','nausea',
  'paralysis','time-distortion','missing-time','unknown'
];

// All array fields in a TagSet — used for validation and empty-set construction
export const TAG_FIELDS = {
  hynek:     { vocab: A1_HYNEK,   multi: false },
  shape:     { vocab: A2_SHAPE,   multi: true  },
  colour:    { vocab: A3_COLOUR,  multi: true  },
  light:     { vocab: A4_LIGHT,   multi: true  },
  motion:    { vocab: B1_MOTION,  multi: true  },
  speed:     { vocab: B2_SPEED,   multi: false },
  altitude:  { vocab: B3_ALTITUDE,multi: false },
  direction: { vocab: B4_DIRECTION,multi: false},
  unusual:   { vocab: B5_UNUSUAL, multi: true  },
  sound:     { vocab: C1_SOUND,   multi: true  },
  smell:     { vocab: C2_SMELL,   multi: false },
  sensation: { vocab: C3_SENSATION,multi: false},
};

export function emptyTagSet(fill = 'unknown') {
  return Object.fromEntries(
    Object.entries(TAG_FIELDS).map(([k, { multi }]) =>
      [k, multi ? [] : fill]
    )
  );
}
