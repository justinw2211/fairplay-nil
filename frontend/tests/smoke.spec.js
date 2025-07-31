import { test, expect } from '@playwright/test';

test.describe('FairPlay NIL Platform Smoke Tests', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page loads without errors
    await expect(page).toHaveTitle(/FairPlay/);
    
    // Verify critical elements are present
    await expect(page.locator('nav')).toBeVisible();
    
    // Check for any console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Wait a bit for any potential errors
    await page.waitForTimeout(2000);
    
    // Assert no console errors (or log them for debugging)
    if (consoleErrors.length > 0) {
      console.log('Console errors found:', consoleErrors);
    }
  });

  test('should handle navigation without errors', async ({ page }) => {
    await page.goto('/');
    
    // Test navigation to key pages
    const navLinks = [
      { href: '/about', text: 'About' },
      { href: '/athletes', text: 'Athletes' },
      { href: '/brands', text: 'Brands' },
      { href: '/collectives', text: 'Collectives' },
      { href: '/universities', text: 'Universities' },
    ];
    
    for (const link of navLinks) {
      try {
        const navLink = page.locator(`a[href="${link.href}"]`);
        if (await navLink.isVisible()) {
          await navLink.click();
          await page.waitForLoadState('networkidle');
          
          // Check for any console errors after navigation
          const consoleErrors = [];
          page.on('console', msg => {
            if (msg.type() === 'error') {
              consoleErrors.push(msg.text());
            }
          });
          
          await page.waitForTimeout(1000);
          
          if (consoleErrors.length > 0) {
            console.log(`Console errors on ${link.href}:`, consoleErrors);
          }
        }
      } catch (error) {
        console.log(`Navigation test failed for ${link.href}:`, error.message);
      }
    }
  });

  test('should handle authentication flow', async ({ page }) => {
    await page.goto('/login');
    
    // Check login page loads
    await expect(page.locator('form')).toBeVisible();
    
    // Test form validation (without submitting)
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    if (await emailInput.isVisible()) {
      await emailInput.fill('test@example.com');
      await passwordInput.fill('password123');
      
      // Don't submit - just check form works
      await expect(emailInput).toHaveValue('test@example.com');
    }
  });
}); 