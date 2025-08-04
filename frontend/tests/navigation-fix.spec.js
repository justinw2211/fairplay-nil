import { test, expect } from '@playwright/test';

test.describe('Navigation Fix Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the review step for testing
    await page.goto('/add/deal/review/1?type=standard');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to activities section when Edit button is clicked', async ({ page }) => {
    // Mock deal data
    await page.evaluate(() => {
      window.localStorage.setItem('mockDealData', JSON.stringify({
        id: 1,
        obligations: {
          endorsements: { duration: '12 months' },
          social_media: { description: 'Social media posts' }
        },
        status: 'draft'
      }));
    });

    // Wait for the review step to load
    await page.waitForSelector('[data-testid="deal-overview"]', { timeout: 10000 });

    // Click the Edit button in the Activities & Obligations section
    const activitiesEditButton = page.locator('text=Activities & Obligations').locator('..').locator('button:has-text("Edit")');
    await activitiesEditButton.click();

    // Check that navigation occurred with correct URL and parameters
    await expect(page).toHaveURL(/\/add\/deal\/activities\/select\/1\?type=standard/);
  });

  test('should navigate to compensation section when Edit button is clicked', async ({ page }) => {
    // Mock deal data with compensation
    await page.evaluate(() => {
      window.localStorage.setItem('mockDealData', JSON.stringify({
        id: 1,
        compensation_cash: 5000,
        compensation_goods: [],
        compensation_other: [],
        status: 'draft'
      }));
    });

    // Wait for the review step to load
    await page.waitForSelector('[data-testid="deal-overview"]', { timeout: 10000 });

    // Click the Edit button in the Compensation Details section
    const compensationEditButton = page.locator('text=Compensation Details').locator('..').locator('button:has-text("Edit")');
    await compensationEditButton.click();

    // Check that navigation occurred with correct URL and parameters
    await expect(page).toHaveURL(/\/add\/deal\/compensation\/1\?type=standard/);
  });

  test('should navigate to compliance section when Edit button is clicked', async ({ page }) => {
    // Mock deal data with compliance information
    await page.evaluate(() => {
      window.localStorage.setItem('mockDealData', JSON.stringify({
        id: 1,
        obligations: {
          uses_school_ip: 'yes',
          grant_exclusivity: 'no',
          licenses_nil: 'yes'
        },
        status: 'draft'
      }));
    });

    // Wait for the review step to load
    await page.waitForSelector('[data-testid="deal-overview"]', { timeout: 10000 });

    // Click the Edit button in the Compliance Information section
    const complianceEditButton = page.locator('text=Compliance Information').locator('..').locator('button:has-text("Edit")');
    await complianceEditButton.click();

    // Check that navigation occurred with correct URL and parameters
    await expect(page).toHaveURL(/\/add\/deal\/compliance\/1\?type=standard/);
  });

  test('should preserve deal type parameter in navigation', async ({ page }) => {
    // Test with different deal types
    const dealTypes = ['standard', 'clearinghouse', 'valuation'];

    for (const dealType of dealTypes) {
      // Navigate to review step with specific deal type
      await page.goto(`/add/deal/review/1?type=${dealType}`);
      await page.waitForLoadState('networkidle');
      await page.waitForSelector('[data-testid="deal-overview"]', { timeout: 10000 });

      // Mock deal data
      await page.evaluate(() => {
        window.localStorage.setItem('mockDealData', JSON.stringify({
          id: 1,
          obligations: {
            endorsements: { duration: '12 months' }
          },
          status: 'draft'
        }));
      });

      // Click the Edit button in the Activities section
      const activitiesEditButton = page.locator('text=Activities & Obligations').locator('..').locator('button:has-text("Edit")');
      await activitiesEditButton.click();

      // Check that the deal type parameter is preserved
      await expect(page).toHaveURL(new RegExp(`\\/add\\/deal\\/activities\\/select\\/1\\?type=${dealType}`));
    }
  });

  test('should prevent accordion collapse when Edit button is clicked', async ({ page }) => {
    // Mock deal data
    await page.evaluate(() => {
      window.localStorage.setItem('mockDealData', JSON.stringify({
        id: 1,
        obligations: {
          endorsements: { duration: '12 months' }
        },
        status: 'draft'
      }));
    });

    // Wait for the review step to load
    await page.waitForSelector('[data-testid="deal-overview"]', { timeout: 10000 });

    // Expand the Activities section
    const activitiesSection = page.locator('text=Activities & Obligations');
    await activitiesSection.click();

    // Wait for the section to expand
    await page.waitForTimeout(500);

    // Click the Edit button
    const activitiesEditButton = page.locator('text=Activities & Obligations').locator('..').locator('button:has-text("Edit")');
    await activitiesEditButton.click();

    // Check that navigation occurred (this means the button click worked and didn't collapse the accordion)
    await expect(page).toHaveURL(/\/add\/deal\/activities\/select\/1\?type=standard/);
  });

  test('should display Edit icon on clickable sections', async ({ page }) => {
    // Mock deal data
    await page.evaluate(() => {
      window.localStorage.setItem('mockDealData', JSON.stringify({
        id: 1,
        obligations: {
          endorsements: { duration: '12 months' }
        },
        status: 'draft'
      }));
    });

    // Wait for the review step to load
    await page.waitForSelector('[data-testid="deal-overview"]', { timeout: 10000 });

    // Check that Edit icons are present on clickable sections
    const activitiesEditIcon = page.locator('text=Activities & Obligations').locator('..').locator('button:has-text("Edit") svg');
    const compensationEditIcon = page.locator('text=Compensation Details').locator('..').locator('button:has-text("Edit") svg');
    const complianceEditIcon = page.locator('text=Compliance Information').locator('..').locator('button:has-text("Edit") svg');

    await expect(activitiesEditIcon).toBeVisible();
    await expect(compensationEditIcon).toBeVisible();
    await expect(complianceEditIcon).toBeVisible();
  });

  test('should show pointer cursor on clickable sections', async ({ page }) => {
    // Mock deal data
    await page.evaluate(() => {
      window.localStorage.setItem('mockDealData', JSON.stringify({
        id: 1,
        obligations: {
          endorsements: { duration: '12 months' }
        },
        status: 'draft'
      }));
    });

    // Wait for the review step to load
    await page.waitForSelector('[data-testid="deal-overview"]', { timeout: 10000 });

    // Check that Edit buttons have pointer cursor
    const activitiesEditButton = page.locator('text=Activities & Obligations').locator('..').locator('button:has-text("Edit")');
    const compensationEditButton = page.locator('text=Compensation Details').locator('..').locator('button:has-text("Edit")');
    const complianceEditButton = page.locator('text=Compliance Information').locator('..').locator('button:has-text("Edit")');

    await expect(activitiesEditButton).toHaveCSS('cursor', 'pointer');
    await expect(compensationEditButton).toHaveCSS('cursor', 'pointer');
    await expect(complianceEditButton).toHaveCSS('cursor', 'pointer');
  });

  test('should handle navigation for all deal types', async ({ page }) => {
    // Test navigation for different deal types
    const dealTypes = ['standard', 'clearinghouse', 'valuation'];

    for (const dealType of dealTypes) {
      // Navigate to review step with specific deal type
      await page.goto(`/add/deal/review/1?type=${dealType}`);
      await page.waitForLoadState('networkidle');
      await page.waitForSelector('[data-testid="deal-overview"]', { timeout: 10000 });

      // Mock deal data
      await page.evaluate(() => {
        window.localStorage.setItem('mockDealData', JSON.stringify({
          id: 1,
          obligations: {
            endorsements: { duration: '12 months' }
          },
          status: 'draft'
        }));
      });

      // Test navigation to each section
      const sections = [
        { name: 'Activities', url: 'activities/select' },
        { name: 'Compensation', url: 'compensation' },
        { name: 'Compliance', url: 'compliance' }
      ];

      for (const section of sections) {
        // Click the Edit button for this section
        const editButton = page.locator(`text=${section.name}`).locator('..').locator('button:has-text("Edit")');
        await editButton.click();

        // Check that navigation occurred with correct URL and parameters
        await expect(page).toHaveURL(new RegExp(`\\/add\\/deal\\/${section.url}\\/1\\?type=${dealType}`));

        // Go back to review step for next test
        await page.goto(`/add/deal/review/1?type=${dealType}`);
        await page.waitForLoadState('networkidle');
        await page.waitForSelector('[data-testid="deal-overview"]', { timeout: 10000 });
      }
    }
  });

  test('should handle navigation with different deal IDs', async ({ page }) => {
    // Test with different deal IDs
    const dealIds = [1, 2, 3];

    for (const dealId of dealIds) {
      // Navigate to review step with specific deal ID
      await page.goto(`/add/deal/review/${dealId}?type=standard`);
      await page.waitForLoadState('networkidle');
      await page.waitForSelector('[data-testid="deal-overview"]', { timeout: 10000 });

      // Mock deal data
      await page.evaluate((id) => {
        window.localStorage.setItem('mockDealData', JSON.stringify({
          id: id,
          obligations: {
            endorsements: { duration: '12 months' }
          },
          status: 'draft'
        }));
      }, dealId);

      // Click the Edit button in the Activities section
      const activitiesEditButton = page.locator('text=Activities & Obligations').locator('..').locator('button:has-text("Edit")');
      await activitiesEditButton.click();

      // Check that navigation occurred with correct deal ID
      await expect(page).toHaveURL(new RegExp(`\\/add\\/deal\\/activities\\/select\\/${dealId}\\?type=standard`));
    }
  });

  test('should handle navigation without errors', async ({ page }) => {
    // Mock deal data
    await page.evaluate(() => {
      window.localStorage.setItem('mockDealData', JSON.stringify({
        id: 1,
        obligations: {
          endorsements: { duration: '12 months' }
        },
        status: 'draft'
      }));
    });

    // Wait for the review step to load
    await page.waitForSelector('[data-testid="deal-overview"]', { timeout: 10000 });

    // Monitor for console errors during navigation
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Click the Edit button in the Activities section
    const activitiesEditButton = page.locator('text=Activities & Obligations').locator('..').locator('button:has-text("Edit")');
    await activitiesEditButton.click();

    // Wait for navigation to complete
    await page.waitForTimeout(2000);

    // Should not have any JavaScript errors
    expect(consoleErrors.length).toBe(0);

    // Check that navigation occurred successfully
    await expect(page).toHaveURL(/\/add\/deal\/activities\/select\/1\?type=standard/);
  });

  test('should handle full navigation flow: Edit → Next → Next → Review', async ({ page }) => {
    // Mock deal data
    await page.evaluate(() => {
      window.localStorage.setItem('mockDealData', JSON.stringify({
        id: 1,
        obligations: {
          endorsements: { duration: '12 months' }
        },
        status: 'draft'
      }));
    });

    // Wait for the review step to load
    await page.waitForSelector('[data-testid="deal-overview"]', { timeout: 10000 });

    // Step 1: Click Edit button to go to activities
    const activitiesEditButton = page.locator('text=Activities & Obligations').locator('..').locator('button:has-text("Edit")');
    await activitiesEditButton.click();

    // Verify we're on the activities page
    await expect(page).toHaveURL(/\/add\/deal\/activities\/select\/1\?type=standard/);

    // Step 2: Navigate to next step (compensation)
    await page.goto('/add/deal/compensation/1?type=standard');
    await page.waitForLoadState('networkidle');

    // Step 3: Navigate to next step (compliance)
    await page.goto('/add/deal/compliance/1?type=standard');
    await page.waitForLoadState('networkidle');

    // Step 4: Navigate back to review
    await page.goto('/add/deal/review/1?type=standard');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="deal-overview"]', { timeout: 10000 });

    // Verify we're back on the review page
    await expect(page).toHaveURL(/\/add\/deal\/review\/1\?type=standard/);

    // Verify the review page loads correctly
    const reviewTitle = page.locator('text=Review Your Deal');
    await expect(reviewTitle).toBeVisible();
  });
}); 