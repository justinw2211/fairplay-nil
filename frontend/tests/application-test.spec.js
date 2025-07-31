import { test, expect } from '@playwright/test';

test('should load FairPlay NIL application', async ({ page }) => {
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
  await page.waitForTimeout(3000);
  
  if (consoleErrors.length > 0) {
    console.log('❌ Console errors found:', consoleErrors);
  } else {
    console.log('✅ No console errors detected');
  }
  
  // Take a screenshot
  await page.screenshot({ path: 'fairplay-nil-app.png' });
  console.log('📸 Screenshot saved: fairplay-nil-app.png');
  
  // Check page content
  const bodyText = await page.textContent('body');
  console.log('📝 Body text length:', bodyText ? bodyText.length : 0);
  
  // Check for React app mounting
  const reactRoot = await page.locator('#root').count();
  console.log('⚛️ React root found:', reactRoot > 0);
  
  // Check for any interactive elements
  const buttons = await page.locator('button').count();
  const links = await page.locator('a').count();
  const inputs = await page.locator('input').count();
  
  console.log('🔘 Buttons found:', buttons);
  console.log('🔗 Links found:', links);
  console.log('📝 Inputs found:', inputs);
  
  // Basic assertion that page loaded
  expect(await page.title()).toBeTruthy();
}); 