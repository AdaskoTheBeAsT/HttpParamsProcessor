import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const libRoot = process.argv[2];
if (!libRoot) {
  console.error('Usage: node tools/emit-package-json.mjs <libRoot>');
  process.exit(1);
}

const pkgPath = join(libRoot, 'package.json');
// Output to root dist folder instead of local dist
const libName = libRoot.split('/').pop();
const distDir = join('dist', 'libs', libName);
const esmDir = join(distDir, 'esm');
const cjsDir = join(distDir, 'cjs');

const sourcePkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

// Resolve outputs across bundlers
const exists = (p) => existsSync(p);
const pickFirst = (arr) => arr.find((p) => exists(p));

const esmCandidates = [
  join(esmDir, 'index.js'), // swc/tsc dual-dir
  join(distDir, 'index.js'), // esbuild/vite
  join(distDir, 'index.esm.js'), // rollup default
];
const cjsCandidates = [
  join(cjsDir, 'index.cjs'), // swc/tsc dual-dir
  join(distDir, 'index.cjs'), // esbuild
  join(distDir, 'index.cjs.js'), // rollup default
];
const typesCandidates = [
  join(distDir, 'index.d.ts'),
  join(esmDir, 'index.d.ts'),
];

const esmFile = pickFirst(esmCandidates);
const cjsFile = pickFirst(cjsCandidates);
const typesFile = pickFirst(typesCandidates) ?? './index.d.ts';

// Compute relative paths from dist
const relFromDist = (abs) =>
  abs ? `.${abs.slice(distDir.length).replace(/\\/g, '/')}` : undefined;
const relEsm = relFromDist(esmFile) ?? './esm/index.js';
const relCjs = relFromDist(cjsFile) ?? './cjs/index.cjs';
const relTypes = relFromDist(typesFile) ?? './index.d.ts';

// Create dist/package.json pointing to built outputs
const distPkg = {
  name: sourcePkg.name,
  version: sourcePkg.version ?? '0.0.0',
  type: 'module',
  main: relCjs,
  module: relEsm,
  types: relTypes,
  exports: {
    '.': {
      types: relTypes,
      ...(esmFile ? { import: relEsm, default: relEsm } : {}),
      ...(cjsFile ? { require: relCjs } : {}),
    },
    './package.json': './package.json',
  },
};

mkdirSync(distDir, { recursive: true });
writeFileSync(join(distDir, 'package.json'), JSON.stringify(distPkg, null, 2));

// Add type-only package.json files for folder-specific resolution
// Add type-only package.json in subfolders when they exist
if (relEsm.startsWith('./esm/')) {
  mkdirSync(esmDir, { recursive: true });
  writeFileSync(
    join(esmDir, 'package.json'),
    JSON.stringify({ type: 'module' }, null, 2),
  );
}
if (relCjs.startsWith('./cjs/')) {
  mkdirSync(cjsDir, { recursive: true });
  writeFileSync(
    join(cjsDir, 'package.json'),
    JSON.stringify({ type: 'commonjs' }, null, 2),
  );
}
