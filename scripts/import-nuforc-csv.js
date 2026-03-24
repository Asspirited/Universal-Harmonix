// Universal Harmonix — Import NUFORC CSV, filter to UK, write data/nuforc-uk.json
// Usage: node scripts/import-nuforc-csv.js [path/to/complete.csv]
// Default input: /mnt/c/Users/roden/Downloads/complete.csv

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const INPUT  = process.argv[2] ?? '/mnt/c/Users/roden/Downloads/complete.csv';
const OUTPUT = resolve('data/nuforc-uk.json');

function decodeHtmlEntities(str) {
  return str
    .replace(/&#44/g, ',')
    .replace(/&amp;/g,  '&')
    .replace(/&lt;/g,   '<')
    .replace(/&gt;/g,   '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g,  "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

// Minimal CSV parser — handles quoted fields with embedded commas/newlines
function parseCsv(text) {
  const rows = [];
  let field  = '';
  let inQuote = false;
  let row = [];
  let i = 0;

  while (i < text.length) {
    const ch = text[i];
    if (inQuote) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; } // escaped quote
        inQuote = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuote = true;
      } else if (ch === ',') {
        row.push(field); field = '';
      } else if (ch === '\n') {
        row.push(field); field = '';
        rows.push(row); row = [];
      } else if (ch !== '\r') {
        field += ch;
      }
    }
    i++;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

async function main() {
  console.log(`Reading ${INPUT} …`);
  const text = await readFile(INPUT, 'utf8');
  const rows = parseCsv(text);

  const [headerRow, ...dataRows] = rows;
  const headers = headerRow.map(h => h.trim().toLowerCase().replace(/[^a-z0-9]/g, '_'));

  // country column index
  const countryIdx = headers.indexOf('country');
  if (countryIdx === -1) { console.error('country column not found'); process.exit(1); }

  const ukRows = dataRows.filter(r => r[countryIdx]?.trim().toLowerCase() === 'gb');
  console.log(`Total rows: ${dataRows.length} — UK rows: ${ukRows.length}`);

  const records = ukRows.map((r, i) => {
    const obj = Object.fromEntries(headers.map((h, j) => [h, r[j]?.trim() ?? '']));
    return {
      id:               `nuforc-${String(i + 1).padStart(5, '0')}`,
      datetime:         obj.datetime,
      city:             obj.city,
      county:           obj.state,    // NUFORC uses 'state' for UK county
      country:          obj.country,
      shape:            obj.shape || 'unknown',
      duration_seconds: obj.duration__seconds_ ? Number(obj.duration__seconds_) : null,
      duration_text:    obj['duration__hours_min_'] ?? obj.duration__hours_min_ ?? '',
      comments:         decodeHtmlEntities(obj.comments ?? ''),
      date_posted:      obj.date_posted ?? '',
      lat:              obj.latitude  ? Number(obj.latitude)  : null,
      lon:              obj.longitude ? Number(obj.longitude) : null,
    };
  }).filter(r => r.datetime); // drop any blank rows

  await mkdir('data', { recursive: true });
  await writeFile(OUTPUT, JSON.stringify(records, null, 2), 'utf8');
  console.log(`Done — wrote ${records.length} UK records to ${OUTPUT}`);
  console.log(`Sample record:\n${JSON.stringify(records[0], null, 2)}`);
}

main().catch(err => { console.error(err); process.exit(1); });
