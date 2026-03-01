# Legacy JavaScript E2E suite

This folder contains the original JavaScript Playwright suite (fixtures, config, pages, specs). It is **not** run by the default Playwright config, which uses `testDir: './tests/specs'` (TypeScript).

To run this JS suite you would need a separate config pointing `testDir` to this folder and using the fixture from `fixtures/base-fixture.js` (specs require `base-fixture`, not `app-fixture`). Kept for reference or if you need to run the old suite.
