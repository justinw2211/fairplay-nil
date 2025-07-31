// global-setup.js
import { chromium } from '@playwright/test';

async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('🔐 Setting up authentication for Playwright tests...');

    // Navigate to login page
    await page.goto('http://localhost:3000/login');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check if we're already logged in
    const dashboardLink = page.locator('text=Dashboard');
    if (await dashboardLink.isVisible()) {
      console.log('✅ Already authenticated');
      await page.goto('http://localhost:3000/dashboard');
      await page.waitForLoadState('networkidle');
    } else {
      console.log('🔐 Need to authenticate...');

      // Fill in test credentials - use the actual form field names
      await page.fill('input[type="email"]', 'test1@test.edu');
      await page.fill('input[type="password"]', 'testuser');

      // Submit login form
      await page.click('button[type="submit"]');

      // Wait for authentication to complete - check for dashboard or navigation
      try {
        await page.waitForURL('**/dashboard**', { timeout: 15000 });
        console.log('✅ Authentication successful - redirected to dashboard');
      } catch (error) {
        // If dashboard redirect doesn't work, check if we're still on login page
        const currentUrl = page.url();
        console.log(`📍 Current URL after login attempt: ${currentUrl}`);

        // Check if login was successful by looking for dashboard elements
        const dashboardElements = page.locator('text=Dashboard, text=Sign Out');
        if (await dashboardElements.count() > 0) {
          console.log('✅ Authentication successful - found dashboard elements');
        } else {
          console.log('⚠️ Authentication may have failed, but continuing...');
        }
      }
    }

    // Save authentication state for all tests
    await page.context().storageState({ path: 'playwright/.auth/user.json' });

    console.log('💾 Authentication state saved');

  } catch (error) {
    console.error('❌ Authentication setup failed:', error.message);
    console.log('⚠️ Continuing without authentication - tests may fail');

    // Try to save whatever state we have
    try {
      await page.context().storageState({ path: 'playwright/.auth/user.json' });
      console.log('💾 Saved partial authentication state');
    } catch (saveError) {
      console.error('❌ Failed to save authentication state:', saveError.message);
    }
  } finally {
    await browser.close();
  }
}

export default globalSetup; 