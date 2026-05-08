import { test, expect } from '@/fixtures/auth.fixture.js';
import { OverviewPage } from '@/pages/overview.page.js';

// Worker-scoped option: must be top-level in this file.
// Keeping this in a separate spec file ensures only this demo test records video.
test.use({
  video: {
    mode: 'on',
    // Higher resolution so the recording shows UI details clearly.
    // Match the project viewport in playwright.config.ts.
    size: { width: 1920, height: 1200 },
  },
  viewport: { width: 1920, height: 1200 },
});

test.describe('Overview - AuthenticatedOnOverview (Video)', () => {
  test.setTimeout(90000);

  test(
    'Record authenticatedOnOverview flow (video)',
    { tag: ['@highlight-auth-video'] },
    async ({ authenticatedOnOverview }) => {
      const overviewPage = new OverviewPage(authenticatedOnOverview);
      await overviewPage.verifyOverviewLoaded();
      await overviewPage.wait(1500);
    },
  );
});

