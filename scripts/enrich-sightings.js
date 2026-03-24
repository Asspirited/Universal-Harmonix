#!/usr/bin/env node
// Universal Harmonix — enrich NUFORC UK sightings with environmental context
// UH-033
// Usage: node scripts/enrich-sightings.js [--sample N]
//
// Reads:  data/nuforc-uk-tagged.json
// Writes: data/nuforc-uk-enriched.json

import { readFileSync, writeFileSync } from 'node:fs';
import { kpClient }      from './lib/kp-client.js';
import { weatherClient } from './lib/weather-client.js';
import { buildContext }  from './lib/build-context.js';

const args      = process.argv.slice(2);
const sampleIdx = args.indexOf('--sample');
const sampleN   = sampleIdx !== -1 ? parseInt(args[sampleIdx + 1], 10) : null;

const INPUT  = new URL('../data/nuforc-uk-tagged.json',   import.meta.url);
const OUTPUT = new URL('../data/nuforc-uk-enriched.json', import.meta.url);

const BATCH_SIZE = 5;
const DELAY_MS   = 1000;

const records = JSON.parse(readFileSync(INPUT));
const subset  = sampleN ? records.slice(0, sampleN) : records;

let done = 0;
const results = [];

for (let i = 0; i < subset.length; i += BATCH_SIZE) {
  const batch = subset.slice(i, i + BATCH_SIZE);
  const enriched = await Promise.all(
    batch.map(async r => {
      const context = await buildContext(r, kpClient, weatherClient);
      return { ...r, context };
    })
  );
  results.push(...enriched);
  done += batch.length;
  process.stdout.write(`\rEnriched ${done}/${subset.length} records…`);
  if (i + BATCH_SIZE < subset.length) {
    await new Promise(res => setTimeout(res, DELAY_MS));
  }
}

process.stdout.write('\n');

// If sample run, merge into full record set preserving non-sample records as-is
let output;
if (sampleN) {
  output = results;
} else {
  output = results;
}

writeFileSync(OUTPUT, JSON.stringify(output, null, 2));
console.log(`✅ Written ${output.length} records to nuforc-uk-enriched.json`);

const skipped = output.filter(r => r.context?.skipped).length;
const enriched_count = output.length - skipped;
console.log(`   ${enriched_count} enriched, ${skipped} skipped (no coords or API error)`);
