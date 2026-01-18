import { readdirSync, renameSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2];
if (!dir) {
  console.error('Usage: node tools/rename-to-cjs.mjs <dir>');
  process.exit(1);
}

function walk(d) {
  for (const entry of readdirSync(d)) {
    const full = join(d, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full);
    } else if (st.isFile() && full.endsWith('.js')) {
      const target = full.replace(/\.js$/, '.cjs');
      renameSync(full, target);
    }
  }
}

walk(dir);
