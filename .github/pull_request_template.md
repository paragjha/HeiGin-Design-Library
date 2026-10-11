## What changed

<!-- One or two sentences. Link the issue if there is one. -->

## Evidence

- [ ] Visual changes are grounded in the live HeiGin CRM, or tokens/components are marked `proposed` with a reason
- [ ] Screenshots or a docs link for anything visual

## Checklist

- [ ] `npm run lint && npm run typecheck && npm test`
- [ ] New/changed component has: typed props, docs entry, example file, unit test with axe check
- [ ] `npm run manifests` and `npm run tokens` re-run if source or tokens changed (CI checks this)
- [ ] `npm run validate:package` passes if exports changed
- [ ] CHANGELOG.md updated under "Unreleased" for user-facing changes
- [ ] No customer data, credentials, cookies or `.env` files added
