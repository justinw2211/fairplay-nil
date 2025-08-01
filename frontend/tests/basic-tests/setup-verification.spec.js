import { test, expect } from '@playwright/test';

test.describe('Playwright Setup Verification', () => {
  test('should verify Playwright is working', async ({ page }) => {
    // Simple test to verify Playwright is working
    await page.goto('https://example.com');
    await expect(page).toHaveTitle(/Example Domain/);
    console.log('✅ Playwright setup is working correctly!');
  });

  test('should handle basic page interactions', async ({ page }) => {
    await page.goto('https://example.com');
    
    // Test basic page functionality
    const title = await page.title();
    expect(title).toContain('Example');
    
    // Test that we can interact with elements
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    
    console.log('✅ Basic page interactions are working!');
  });
}); 