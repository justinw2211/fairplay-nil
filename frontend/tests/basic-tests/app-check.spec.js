import { test, expect } from '@playwright/test';

test.describe('FairPlay NIL Application Check', () => {
  test('should load the FairPlay NIL homepage', async ({ page }) => {
    await page.goto('/');
    
    console.log('📄 Page title:', await page.title());
    console.log('🌐 Current URL:', page.url());
    
    // Check for any console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    if (consoleErrors.length > 0) {
      console.log('❌ Console errors found:', consoleErrors);
    } else {
      console.log('✅ No console errors detected');
    }
    
    // Take a screenshot for visual verification
    await page.screenshot({ path: 'homepage-screenshot.png' });
    console.log('📸 Screenshot saved: homepage-screenshot.png');
    
    // Check what elements are present
    const elements = {
      'nav': await page.locator('nav').count(),
      'header': await page.locator('header').count(),
      'main': await page.locator('main').count(),
      'footer': await page.locator('footer').count(),
      'buttons': await page.locator('button').count(),
      'links': await page.locator('a').count(),
      'forms': await page.locator('form').count(),
      'images': await page.locator('img').count(),
    };
    
    console.log('🔍 Page elements found:', elements);
    
    // Check for specific FairPlay NIL content
    const pageContent = await page.textContent('body');
    if (pageContent) {
      const hasFairPlay = pageContent.toLowerCase().includes('fairplay');
      const hasNil = pageContent.toLowerCase().includes('nil');
      console.log('📝 Content check - FairPlay:', hasFairPlay, 'NIL:', hasNil);
    }
  });

  test('should check for common UI elements', async ({ page }) => {
    await page.goto('/');
    
    // Look for common UI patterns
    const selectors = [
      'nav',
      'header', 
      'main',
      'footer',
      '[role="navigation"]',
      '[role="banner"]',
      '[role="main"]',
      '[role="contentinfo"]'
    ];
    
    for (const selector of selectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`✅ Found ${count} element(s) with selector: ${selector}`);
      }
    }
    
    // Check for React-specific patterns
    const reactElements = await page.locator('[data-testid]').count();
    console.log(`🔧 React test IDs found: ${reactElements}`);
    
    // Check for Chakra UI patterns
    const chakraElements = await page.locator('[class*="chakra"]').count();
    console.log(`🎨 Chakra UI elements found: ${chakraElements}`);
  });
}); 