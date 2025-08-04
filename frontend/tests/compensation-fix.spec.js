import { test, expect } from '@playwright/test';

test.describe('Compensation Calculation Fix Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the review step for testing
    await page.goto('/add/deal/review/1?type=standard');
    await page.waitForLoadState('networkidle');
  });

  test('should display cash compensation correctly', async ({ page }) => {
    // Mock deal data with cash compensation
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

    // Check that cash compensation is displayed
    const cashCompensation = page.locator('text=Cash Payment');
    await expect(cashCompensation).toBeVisible();

    // Check that the amount is formatted correctly
    const amountText = page.locator('text=$5,000.00');
    await expect(amountText).toBeVisible();
  });

  test('should display goods compensation correctly', async ({ page }) => {
    // Mock deal data with goods compensation
    await page.evaluate(() => {
      window.localStorage.setItem('mockDealData', JSON.stringify({
        id: 1,
        compensation_cash: 0,
        compensation_goods: [
          { description: 'Product A', value: 1000 },
          { description: 'Product B', value: 2000 }
        ],
        compensation_other: [],
        status: 'draft'
      }));
    });

    // Wait for the review step to load
    await page.waitForSelector('[data-testid="deal-overview"]', { timeout: 10000 });

    // Check that goods compensation is displayed
    const goodsCompensation = page.locator('text=Goods/Products');
    await expect(goodsCompensation).toBeVisible();

    // Check that product descriptions are displayed
    const productA = page.locator('text=Product A');
    const productB = page.locator('text=Product B');
    await expect(productA).toBeVisible();
    await expect(productB).toBeVisible();

    // Check that values are formatted correctly
    const value1 = page.locator('text=$1,000.00');
    const value2 = page.locator('text=$2,000.00');
    await expect(value1).toBeVisible();
    await expect(value2).toBeVisible();
  });

  test('should display other compensation correctly', async ({ page }) => {
    // Mock deal data with other compensation
    await page.evaluate(() => {
      window.localStorage.setItem('mockDealData', JSON.stringify({
        id: 1,
        compensation_cash: 0,
        compensation_goods: [],
        compensation_other: [
          { payment_type: 'bonus', description: 'Performance Bonus', estimated_value: 3000 },
          { payment_type: 'royalty', description: 'Royalty Payment', estimated_value: 1500 }
        ],
        status: 'draft'
      }));
    });

    // Wait for the review step to load
    await page.waitForSelector('[data-testid="deal-overview"]', { timeout: 10000 });

    // Check that other compensation types are displayed
    const performanceBonus = page.locator('text=Performance Bonus');
    const royaltyPayment = page.locator('text=Royalty Payment');
    await expect(performanceBonus).toBeVisible();
    await expect(royaltyPayment).toBeVisible();

    // Check that values are formatted correctly
    const bonusValue = page.locator('text=$3,000.00');
    const royaltyValue = page.locator('text=$1,500.00');
    await expect(bonusValue).toBeVisible();
    await expect(royaltyValue).toBeVisible();
  });

  test('should calculate total compensation correctly', async ({ page }) => {
    // Mock deal data with mixed compensation types
    await page.evaluate(() => {
      window.localStorage.setItem('mockDealData', JSON.stringify({
        id: 1,
        compensation_cash: 5000,
        compensation_goods: [
          { description: 'Product A', value: 1000 }
        ],
        compensation_other: [
          { payment_type: 'bonus', description: 'Performance Bonus', estimated_value: 2000 }
        ],
        status: 'draft'
      }));
    });

    // Wait for the review step to load
    await page.waitForSelector('[data-testid="deal-overview"]', { timeout: 10000 });

    // Check that total compensation is calculated correctly (5000 + 1000 + 2000 = 8000)
    const totalValue = page.locator('text=$8,000.00');
    await expect(totalValue).toBeVisible();
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

    // Check that total value shows $0.00 when no compensation data
    const totalValue = page.locator('text=$0.00');
    await expect(totalValue).toBeVisible();
  });

  test('should handle invalid compensation data gracefully', async ({ page }) => {
    // Mock deal data with invalid compensation values
    await page.evaluate(() => {
      window.localStorage.setItem('mockDealData', JSON.stringify({
        id: 1,
        compensation_cash: 'invalid',
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

    // Check that total value shows $0.00 when invalid compensation data
    const totalValue = page.locator('text=$0.00');
    await expect(totalValue).toBeVisible();
  });

  test('should display compensation details in accordion section', async ({ page }) => {
    // Mock deal data with compensation
    await page.evaluate(() => {
      window.localStorage.setItem('mockDealData', JSON.stringify({
        id: 1,
        compensation_cash: 5000,
        compensation_goods: [
          { description: 'Product A', value: 1000 }
        ],
        compensation_other: [
          { payment_type: 'bonus', description: 'Performance Bonus', estimated_value: 2000 }
        ],
        status: 'draft'
      }));
    });

    // Wait for the review step to load
    await page.waitForSelector('[data-testid="deal-overview"]', { timeout: 10000 });

    // Click on the compensation details accordion section
    const compensationSection = page.locator('text=Compensation Details');
    await compensationSection.click();

    // Check that all compensation types are displayed
    const cashPayment = page.locator('text=Cash Payment');
    const goodsProducts = page.locator('text=Goods/Products');
    const performanceBonus = page.locator('text=Performance Bonus');

    await expect(cashPayment).toBeVisible();
    await expect(goodsProducts).toBeVisible();
    await expect(performanceBonus).toBeVisible();
  });

  test('should handle empty compensation arrays correctly', async ({ page }) => {
    // Mock deal data with empty compensation arrays
    await page.evaluate(() => {
      window.localStorage.setItem('mockDealData', JSON.stringify({
        id: 1,
        compensation_cash: 0,
        compensation_goods: [],
        compensation_other: [],
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

    // Check that total value shows $0.00 when no compensation
    const totalValue = page.locator('text=$0.00');
    await expect(totalValue).toBeVisible();
  });

  test('should format currency values correctly', async ({ page }) => {
    // Mock deal data with various currency values
    await page.evaluate(() => {
      window.localStorage.setItem('mockDealData', JSON.stringify({
        id: 1,
        compensation_cash: 1234.56,
        compensation_goods: [
          { description: 'Product A', value: 999.99 }
        ],
        compensation_other: [
          { payment_type: 'bonus', description: 'Performance Bonus', estimated_value: 1000000 }
        ],
        status: 'draft'
      }));
    });

    // Wait for the review step to load
    await page.waitForSelector('[data-testid="deal-overview"]', { timeout: 10000 });

    // Check that currency values are formatted correctly
    const cashValue = page.locator('text=$1,234.56');
    const goodsValue = page.locator('text=$999.99');
    const bonusValue = page.locator('text=$1,000,000.00');

    await expect(cashValue).toBeVisible();
    await expect(goodsValue).toBeVisible();
    await expect(bonusValue).toBeVisible();
  });
}); 