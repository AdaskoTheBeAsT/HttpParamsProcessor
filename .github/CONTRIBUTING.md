# Contributing to HttpParamsProcessor

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/AdaskoTheBeAsT/HttpParamsProcessor.git
   cd HttpParamsProcessor
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Build all libraries:
   ```bash
   npx nx run-many -t build --all
   ```

4. Run tests:
   ```bash
   npx nx run-many -t test --all
   ```

## GitHub Workflows

### CI Workflow (`ci.yml`)

Runs automatically on:
- Push to `master` or `main` branch
- Pull requests to `master` or `main` branch

Actions performed:
- Lint affected projects
- Test affected projects
- Build affected projects

### Release Workflow (`release.yml`)

**Manual trigger only** - Used for versioning and publishing all packages.

#### First-Time Release (New Libraries)

**Note:** `@adaskothebeast/http-params-processor` is already published on npm. Use "First Release (New Libraries)" workflow for the new plugin libraries.

1. Go to GitHub Actions > "First Release (New Libraries)"
2. Click "Run workflow"
3. Enter version (e.g., `1.0.0`)
4. Keep `include_existing: false` (default) to skip the already-published package
5. Run with `dry_run: true` first to verify everything works
6. Run again with `dry_run: false` to actually publish

#### Subsequent Releases

For subsequent releases:
1. Go to GitHub Actions > Release workflow
2. Click "Run workflow"
3. Leave version_bump empty to auto-detect from conventional commits
4. Or specify `patch`, `minor`, `major` explicitly

### Manual Publish Workflow (`publish-manual.yml`)

For publishing individual packages or all packages with a specific version.

#### First-Time Publishing

1. Go to GitHub Actions > Publish Manual
2. Click "Run workflow"
3. Select project (or "all")
4. Enter version (e.g., `1.0.0`)
5. Select tag (usually `latest`)
6. Run with `dry_run: true` first to verify

## Required Secrets

Configure these secrets in your GitHub repository settings:

| Secret | Description |
|--------|-------------|
| `NPM_TOKEN` | npm access token with publish permissions |
| `NX_CLOUD_ACCESS_TOKEN` | (Optional) Nx Cloud access token for remote caching |

### Getting NPM Token

1. Log in to [npmjs.com](https://www.npmjs.com/)
2. Go to Access Tokens
3. Generate new token with "Automation" type
4. Add as `NPM_TOKEN` secret in GitHub repo settings

## Conventional Commits

This project uses [Conventional Commits](https://www.conventionalcommits.org/) for automatic versioning:

- `feat:` - Minor version bump
- `fix:` - Patch version bump
- `feat!:` or `BREAKING CHANGE:` - Major version bump

Examples:
```
feat(core): add new value converter pipeline
fix(axios): handle undefined params correctly
feat!: change API signature for process method
```

## Publishing Order (First Time)

**Note:** `@adaskothebeast/http-params-processor` is already published on npm.

For first-time publishing of new libraries, they should be published in this order due to dependencies:

1. **Core** (no dependencies) - NEW:
   - `@adaskothebeast/http-params-processor-core`

2. **Key Formatters** (depend on core) - NEW:
   - `@adaskothebeast/http-params-processor-key-bracket-notation`
   - `@adaskothebeast/http-params-processor-key-flat`
   - `@adaskothebeast/http-params-processor-key-json`
   - `@adaskothebeast/http-params-processor-key-custom-delimiter`
   - `@adaskothebeast/http-params-processor-key-rails`

3. **Value From** (depend on core) - NEW:
   - `@adaskothebeast/http-params-processor-value-from-dayjs`
   - `@adaskothebeast/http-params-processor-value-from-moment`
   - `@adaskothebeast/http-params-processor-value-from-luxon`
   - `@adaskothebeast/http-params-processor-value-from-js-joda`

4. **Value To** (depend on core) - NEW:
   - `@adaskothebeast/http-params-processor-value-to-date-fns`
   - `@adaskothebeast/http-params-processor-value-to-unix-timestamp`
   - `@adaskothebeast/http-params-processor-value-to-ms-timestamp`
   - `@adaskothebeast/http-params-processor-value-to-iso`
   - `@adaskothebeast/http-params-processor-value-to-nodatime`

5. **Framework Adapters** (depend on core) - NEW:
   - `@adaskothebeast/http-params-processor-axios`
   - `@adaskothebeast/http-params-processor-fetch`
   - `@adaskothebeast/http-params-processor-resource` (Angular Resource)
   - `@adaskothebeast/http-params-processor-tanstack-query` (React Query)
   - `@adaskothebeast/http-params-processor-swr` (SWR)

6. **Already Published** (update with new version if needed):
   - `@adaskothebeast/http-params-processor` (Angular HttpParams)

The "First Release (New Libraries)" workflow handles the correct order automatically.
