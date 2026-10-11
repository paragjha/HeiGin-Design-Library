# Release process

> **Nothing has been published.** `@heigin/ui` is marked `"private": true` so that `npm publish` refuses to run by accident. Releasing needs explicit approval of the version, the registry and the visibility.

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

### Publishing (requires approval)

1. Remove `"private": true` from `packages/ui/package.json`, and choose a `license` (it is `UNLICENSED` today).
2. Check the name. The `@heigin` scope must belong to an npm organisation you control. On 2026-10-11, `npm view @heigin/ui` returned 404, so the package doesn't exist, but nobody has checked whether the *scope* is free or who owns it. If you can't get the scope, use a scope you own (for example `@your-org/heigin-ui`) and update the README and docs.
3. Publish:
   - **Private package** (`publishConfig.access: "restricted"`, the current setting): needs a paid npm organisation plan. Consumers need an npm token with read access, in `.npmrc` locally and as a CI secret.
   - **Public package:** `npm publish -w @heigin/ui --access public`. Anyone can install it. Only do this if the source may be public.
   - **GitHub Packages:** set `publishConfig.registry` to `https://npm.pkg.github.com`. Access follows the private repository's permissions, and consumers authenticate with a GitHub token.
4. Push the tag, then create a GitHub release from it with the CHANGELOG section as notes. Attach the `.tgz` from `.tmp/validate-package/` if useful.

A private GitHub repository **does not** make an npm package private. Package visibility is set by the registry and `access` option above.

## Source-copy updates

Developers who copied components own those files. Note copy-relevant changes in the CHANGELOG under "Source-copy". To update, re-run the copy script with `--force` for the components concerned (it overwrites only those files and prints the new npm dependencies), then review the diff in your app.

## Docs deployment

`npm run build:docs` produces a static site in `apps/docs/dist`. It uses hash routing and relative asset paths, so it works on any static host or subpath. CI uploads it as an artifact. Deploying it anywhere public needs approval.
