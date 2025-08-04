import { test, expect } from '@playwright/test';

test.describe('Date Field Fix Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the review step for testing
    await page.goto('/add/deal/review/1?type=standard');
    await page.waitForLoadState('networkidle');
  });

  test('should display deal duration with valid endorsement data', async ({ page }) => {
    // Mock deal data with valid endorsement duration
    await page.evaluate(() => {
      window.localStorage.setItem('mockDealData', JSON.stringify({
        id: 1,
        obligations: {
          endorsements: {
            duration: '12 months'
          }
        },
        status: 'draft'
      }));
    });

    // Wait for the review step to load
    await page.waitForSelector('[data-testid="deal-overview"]', { timeout: 10000 });

    // Check that deal duration is displayed correctly
    const dealDuration = page.locator('text=12 months');
    await expect(dealDuration).toBeVisible();

    // Check that the "Deal Period" label is present
    const dealPeriodLabel = page.locator('text=Deal Period');
    await expect(dealPeriodLabel).toBeVisible();
  });

  test('should handle missing endorsement data gracefully', async ({ page }) => {
    // Mock deal data with missing endorsement data
    await page.evaluate(() => {
      window.localStorage.setItem('mockDealData', JSON.stringify({
        id: 1,
        obligations: {},
        status: 'draft'
      }));
    });

    // Wait for the review step to load
    await page.waitForSelector('[data-testid="deal-overview"]', { timeout: 10000 });

    // Check that the page loads without errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.waitForTimeout(2000);

    // Should not have any JavaScript errors
    expect(consoleErrors.length).toBe(0);

    // Check that default duration message is displayed
    const defaultDuration = page.locator('text=Duration not specified');
    await expect(defaultDuration).toBeVisible();
  });

  test('should handle missing obligations data gracefully', async ({ page }) => {
    // Mock deal data with missing obligations
    await page.evaluate(() => {
      window.localStorage.setItem('mockDealData', JSON.stringify({
        id: 1,
        status: 'draft'
      }));
    });

    // Wait for the review step to load
    await page.waitForSelector('[data-testid="deal-overview"]', { timeout: 10000 });

    // Check that the page loads without errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.waitForTimeout(2000);

    // Should not have any JavaScript errors
    expect(consoleErrors.length).toBe(0);

    // Check that default duration message is displayed
    const defaultDuration = page.locator('text=Duration not specified');
    await expect(defaultDuration).toBeVisible();
  });

  test('should handle invalid endorsement data gracefully', async ({ page }) => {
    // Mock deal data with invalid endorsement data
    await page.evaluate(() => {
      window.localStorage.setItem('mockDealData', JSON.stringify({
        id: 1,
        obligations: {
          endorsements: {
            duration: null
          }
        },
        status: 'draft'
      }));
    });

    // Wait for the review step to load
    await page.waitForSelector('[data-testid="deal-overview"]', { timeout: 10000 });

    // Check that the page loads without errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.waitForTimeout(2000);

    // Should not have any JavaScript errors
    expect(consoleErrors.length).toBe(0);

    // Check that default duration message is displayed
    const defaultDuration = page.locator('text=Duration not specified');
    await expect(defaultDuration).toBeVisible();
  });

  test('should handle various duration formats correctly', async ({ page }) => {
    // Test different duration formats
    const durationTests = [
      { duration: '6 months', expected: '6 months' },
      { duration: '1 year', expected: '1 year' },
      { duration: '2 years', expected: '2 years' },
      { duration: '90 days', expected: '90 days' },
      { duration: 'Indefinite', expected: 'Indefinite' }
    ];

    for (const testCase of durationTests) {
      // Mock deal data with specific duration
      await page.evaluate((duration) => {
        window.localStorage.setItem('mockDealData', JSON.stringify({
          id: 1,
          obligations: {
            endorsements: {
              duration: duration
            }
          },
          status: 'draft'
        }));
      }, testCase.duration);

      // Reload the page to apply new mock data
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForSelector('[data-testid="deal-overview"]', { timeout: 10000 });

      // Check that the duration is displayed correctly
      const durationText = page.locator(`text=${testCase.expected}`);
      await expect(durationText).toBeVisible();
    }
  });

  test('should handle empty string duration gracefully', async ({ page }) => {
    // Mock deal data with empty string duration
    await page.evaluate(() => {
      window.localStorage.setItem('mockDealData', JSON.stringify({
        id: 1,
        obligations: {
          endorsements: {
            duration: ''
          }
        },
        status: 'draft'
      }));
    });

    // Wait for the review step to load
    await page.waitForSelector('[data-testid="deal-overview"]', { timeout: 10000 });

    // Check that the page loads without errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.waitForTimeout(2000);

    // Should not have any JavaScript errors
    expect(consoleErrors.length).toBe(0);

    // Check that default duration message is displayed
    const defaultDuration = page.locator('text=Duration not specified');
    await expect(defaultDuration).toBeVisible();
  });

  test('should handle undefined endorsement data gracefully', async ({ page }) => {
    // Mock deal data with undefined endorsement data
    await page.evaluate(() => {
      window.localStorage.setItem('mockDealData', JSON.stringify({
        id: 1,
        obligations: {
          endorsements: undefined
        },
        status: 'draft'
      }));
    });

    // Wait for the review step to load
    await page.waitForSelector('[data-testid="deal-overview"]', { timeout: 10000 });

    // Check that the page loads without errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.waitForTimeout(2000);

    // Should not have any JavaScript errors
    expect(consoleErrors.length).toBe(0);

    // Check that default duration message is displayed
    const defaultDuration = page.locator('text=Duration not specified');
    await expect(defaultDuration).toBeVisible();
  });

  test('should handle malformed obligations data gracefully', async ({ page }) => {
    // Mock deal data with malformed obligations
    await page.evaluate(() => {
      window.localStorage.setItem('mockDealData', JSON.stringify({
        id: 1,
        obligations: 'not-an-object',
        status: 'draft'
      }));
    });

    // Wait for the review step to load
    await page.waitForSelector('[data-testid="deal-overview"]', { timeout: 10000 });

    // Check that the page loads without errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.waitForTimeout(2000);

    // Should not have any JavaScript errors
    expect(consoleErrors.length).toBe(0);

    // Check that default duration message is displayed
    const defaultDuration = page.locator('text=Duration not specified');
    await expect(defaultDuration).toBeVisible();
  });

  test('should display deal duration in the correct section', async ({ page }) => {
    // Mock deal data with valid endorsement duration
    await page.evaluate(() => {
      window.localStorage.setItem('mockDealData', JSON.stringify({
        id: 1,
        obligations: {
          endorsements: {
            duration: '12 months'
          }
        },
        status: 'draft'
      }));
    });

    // Wait for the review step to load
    await page.waitForSelector('[data-testid="deal-overview"]', { timeout: 10000 });

    // Check that deal duration is in the Deal Overview section
    const dealOverviewSection = page.locator('text=Deal Overview');
    await expect(dealOverviewSection).toBeVisible();

    // Check that the duration is displayed within the deal overview
    const dealPeriodLabel = page.locator('text=Deal Period');
    const durationValue = page.locator('text=12 months');

    await expect(dealPeriodLabel).toBeVisible();
    await expect(durationValue).toBeVisible();

    // Verify they are in the same section
    const dealOverviewCard = page.locator('[data-testid="deal-overview"]');
    await expect(dealOverviewCard).toContainElement(dealPeriodLabel);
    await expect(dealOverviewCard).toContainElement(durationValue);
  });

  test('should handle complex endorsement data structure', async ({ page }) => {
    // Mock deal data with complex endorsement structure
    await page.evaluate(() => {
      window.localStorage.setItem('mockDealData', JSON.stringify({
        id: 1,
        obligations: {
          endorsements: {
            duration: '18 months',
            start_date: '2024-01-01',
            end_date: '2025-06-30',
            terms: 'Standard endorsement terms'
          }
        },
        status: 'draft'
      }));
    });

    // Wait for the review step to load
    await page.waitForSelector('[data-testid="deal-overview"]', { timeout: 10000 });

    // Check that the page loads without errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.waitForTimeout(2000);

    // Should not have any JavaScript errors
    expect(consoleErrors.length).toBe(0);

    // Check that duration is displayed correctly
    const durationText = page.locator('text=18 months');
    await expect(durationText).toBeVisible();
  });
}); 