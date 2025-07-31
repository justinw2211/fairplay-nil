import { test, expect } from '@playwright/test';

test('should test local development environment', async ({ page }) => {
  // Test frontend
  await page.goto('http://localhost:3000');
  
  console.log('📄 Frontend title:', await page.title());
  console.log('🌐 Frontend URL:', page.url());
  
  // Check for console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  if (consoleErrors.length > 0) {
    console.log('❌ Frontend console errors:', consoleErrors);
  } else {
    console.log('✅ Frontend: No console errors');
  }
  
  // Test backend API
  try {
    const response = await page.request.get('http://localhost:8000/docs');
    console.log('✅ Backend API docs accessible:', response.status());
  } catch (error) {
    console.log('❌ Backend API not accessible:', error.message);
  }
  
  // Take screenshot
  await page.screenshot({ path: 'local-dev-test.png' });
  console.log('📸 Screenshot saved: local-dev-test.png');
  
  // Basic assertions
  expect(await page.title()).toBeTruthy();
}); 