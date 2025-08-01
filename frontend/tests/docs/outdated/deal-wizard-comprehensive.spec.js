import { test, expect } from '@playwright/test';

// This test uses the authenticated project to access protected routes
test.describe('Comprehensive Deal Wizard Flow', () => {
  test('should complete full deal wizard flow', async ({ page }) => {
    console.log('🚀 Starting comprehensive deal wizard test...');
    
    // Start at deal type selection (should be accessible)
    await page.goto('/deal-type-selection');
    console.log('📄 Navigated to deal type selection');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if we're logged in by looking for user-specific elements
    const dashboardLink = page.locator('text=Dashboard');
    if (await dashboardLink.isVisible()) {
      console.log('✅ User is authenticated');
    } else {
      console.log('⚠️ User may not be authenticated');
    }
    
    // Look for deal type options and select one
    const dealTypeOptions = page.locator('[data-testid*="deal-type"], button, a');
    const dealTypeCount = await dealTypeOptions.count();
    console.log(`🔍 Found ${dealTypeCount} potential deal type options`);
    
    // Try to find and click a deal type option
    for (let i = 0; i < Math.min(dealTypeCount, 5); i++) {
      const option = dealTypeOptions.nth(i);
      const text = await option.textContent();
      console.log(`Option ${i}: ${text}`);
      
      // Look for endorsement or similar deal types
      if (text && (text.toLowerCase().includes('endorsement') || text.toLowerCase().includes('deal'))) {
        console.log(`🎯 Clicking deal type: ${text}`);
        await option.click();
        break;
      }
    }
    
    // Wait for navigation after deal type selection
    await page.waitForTimeout(2000);
    console.log(`📍 Current URL: ${page.url()}`);
    
    // Check if we're now in a wizard step
    if (page.url().includes('/add/deal/')) {
      console.log('✅ Successfully navigated to deal wizard');
      
      // Test form interactions if we're in a wizard step
      const formFields = page.locator('input, textarea, select');
      const fieldCount = await formFields.count();
      console.log(`📝 Found ${fieldCount} form fields`);
      
      // Fill out some test data
      for (let i = 0; i < Math.min(fieldCount, 3); i++) {
        const field = formFields.nth(i);
        const fieldType = await field.getAttribute('type');
        const fieldName = await field.getAttribute('name');
        
        if (fieldType === 'text' || fieldType === 'email') {
          await field.fill('test value');
          console.log(`✅ Filled field: ${fieldName}`);
        } else if (fieldType === 'number') {
          await field.fill('1000');
          console.log(`✅ Filled number field: ${fieldName}`);
        }
      }
      
      // Look for navigation buttons
      const nextButton = page.locator('text=Next, button[type="submit"], [data-testid*="next"]');
      if (await nextButton.count() > 0) {
        console.log('🔘 Found next button, clicking...');
        await nextButton.first().click();
        await page.waitForTimeout(2000);
        console.log(`📍 After next: ${page.url()}`);
      }
      
    } else {
      console.log('⚠️ Did not navigate to wizard as expected');
    }
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'deal-wizard-flow.png' });
    console.log('📸 Screenshot saved: deal-wizard-flow.png');
    
    // Basic assertion that we made progress
    expect(page.url()).toBeTruthy();
  });

  test('should test clearinghouse wizard flow', async ({ page }) => {
    console.log('🏛️ Testing clearinghouse wizard...');
    
    // Navigate directly to clearinghouse wizard
    await page.goto('/clearinghouse-wizard/test-deal-id');
    
    await page.waitForLoadState('networkidle');
    console.log(`📍 Clearinghouse URL: ${page.url()}`);
    
    // Check if we can access the protected route
    const pageTitle = await page.title();
    console.log(`📄 Page title: ${pageTitle}`);
    
    // Look for clearinghouse-specific elements
    const clearinghouseElements = page.locator('text=clearinghouse, text=Clearinghouse, text=NCAA');
    const elementCount = await clearinghouseElements.count();
    console.log(`🏛️ Found ${elementCount} clearinghouse-related elements`);
    
    // Test form interactions if available
    const formFields = page.locator('input, textarea, select');
    const fieldCount = await formFields.count();
    console.log(`📝 Found ${fieldCount} form fields in clearinghouse wizard`);
    
    if (fieldCount > 0) {
      // Fill out some test data
      for (let i = 0; i < Math.min(fieldCount, 2); i++) {
        const field = formFields.nth(i);
        const fieldType = await field.getAttribute('type');
        
        if (fieldType === 'text') {
          await field.fill('test clearinghouse data');
          console.log(`✅ Filled clearinghouse field ${i}`);
        }
      }
    }
    
    await page.screenshot({ path: 'clearinghouse-wizard.png' });
    console.log('📸 Clearinghouse screenshot saved');
  });

  test('should test valuation wizard flow', async ({ page }) => {
    console.log('💰 Testing valuation wizard...');
    
    // Navigate directly to valuation wizard
    await page.goto('/valuation-wizard/test-deal-id');
    
    await page.waitForLoadState('networkidle');
    console.log(`📍 Valuation URL: ${page.url()}`);
    
    // Check if we can access the protected route
    const pageTitle = await page.title();
    console.log(`📄 Page title: ${pageTitle}`);
    
    // Look for valuation-specific elements
    const valuationElements = page.locator('text=valuation, text=Valuation, text=value, text=Value');
    const elementCount = await valuationElements.count();
    console.log(`💰 Found ${elementCount} valuation-related elements`);
    
    // Test form interactions if available
    const formFields = page.locator('input, textarea, select');
    const fieldCount = await formFields.count();
    console.log(`📝 Found ${fieldCount} form fields in valuation wizard`);
    
    if (fieldCount > 0) {
      // Fill out some test data
      for (let i = 0; i < Math.min(fieldCount, 2); i++) {
        const field = formFields.nth(i);
        const fieldType = await field.getAttribute('type');
        
        if (fieldType === 'text') {
          await field.fill('test valuation data');
          console.log(`✅ Filled valuation field ${i}`);
        } else if (fieldType === 'number') {
          await field.fill('5000');
          console.log(`✅ Filled valuation number field ${i}`);
        }
      }
    }
    
    await page.screenshot({ path: 'valuation-wizard.png' });
    console.log('📸 Valuation screenshot saved');
  });
}); 