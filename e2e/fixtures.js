import { test as base } from '@playwright/test';
import { addCoverageReport } from 'monocart-reporter';

export const test = base.extend({
  page: async ({ page }, use) => {
    const isChromium = page.context().browser()?.browserType().name() === 'chromium';

    if (isChromium) {
      await page.coverage.startJSCoverage({
        resetOnNavigation: false
      });
    }
    
    await use(page);

    if (isChromium) {
      const coverage = await page.coverage.stopJSCoverage();
      await addCoverageReport(coverage, page);
    }
  },
});

export { expect } from '@playwright/test';
