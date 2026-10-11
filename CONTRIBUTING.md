# Contributing to HeiGin UI

Thanks for helping. The full guide is in [docs/contribution-guide.md](docs/contribution-guide.md). In short:

- Ground visual changes in the live HeiGin CRM. Anything else is marked `proposed`.
- Build CRM patterns from primitives, and use tokens only.
- Every component needs typed props, a docs example, a unit test with an axe check, and a regenerated manifest (`npm run manifests`).
- Before opening a PR, run `npm run ci` and `npm run test:e2e`.
- Never commit credentials, cookies, `.env` files or real customer data.
