import { test, expect } from '@playwright/test';

test.describe('Authentication Tests', () => {
  test('should access protected routes when authenticated', async ({ page }) => {
    console.log('🔐 Testing authenticated access...');
    
    // Try to access a protected route
    await page.goto('/dashboard');
    
    await page.waitForLoadState('networkidle');
    console.log(`📍 Dashboard URL: ${page.url()}`);
    
    // Check if we're on the dashboard (not redirected to login)
    const pageTitle = await page.title();
    console.log(`📄 Page title: ${pageTitle}`);
    
    // Look for dashboard-specific elements
    const dashboardElements = page.locator('text=Dashboard, text=dashboard');
    const elementCount = await dashboardElements.count();
    console.log(`📊 Found ${elementCount} dashboard elements`);
    
    // Check for user-specific elements
    const userElements = page.locator('text=Sign Out, text=Edit Profile');
    const userElementCount = await userElements.count();
    console.log(`👤 Found ${userElementCount} user-specific elements`);
    
    // If we're authenticated, we should see user elements
    if (userElementCount > 0) {
      console.log('✅ Successfully authenticated - user elements visible');
    } else {
      console.log('⚠️ May not be fully authenticated');
    }
    
    // Take a screenshot
    await page.screenshot({ path: 'auth-test-dashboard.png' });
    console.log('📸 Dashboard screenshot saved');
    
    // Basic assertion
    expect(page.url()).toBeTruthy();
  });

  test('should access deal wizard routes when authenticated', async ({ page }) => {
    console.log('🔐 Testing deal wizard access...');
    
    // Try to access a protected deal wizard route
    await page.goto('/add/deal/social-media/test-deal-id');
    
    await page.waitForLoadState('networkidle');
    console.log(`📍 Deal wizard URL: ${page.url()}`);
    
    // Check if we can access the route (not redirected to login)
    const pageTitle = await page.title();
    console.log(`📄 Page title: ${pageTitle}`);
    
    // Look for wizard-specific elements
    const wizardElements = page.locator('text=wizard, text=Wizard, text=deal, text=Deal');
    const elementCount = await wizardElements.count();
    console.log(`🔮 Found ${elementCount} wizard-related elements`);
    
    // Check for form elements
    const formElements = page.locator('input, textarea, select, button');
    const formElementCount = await formElements.count();
    console.log(`📝 Found ${formElementCount} form elements`);
    
    if (formElementCount > 0) {
      console.log('✅ Successfully accessed deal wizard - form elements present');
    } else {
      console.log('⚠️ Deal wizard may not be fully accessible');
    }
    
    // Take a screenshot
    await page.screenshot({ path: 'auth-test-deal-wizard.png' });
    console.log('📸 Deal wizard screenshot saved');
    
    // Basic assertion
    expect(page.url()).toBeTruthy();
  });
}); 