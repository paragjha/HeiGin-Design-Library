# Release process

> `@heigin/ui` is published as a **public** package in the `@heigin` npm organisation (proprietary licence). Account and token setup: [npm-setup.md](npm-setup.md).

## Versioning

- [Semantic versioning](https://semver.org). While the version is `0.x`, minor bumps may contain breaking changes; say so in the CHANGELOG.
- Breaking changes include renamed or removed props, exports or tokens, changed default variants or sizes, and changed DOM structure that consumers might style. A visual change to a token value is a **minor** change, with screenshots in the PR.
- Record every user-facing change in `CHANGELOG.md` under **Unreleased** in the same PR.

## Cutting a release

```bash
# 1. Everything green
npm ci
npm run ci            # tokens/manifests up to date, lint, types, unit, builds, package + source checks, secret scan
npm run test:e2e

# 2. Bump the version (no git tag yet)
npm run version-packages -- minor      # or patch / major / 0.2.0
# then move "Unreleased" notes in CHANGELOG.md under the new version, and copy them to packages/ui/CHANGELOG.md

# 3. Dry run: builds, validates the tarball, prints the exact file list
npm run release:dry-run

# 4. Commit and tag
git commit -am "release: @heigin/ui v0.2.0"
git tag ui-v0.2.0
```

### Publishing

Push a `ui-vX.Y.Z` tag. The `Publish @heigin/ui` workflow verifies and publishes with `--access public` using the `NPM_TOKEN` secret. Then create a GitHub release from the tag, with the CHANGELOG section as notes. See [npm-setup.md](npm-setup.md).

## Source-copy updates

Developers who copied components own those files. Note copy-relevant changes in the CHANGELOG under "Source-copy". To update, re-run the copy script with `--force` for the components concerned (it overwrites only those files and prints the new npm dependencies), then review the diff in your app.

## Docs deployment

`npm run build:docs` produces a static site in `apps/docs/dist`. It uses hash routing and relative asset paths, so it works on any static host or subpath. CI uploads it as an artifact. Deploying it anywhere public needs approval.
