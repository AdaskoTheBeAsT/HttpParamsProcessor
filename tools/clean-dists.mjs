import { rmSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const libsRoot = join(process.cwd(), 'libs');

try {
  const entries = readdirSync(libsRoot, { withFileTypes: true });
  let count = 0;
  for (const dirent of entries) {
    if (!dirent.isDirectory()) continue;
    const distPath = join(libsRoot, dirent.name, 'dist');
    try {
      if (statSync(distPath).isDirectory()) {
        rmSync(distPath, { recursive: true, force: true });
        count++;
        console.log(`Removed: ${distPath}`);
      }
    } catch {
      // dist not present, ignore
    }
  }
  console.log(`Cleaned ${count} dist folder(s).`);
} catch (e) {
  console.error('Failed to clean dist folders:', e);
  process.exit(1);
}
