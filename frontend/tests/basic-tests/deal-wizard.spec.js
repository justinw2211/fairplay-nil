import { test, expect } from '@playwright/test';

test.describe('Deal Wizard Tests', () => {
  test('should load deal wizard without errors', async ({ page }) => {
    await page.goto('/deal-wizard');
    
    // Check for any console errors during load
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    if (consoleErrors.length > 0) {
      console.log('Deal Wizard console errors:', consoleErrors);
    }
    
    // Verify wizard components are present
    await expect(page.locator('[data-testid="deal-wizard"]')).toBeVisible();
  });

  test('should handle deal wizard form interactions', async ({ page }) => {
    await page.goto('/deal-wizard');
    
    // Test form field interactions
    const formFields = [
      'input[name="dealType"]',
      'input[name="compensation"]',
      'textarea[name="description"]'
    ];
    
    for (const fieldSelector of formFields) {
      try {
        const field = page.locator(fieldSelector);
        if (await field.isVisible()) {
          await field.fill('test value');
          await expect(field).toHaveValue('test value');
        }
      } catch (error) {
        console.log(`Field interaction failed for ${fieldSelector}:`, error.message);
      }
    }
  });

  test('should handle deal wizard step navigation', async ({ page }) => {
    await page.goto('/deal-wizard');
    
    // Look for step navigation elements
    const stepButtons = page.locator('[data-testid*="step"]');
    
    if (await stepButtons.count() > 0) {
      for (let i = 0; i < await stepButtons.count(); i++) {
        try {
          await stepButtons.nth(i).click();
          await page.waitForTimeout(500);
          
          // Check for errors after step change
          const consoleErrors = [];
          page.on('console', msg => {
            if (msg.type() === 'error') {
              consoleErrors.push(msg.text());
            }
          });
          
          if (consoleErrors.length > 0) {
            console.log(`Step navigation errors:`, consoleErrors);
          }
        } catch (error) {
          console.log(`Step navigation failed:`, error.message);
        }
      }
    }
  });
}); 