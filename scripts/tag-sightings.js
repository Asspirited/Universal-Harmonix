// Universal Harmonix — AI tagging pipeline CLI
// Usage: node scripts/tag-sightings.js --input data/nuforc-uk.json --output data/nuforc-uk-tagged.json [--sample 200]
// ANTHROPIC_API_KEY must be set in environment.

import { readFile, writeFile } from 'node:fs/promises';
import { buildPrompt }   from './lib/build-prompt.js';
import { parseTags }     from './lib/parse-tags.js';
import { claudeClient }  from './lib/claude-client.js';
import { emptyTagSet }   from './lib/taxonomy.js';

// ── Core (exported for testing) ───────────────────────────────────────────────

export async function tagSightings(records, client, { sample } = {}) {
  const subset = sample ? records.slice(0, sample) : records;

  const tagged = await Promise.all(subset.map(async (record) => {
    const comment = record.comments?.trim() ?? '';

    // Empty comment → all-unknown tags, no API call
    if (!comment) {
      return { ...record, tags: emptyTagSet('unknown') };
    }

    let responseText;
    try {
      const prompt = buildPrompt(comment);
      responseText = await client(prompt);
    } catch {
      return { ...record, tags: emptyTagSet('error') };
    }

    return { ...record, tags: parseTags(responseText) };
  }));

  return tagged;
}

// ── CLI entry point ───────────────────────────────────────────────────────────

async function main() {
  const args    = process.argv.slice(2);
  const input   = args[args.indexOf('--input')  + 1] ?? 'data/nuforc-uk.json';
  const output  = args[args.indexOf('--output') + 1] ?? 'data/nuforc-uk-tagged.json';
  const sample  = args.includes('--sample') ? Number(args[args.indexOf('--sample') + 1]) : undefined;

  const apiKey  = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) { console.error('ANTHROPIC_API_KEY not set'); process.exit(1); }

  const records = JSON.parse(await readFile(input, 'utf8'));
  console.log(`Loaded ${records.length} records from ${input}`);
  if (sample) console.log(`Sampling ${sample} records`);

  const client = (prompt) => claudeClient(prompt, apiKey);
  const tagged = await tagSightings(records, client, { sample });

  await writeFile(output, JSON.stringify(tagged, null, 2), 'utf8');
  console.log(`Done — wrote ${tagged.length} tagged records to ${output}`);
}

// Only run as CLI when invoked directly
if (process.argv[1].endsWith('tag-sightings.js')) {
  main().catch(err => { console.error(err); process.exit(1); });
}
