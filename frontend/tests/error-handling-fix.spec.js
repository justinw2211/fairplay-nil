import { test, expect } from '@playwright/test';

test.describe('Error Handling Fix Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the review step for testing
    await page.goto('/add/deal/review/1?type=standard');
    await page.waitForLoadState('networkidle');
  });

  test('should handle completely missing deal data gracefully', async ({ page }) => {
    // Mock completely missing deal data
    await page.evaluate(() => {
      window.localStorage.setItem('mockDealData', JSON.stringify(null));
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

    // Check that default values are displayed
    const defaultValues = [
      'text=Untitled Deal',
      'text=$0.00',
      'text=Duration not specified',
      'text=Not specified',
      'text=Not specified'
    ];

    for (const selector of defaultValues) {
      await expect(page.locator(selector)).toBeVisible();
    }
  });

  test('should handle missing compensation data gracefully', async ({ page }) => {
    // Mock deal data with missing compensation fields
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

    // Check that total compensation shows $0.00
    const totalValue = page.locator('text=$0.00');
    await expect(totalValue).toBeVisible();
  });

  test('should handle invalid compensation data gracefully', async ({ page }) => {
    // Mock deal data with invalid compensation values
    await page.evaluate(() => {
      window.localStorage.setItem('mockDealData', JSON.stringify({
        id: 1,
        compensation_cash: 'invalid-string',
        compensation_goods: 'not-an-array',
        compensation_other: null,
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

    // Check that total compensation shows $0.00
    const totalValue = page.locator('text=$0.00');
    await expect(totalValue).toBeVisible();
  });

  test('should handle missing date/obligations data gracefully', async ({ page }) => {
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

  test('should handle missing payor data gracefully', async ({ page }) => {
    // Mock deal data with missing payor information
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

    // Check that default payor values are displayed
    const payorName = page.locator('text=Not specified');
    const payorType = page.locator('text=Not specified');
    await expect(payorName).toBeVisible();
    await expect(payorType).toBeVisible();
  });

  test('should handle missing institution data gracefully', async ({ page }) => {
    // Mock deal data with missing institution information
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

    // Check that default institution values are displayed
    const university = page.locator('text=Not specified');
    const sports = page.locator('text=Not specified');
    await expect(university).toBeVisible();
    await expect(sports).toBeVisible();
  });

  test('should handle malformed deal data gracefully', async ({ page }) => {
    // Mock deal data with malformed structure
    await page.evaluate(() => {
      window.localStorage.setItem('mockDealData', JSON.stringify({
        id: 'not-a-number',
        compensation_cash: {},
        compensation_goods: 'string-instead-of-array',
        compensation_other: 123,
        obligations: 'not-an-object',
        payor_name: [],
        payor_type: {},
        university: null,
        sports: undefined,
        deal_nickname: 456,
        contact_name: false,
        contact_email: [],
        status: 'invalid-status'
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

    // Check that default values are displayed for all fields
    const defaultValues = [
      'text=Untitled Deal',
      'text=$0.00',
      'text=Duration not specified',
      'text=Not specified',
      'text=Not specified',
      'text=Not specified',
      'text=Not specified'
    ];

    for (const selector of defaultValues) {
      await expect(page.locator(selector)).toBeVisible();
    }
  });

  test('should handle currency formatting errors gracefully', async ({ page }) => {
    // Mock deal data with problematic currency values
    await page.evaluate(() => {
      window.localStorage.setItem('mockDealData', JSON.stringify({
        id: 1,
        compensation_cash: NaN,
        compensation_goods: [
          { description: 'Product A', value: 'invalid' },
          { description: 'Product B', value: null }
        ],
        compensation_other: [
          { payment_type: 'bonus', description: 'Bonus', estimated_value: undefined }
        ],
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

    // Check that currency values default to $0.00
    const defaultCurrency = page.locator('text=$0.00');
    await expect(defaultCurrency).toBeVisible();
  });

  test('should handle array access errors gracefully', async ({ page }) => {
    // Mock deal data with problematic array structures
    await page.evaluate(() => {
      window.localStorage.setItem('mockDealData', JSON.stringify({
        id: 1,
        compensation_goods: [
          { description: 'Product A', value: 1000 },
          null,
          { description: 'Product B' }, // missing value
          { description: 'Product C', value: 'invalid' }
        ],
        compensation_other: [
          { payment_type: 'bonus', description: 'Bonus', estimated_value: 2000 },
          undefined,
          { payment_type: 'royalty' }, // missing estimated_value
          { payment_type: 'other', description: 'Other', estimated_value: 'invalid' }
        ],
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

    // Check that valid items are still displayed
    const productA = page.locator('text=Product A');
    const productB = page.locator('text=Product B');
    const bonus = page.locator('text=Bonus');
    await expect(productA).toBeVisible();
    await expect(productB).toBeVisible();
    await expect(bonus).toBeVisible();
  });

  test('should handle object property access errors gracefully', async ({ page }) => {
    // Mock deal data with problematic object structures
    await page.evaluate(() => {
      window.localStorage.setItem('mockDealData', JSON.stringify({
        id: 1,
        obligations: {
          endorsements: {
            duration: '12 months',
            start_date: null,
            end_date: undefined
          },
          social_media: null,
          autographs: undefined,
          content: 'not-an-object'
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

    // Check that valid data is still displayed
    const duration = page.locator('text=12 months');
    await expect(duration).toBeVisible();
  });

  test('should handle undefined and null values gracefully', async ({ page }) => {
    // Mock deal data with undefined and null values
    await page.evaluate(() => {
      window.localStorage.setItem('mockDealData', JSON.stringify({
        id: 1,
        compensation_cash: undefined,
        compensation_goods: null,
        compensation_other: undefined,
        obligations: null,
        payor_name: undefined,
        payor_type: null,
        university: undefined,
        sports: null,
        deal_nickname: undefined,
        contact_name: null,
        contact_email: undefined,
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

    // Check that default values are displayed
    const defaultValues = [
      'text=Untitled Deal',
      'text=$0.00',
      'text=Duration not specified',
      'text=Not specified',
      'text=Not specified',
      'text=Not specified',
      'text=Not specified'
    ];

    for (const selector of defaultValues) {
      await expect(page.locator(selector)).toBeVisible();
    }
  });

  test('should handle deeply nested object access errors gracefully', async ({ page }) => {
    // Mock deal data with deeply nested problematic structures
    await page.evaluate(() => {
      window.localStorage.setItem('mockDealData', JSON.stringify({
        id: 1,
        obligations: {
          endorsements: {
            duration: '12 months',
            details: {
              start_date: '2024-01-01',
              end_date: '2024-12-31',
              terms: null,
              conditions: undefined,
              requirements: 'not-an-object'
            }
          },
          social_media: {
            platforms: null,
            frequency: undefined,
            content: 'not-an-array'
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

    // Check that valid data is still displayed
    const duration = page.locator('text=12 months');
    await expect(duration).toBeVisible();
  });

  test('should handle type conversion errors gracefully', async ({ page }) => {
    // Mock deal data with type conversion issues
    await page.evaluate(() => {
      window.localStorage.setItem('mockDealData', JSON.stringify({
        id: 1,
        compensation_cash: '5000', // string instead of number
        compensation_goods: [
          { description: 'Product A', value: '1000' }, // string instead of number
          { description: 'Product B', value: '2000.50' } // string with decimal
        ],
        compensation_other: [
          { payment_type: 'bonus', description: 'Bonus', estimated_value: '3000' } // string instead of number
        ],
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

    // Check that values are still calculated and displayed correctly
    const totalValue = page.locator('text=$11,000.50'); // 5000 + 1000 + 2000.50 + 3000
    await expect(totalValue).toBeVisible();
  });
}); 