/**
 * Build-time environment gate.
 *
 * lib/env.ts throws when NEXT_PUBLIC_API_URL is missing, but every route in this
 * app is server-rendered on demand, so that module is not evaluated during
 * `next build` — a misconfigured deploy would build cleanly and only fail in
 * front of users. This runs as `prebuild`/`predev` so it fails first instead.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const REQUIRED = ['NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_SITE_URL'];
const PLACEHOLDERS = ['CHANGE_ME', 'changeme', 'your-api-url'];

// Next.js loads .env itself at build time; this script runs before that, so read
// the file directly rather than relying on it already being in process.env.
const fromFiles = {};
for (const name of ['.env.local', '.env']) {
  const p = resolve(process.cwd(), name);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    if (key in fromFiles) continue; // .env.local wins
    fromFiles[key] = m[2].trim().replace(/^["']|["']$/g, '');
  }
}

const problems = [];
for (const key of REQUIRED) {
  const value = (process.env[key] ?? fromFiles[key] ?? '').trim();
  if (!value) {
    problems.push(`  ✗ ${key} is not set.`);
  } else if (PLACEHOLDERS.some((p) => value.includes(p))) {
    problems.push(`  ✗ ${key} still holds a placeholder value ("${value}").`);
  } else if (!/^https?:\/\/[^/]+/.test(value)) {
    problems.push(`  ✗ ${key} must be an absolute http(s) URL — got "${value}".`);
  }
}

if (problems.length) {
  console.error('\n╔════════════════════════════════════════════════════════════╗');
  console.error('║  Configuration error — build stopped                        ║');
  console.error('╚════════════════════════════════════════════════════════════╝\n');
  problems.forEach((p) => console.error(p));
  console.error('\nCopy .env.example to .env and set the values above.');
  console.error('Next.js inlines NEXT_PUBLIC_* at build time, so restart after editing.\n');
  process.exit(1);
}

console.log('✓ environment OK');
