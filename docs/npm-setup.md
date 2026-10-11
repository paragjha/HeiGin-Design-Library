# Private npm setup for `@heigin/ui`

The package is published to **npm as a private (restricted) package** in the `@heigin` organisation. Only members of that organisation can install it. The repository is private on GitHub, and the code is under a proprietary licence ([LICENSE](../LICENSE)).

## 1. One-time account setup (owner)

These steps need a person; automation cannot create accounts or enter payment details.

1. **Create an npm account** at <https://www.npmjs.com/signup> and turn on two-factor authentication (Account → Two-Factor Authentication).
2. **Create the organisation**: Profile menu → **Add Organization** → name it `heigin`.
   - Private packages need the **paid** organisation plan. Check npm's pricing page for the current cost per member.
   - If `heigin` is taken, choose another name and ask for the package to be renamed (for example `@heigin-crm/ui`).
3. **Invite the team**: Organization → Members → Invite. Every developer who installs the package needs an npm account in the organisation.
4. **Create a publish token for CI**: Profile → Access Tokens → Generate New Token → **Granular access token**.
   - Permissions: *Read and write*, scoped to the `@heigin` organisation's packages.
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
3. publishes with `--access restricted` (and skips if that version already exists).

The first release can also be published by hand after `npm login`:

```bash
npm publish -w @heigin/ui --access restricted
```

## 3. Installing (each developer)

Each developer needs to be a member of the `@heigin` organisation and logged in once:

```bash
npm login
npm install @heigin/ui
```

**CI and deploys of apps that use the package** (Vercel, GitHub Actions) also need a read-only token:

1. Create a **granular read-only** token scoped to `@heigin`.
2. Add it to that app's environment as `NPM_TOKEN`.
3. Commit this `.npmrc` to the app. It contains no secret, only the variable name:

   ```ini
   @heigin:registry=https://registry.npmjs.org/
   //registry.npmjs.org/:_authToken=${NPM_TOKEN}
   ```

## What is and isn't protected

| | Who can access it |
| --- | --- |
| GitHub repository (source, copy scripts) | Collaborators only (private) |
| npm package `@heigin/ui` | `@heigin` organisation members only (restricted) |
| Docs site (`hei-gin-design-library-gamma.vercel.app`) | **Public.** It shows previews *and* full component source with copy buttons, by choice. The licence forbids reuse, but it can't prevent copying. To hide the source, build a playground-only version, or put the site behind Vercel deployment protection. |
