# npm setup for `@heigin/ui`

The package is published to **npm as a public package** in the free `@heigin` organisation, so anyone can install it and read the compiled code. Use is restricted by the proprietary licence ([LICENSE](../LICENSE)): internal HeiGin use only. The source repository is private on GitHub.

## 1. One-time account setup (owner)

These steps need a person; automation cannot create accounts or enter payment details.

1. **Create an npm account** at <https://www.npmjs.com/signup> and turn on two-factor authentication (Account → Two-Factor Authentication).
2. **Create the organisation**: Profile menu → **Add Organization** → name it `heigin`.
   - If `heigin` is taken, choose another name and ask for the package to be renamed (for example `@heigin-crm/ui`).
3. **Invite maintainers**: Organization → Members → Invite. Only people who publish need to be members; installing needs no npm account.
4. **Create a publish token for CI**: Profile → Access Tokens → Generate New Token → **Granular access token**.
   - Permissions: *Read and write*, scoped to the `@heigin` organisation's packages, with **Bypass two-factor authentication** ticked (CI cannot enter a one-time code).
   - Set an expiry and record the renewal date.
5. **Add the token to GitHub**: repository → Settings → Secrets and variables → Actions → **New repository secret**, name `NPM_TOKEN`.

## 2. Publishing

From an up-to-date `main`:

```bash
npm run release:dry-run                    # build, validate the tarball, list the files
npm run version-packages -- patch          # or minor / major (updates packages/ui/package.json)
# move CHANGELOG "Unreleased" notes under the new version; copy them to packages/ui/CHANGELOG.md
git commit -am "release: @heigin/ui v0.1.1"
git tag ui-v0.1.1
git push origin main --tags
```

The **Publish @heigin/ui** workflow (`.github/workflows/publish.yml`) then:

1. checks that the tag matches the package version;
2. runs lint, typecheck, tests, the build, package validation and the secret scan;
3. publishes with `--access public` (and skips if that version already exists).

The first release can also be published by hand after `npm login`:

```bash
npm publish -w @heigin/ui --access public
```

## 3. Installing

No npm account or token is needed:

```bash
npm install @heigin/ui
```

## What is and isn't protected

| | Who can access it |
| --- | --- |
| GitHub repository (source, copy scripts) | Collaborators only (private) |
| npm package `@heigin/ui` | **Public**: anyone can install it and read the compiled JS. The licence forbids use outside HeiGin |
| Docs site (`hei-gin-design-library-gamma.vercel.app`) | **Public.** It shows previews *and* full component source with copy buttons, by choice. The licence forbids reuse, but it can't prevent copying. To hide the source, build a playground-only version, or put the site behind Vercel deployment protection. |
