import fs from 'fs';
import path from 'path';

const libs = [
  'http-params-processor-key-bracket-notation',
  'http-params-processor-key-custom-delimiter',
  'http-params-processor-key-flat',
  'http-params-processor-key-json',
  'http-params-processor-key-rails',
  'http-params-processor-react-swr',
  'http-params-processor-react-tanstack-query',
  'http-params-processor-value-from-dayjs',
  'http-params-processor-value-from-js-joda',
  'http-params-processor-value-from-luxon',
  'http-params-processor-value-from-moment',
  'http-params-processor-value-to-date-fns',
  'http-params-processor-value-to-iso',
  'http-params-processor-value-to-ms-timestamp',
  'http-params-processor-value-to-nodatime',
  'http-params-processor-value-to-unix-timestamp',
];

const baseDir = 'libs';

function createProjectJson(libName) {
  return JSON.stringify({
    "name": `@adaskothebeast/${libName}`,
    "$schema": "../../node_modules/nx/schemas/project-schema.json",
    "sourceRoot": `libs/${libName}/src`,
    "projectType": "library",
    "tags": [],
    "targets": {
      "bundle": {
        "executor": "@nx/esbuild:esbuild",
        "outputs": ["{options.outputPath}"],
        "options": {
          "outputPath": `{workspaceRoot}/dist/libs/${libName}`,
          "main": `libs/${libName}/src/index.ts`,
          "tsConfig": `libs/${libName}/tsconfig.lib.json`,
          "format": ["esm", "cjs"],
          "declaration": false
        }
      },
      "build": {
        "executor": "nx:run-commands",
        "options": {
          "parallel": false,
          "commands": [
            `nx run ${libName}:bundle`,
            `tsc -p libs/${libName}/tsconfig.lib.json`,
            `node tools/emit-package-json.mjs libs/${libName}`
          ]
        },
        "outputs": [`{workspaceRoot}/dist/libs/${libName}`]
      }
    }
  }, null, 2);
}

function createPackageJson(libName) {
  return JSON.stringify({
    "name": `@adaskothebeast/${libName}`,
    "version": "0.0.1",
    "type": "module",
    "main": "./dist/index.js",
    "module": "./dist/index.js",
    "types": "./dist/index.d.ts",
    "exports": {
      "./package.json": "./package.json",
      ".": {
        "types": "./dist/index.d.ts",
        "import": "./dist/index.js",
        "default": "./dist/index.js"
      }
    },
    "files": ["dist", "!**/*.tsbuildinfo"],
    "peerDependencies": {
      "@adaskothebeast/http-params-processor-core": "^0.0.1"
    }
  }, null, 2);
}

function createTsConfig() {
  return JSON.stringify({
    "extends": "../../tsconfig.base.json",
    "files": [],
    "include": [],
    "references": [
      { "path": "./tsconfig.lib.json" },
      { "path": "./tsconfig.spec.json" }
    ]
  }, null, 2);
}

function createTsConfigLib(libName) {
  return JSON.stringify({
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
      "baseUrl": ".",
      "rootDir": "src",
      "outDir": `../../dist/libs/${libName}`,
      "tsBuildInfoFile": `../../dist/libs/${libName}/tsconfig.lib.tsbuildinfo`,
      "emitDeclarationOnly": true,
      "forceConsistentCasingInFileNames": true,
      "types": ["node"]
    },
    "include": ["src/**/*.ts"],
    "references": [],
    "exclude": [
      "vite.config.ts", "vite.config.mts", "vitest.config.ts", "vitest.config.mts",
      "src/**/*.test.ts", "src/**/*.spec.ts", "src/**/*.test.tsx", "src/**/*.spec.tsx",
      "src/**/*.test.js", "src/**/*.spec.js", "src/**/*.test.jsx", "src/**/*.spec.jsx"
    ]
  }, null, 2);
}

function createTsConfigSpec() {
  return JSON.stringify({
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
      "outDir": "./out-tsc/vitest",
      "types": ["vitest/globals", "vitest/importMeta", "vite/client", "node", "vitest"],
      "forceConsistentCasingInFileNames": true
    },
    "include": [
      "vite.config.ts", "vite.config.mts", "vitest.config.ts", "vitest.config.mts",
      "src/**/*.test.ts", "src/**/*.spec.ts", "src/**/*.test.tsx", "src/**/*.spec.tsx",
      "src/**/*.test.js", "src/**/*.spec.js", "src/**/*.test.jsx", "src/**/*.spec.jsx",
      "src/**/*.d.ts"
    ],
    "references": [{ "path": "./tsconfig.lib.json" }]
  }, null, 2);
}

function createEslintConfig(libName) {
  return `import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    languageOptions: {
      parserOptions: {
        project: ['libs/${libName}/tsconfig.*?.json'],
      },
    },
  },
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: [
            '{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}',
            '{projectRoot}/esbuild.config.{js,ts,mjs,mts}',
            '{projectRoot}/vite.config.{js,ts,mjs,mts}',
            '{projectRoot}/vitest.config.{js,ts,mjs,mts}',
          ],
          ignoredDependencies: ['vitest'],
        },
      ],
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
  {
    ignores: ['**/out-tsc'],
  },
];
`;
}

function createVitestConfig(libName) {
  return `import { defineConfig } from 'vitest/config';
import * as path from 'node:path';

const project = 'libs/${libName}';
const reportPath = \`../../.reports/\${project}/\`;

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/libs/${libName}',
  test: {
    name: '@adaskothebeast/${libName}',
    watch: false,
    globals: true,
    environment: 'node',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: [
      'default',
      ['html', { outputFile: \`\${reportPath}html/index.html\` }],
      ['junit', { outputFile: \`\${reportPath}report.junit.xml\` }],
      [
        'vitest-sonar-reporter',
        {
          outputFile: \`\${reportPath}report.sonar.xml\`,
          onWritePath(reportPath: string) {
            return path.relative('.', reportPath);
          },
        },
      ],
    ],
    coverage: {
      reportsDirectory: \`\${reportPath}html/coverage\`,
      provider: 'v8' as const,
      enabled: true,
      reporter: ['lcov', 'cobertura', 'html', 'text-summary'],
      all: true,
    },
    cacheDir: '../../node_modules/.vitest'
  }
}));
`;
}

function createReadme(libName) {
  return `# ${libName}

This library was generated with [Nx](https://nx.dev).
`;
}

function createIndexTs(libName) {
  return `// ${libName} exports
export {};
`;
}

for (const lib of libs) {
  const libDir = path.join(baseDir, lib);
  const srcDir = path.join(libDir, 'src');
  const libSrcDir = path.join(srcDir, 'lib');

  // Create directories
  if (!fs.existsSync(libSrcDir)) {
    fs.mkdirSync(libSrcDir, { recursive: true });
    console.log(`Created directory: ${libSrcDir}`);
  }

  // Create files
  fs.writeFileSync(path.join(libDir, 'project.json'), createProjectJson(lib));
  fs.writeFileSync(path.join(libDir, 'package.json'), createPackageJson(lib));
  fs.writeFileSync(path.join(libDir, 'tsconfig.json'), createTsConfig());
  fs.writeFileSync(path.join(libDir, 'tsconfig.lib.json'), createTsConfigLib(lib));
  fs.writeFileSync(path.join(libDir, 'tsconfig.spec.json'), createTsConfigSpec());
  fs.writeFileSync(path.join(libDir, 'eslint.config.mjs'), createEslintConfig(lib));
  fs.writeFileSync(path.join(libDir, 'vitest.config.mts'), createVitestConfig(lib));
  fs.writeFileSync(path.join(libDir, 'README.md'), createReadme(lib));
  fs.writeFileSync(path.join(srcDir, 'index.ts'), createIndexTs(lib));

  console.log(`Created library: ${lib}`);
}

console.log('Done generating libraries!');
