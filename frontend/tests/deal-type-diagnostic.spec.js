import { test } from '@playwright/test';

/**
 * Deal Type Navigation Diagnostic Tests
 * 
 * These tests are designed to systematically explore each step of the deal wizard
 * to understand the form structure, required fields, and navigation patterns.
 * 
 * Current Focus:
 * - Step 1: Social Media Platforms (✅ Working)
 * - Step 2: Deal Terms (🔄 In Progress - popup issue)
 * - Steps 3-6: Payor Info, Activities, Compliance, Compensation (⏳ Pending)
 * 
 * Environment: Production (https://fairplay-nil.vercel.app)
 * Test Account: test1@test.edu / testuser
 */

test.describe('Deal Type Navigation Diagnostic', () => {
  test('should test production version authentication', async ({ page }) => {
    console.log('🔍 DIAGNOSTIC: Testing production version...');
    
    // Try to access production version
    await page.goto('https://fairplay-nil.vercel.app/login');
    await page.waitForLoadState('networkidle');
    
    console.log(`📍 Production URL: ${page.url()}`);
    
    // Check if we can log in to production
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
      console.log('✅ Found login form on production');
      
      // Try to log in
      await emailInput.fill('test1@test.edu');
      await passwordInput.fill('testuser');
      
      const submitButton = page.locator('button[type="submit"]');
      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForTimeout(3000);
        
        console.log(`📍 URL after login attempt: ${page.url()}`);
        
        // Check if we're on dashboard
        if (page.url().includes('/dashboard')) {
          console.log('✅ Successfully logged into production dashboard');
          
          // Look for deal type buttons
          const getStartedButtons = page.locator('button:has-text("Get Started")');
          const buttonCount = await getStartedButtons.count();
          console.log(`🔘 "Get Started" buttons found on production: ${buttonCount}`);
          
          if (buttonCount > 0) {
            console.log('🎯 Clicking "Get Started" on production...');
            await getStartedButtons.first().click();
            await page.waitForTimeout(5000);
            
            const currentUrl = page.url();
            console.log(`📍 URL after clicking "Get Started" on production: ${currentUrl}`);
            
            if (!currentUrl.includes('/dashboard')) {
              console.log('✅ Successfully navigated away from dashboard on production!');
              
              // Take screenshot
              await page.screenshot({ path: 'test-results/diagnostic-production-success.png' });
              console.log('📸 Screenshot saved: diagnostic-production-success.png');
              
              // Check what's on the page
              const formElements = page.locator('input, textarea, select, button');
              const elementCount = await formElements.count();
              console.log(`📝 Form elements on production page: ${elementCount}`);
              
            } else {
              console.log('❌ Still on dashboard on production');
            }
          }
        } else {
          console.log('❌ Login to production failed');
        }
      }
    } else {
      console.log('❌ No login form found on production');
    }
  });

  test('should explore production deal wizard pages', async ({ page }) => {
    console.log('🔍 DIAGNOSTIC: Exploring production deal wizard pages...');
    
    // Log into production
    await page.goto('https://fairplay-nil.vercel.app/login');
    await page.waitForLoadState('networkidle');
    
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    await emailInput.fill('test1@test.edu');
    await passwordInput.fill('testuser');
    
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    await page.waitForTimeout(3000);
    
    // Navigate to dashboard and click "Get Started"
    await page.goto('https://fairplay-nil.vercel.app/dashboard');
    await page.waitForLoadState('networkidle');
    
    const getStartedButtons = page.locator('button:has-text("Get Started")');
    await getStartedButtons.first().click();
    await page.waitForTimeout(3000);
    
    console.log(`📍 Current URL: ${page.url()}`);
    
    // Check what's on the social media step
    const pageTitle = await page.title();
    console.log(`📄 Page title: ${pageTitle}`);
    
    // Look for form elements
    const formElements = page.locator('input, textarea, select, button');
    const elementCount = await formElements.count();
    console.log(`📝 Total form elements: ${elementCount}`);
    
    // Look for specific input types
    const textInputs = page.locator('input[type="text"]');
    const numberInputs = page.locator('input[type="number"]');
    const emailInputs = page.locator('input[type="email"]');
    const buttons = page.locator('button');
    
    console.log(`📝 Text inputs: ${await textInputs.count()}`);
    console.log(`📝 Number inputs: ${await numberInputs.count()}`);
    console.log(`📝 Email inputs: ${await emailInputs.count()}`);
    console.log(`🔘 Buttons: ${await buttons.count()}`);
    
    // Look for specific content
    const socialMediaElements = page.locator('text=Social Media, text=Instagram, text=TikTok, text=Twitter');
    const socialMediaCount = await socialMediaElements.count();
    console.log(`📱 Social media related elements: ${socialMediaCount}`);
    
    // Look for step indicators
    const stepIndicators = page.locator('text=Step, text=Social Media, text=Deal Terms, text=Payor Info');
    const stepCount = await stepIndicators.count();
    console.log(`📋 Step indicators: ${stepCount}`);
    
    // Look for navigation buttons
    const nextButtons = page.locator('button:has-text("Next"), button:has-text("Continue")');
    const backButtons = page.locator('button:has-text("Back"), button:has-text("Previous")');
    const submitButtons = page.locator('button:has-text("Submit"), button[type="submit"]');
    
    console.log(`➡️ Next buttons: ${await nextButtons.count()}`);
    console.log(`⬅️ Back buttons: ${await backButtons.count()}`);
    console.log(`📤 Submit buttons: ${await submitButtons.count()}`);
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/diagnostic-production-social-media.png' });
    console.log('📸 Screenshot saved: diagnostic-production-social-media.png');
    
    // Try to fill some form fields if they exist
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    console.log(`📝 Input fields found: ${inputCount}`);
    
    for (let i = 0; i < Math.min(inputCount, 5); i++) {
      const input = inputs.nth(i);
      const type = await input.getAttribute('type');
      const placeholder = await input.getAttribute('placeholder');
      const name = await input.getAttribute('name');
      const id = await input.getAttribute('id');
      console.log(`📝 Input ${i + 1}: type=${type}, placeholder=${placeholder}, name=${name}, id=${id}`);
    }
    
    // Try to click Next if available
    if (await nextButtons.count() > 0) {
      console.log('🎯 Clicking Next button...');
      await nextButtons.first().click();
      await page.waitForTimeout(3000);
      
      const newUrl = page.url();
      console.log(`📍 URL after clicking Next: ${newUrl}`);
      
      // Take screenshot of next page
      await page.screenshot({ path: 'test-results/diagnostic-production-next-step.png' });
      console.log('📸 Screenshot saved: diagnostic-production-next-step.png');
      
      // Check what's on the next page
      const newPageElements = page.locator('input, textarea, select, button');
      const newElementCount = await newPageElements.count();
      console.log(`📝 Form elements on next page: ${newElementCount}`);
      
      // Look for deal terms specific content
      const dealTermsElements = page.locator('text=Deal Terms, text=nickname, text=description');
      const dealTermsCount = await dealTermsElements.count();
      console.log(`📄 Deal terms related elements: ${dealTermsCount}`);
    }
  });

  test('should fill social media and click continue', async ({ page }) => {
    console.log('🔍 DIAGNOSTIC: Simple social media test...');
    
    // Log into production
    await page.goto('https://fairplay-nil.vercel.app/login');
    await page.waitForLoadState('networkidle');
    
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    await emailInput.fill('test1@test.edu');
    await passwordInput.fill('testuser');
    
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    await page.waitForTimeout(3000);
    
    // Navigate to dashboard and click "Get Started"
    await page.goto('https://fairplay-nil.vercel.app/dashboard');
    await page.waitForLoadState('networkidle');
    
    const getStartedButtons = page.locator('button:has-text("Get Started")');
    await getStartedButtons.first().click();
    await page.waitForTimeout(3000);
    
    console.log(`📍 Current URL: ${page.url()}`);
    
    // Wait for social media form to load
    await page.waitForSelector('input[name*="platforms"]', { timeout: 10000 });
    
    // Fill Instagram handle
    const instagramHandle = page.locator('input[name="platforms.0.handle"]');
    if (await instagramHandle.count() > 0) {
      await instagramHandle.fill('testuser');
      console.log('✅ Filled Instagram handle');
    }
    
    // Fill Instagram followers
    const instagramFollowers = page.locator('input[name="platforms.0.followers"]');
    if (await instagramFollowers.count() > 0) {
      await instagramFollowers.fill('1000');
      console.log('✅ Filled Instagram followers');
    }
    
    // Fill TikTok handle
    const tiktokHandle = page.locator('input[name="platforms.1.handle"]');
    if (await tiktokHandle.count() > 0) {
      await tiktokHandle.fill('testuser_tiktok');
      console.log('✅ Filled TikTok handle');
    }
    
    // Fill TikTok followers
    const tiktokFollowers = page.locator('input[name="platforms.1.followers"]');
    if (await tiktokFollowers.count() > 0) {
      await tiktokFollowers.fill('500');
      console.log('✅ Filled TikTok followers');
    }
    
    // Take screenshot before clicking continue
    await page.screenshot({ path: 'test-results/diagnostic-before-continue.png' });
    console.log('📸 Screenshot before continue saved');
    
    // Click the Continue button
    const continueButton = page.locator('button:has-text("Continue")');
    console.log(`🔘 Continue buttons found: ${await continueButton.count()}`);
    
    if (await continueButton.count() > 0) {
      console.log('🎯 Clicking Continue button...');
      await continueButton.first().click();
      await page.waitForTimeout(5000); // Wait longer for navigation
      
      const newUrl = page.url();
      console.log(`📍 URL after clicking Continue: ${newUrl}`);
      
      // Take screenshot after clicking continue
      await page.screenshot({ path: 'test-results/diagnostic-after-continue.png' });
      console.log('📸 Screenshot after continue saved');
      
      // Check if we moved to the next step
      if (newUrl.includes('/terms/')) {
        console.log('✅ Successfully moved to deal terms step!');
      } else {
        console.log('❌ Still on social media step');
      }
    } else {
      console.log('❌ No Continue button found');
    }
  });

  test('should explore deal terms step', async ({ page }) => {
    console.log('🔍 DIAGNOSTIC: Exploring deal terms step...');
    
    // Log into production
    await page.goto('https://fairplay-nil.vercel.app/login');
    await page.waitForLoadState('networkidle');
    
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    await emailInput.fill('test1@test.edu');
    await passwordInput.fill('testuser');
    
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    await page.waitForTimeout(3000);
    
    // Navigate to dashboard and click "Get Started"
    await page.goto('https://fairplay-nil.vercel.app/dashboard');
    await page.waitForLoadState('networkidle');
    
    const getStartedButtons = page.locator('button:has-text("Get Started")');
    await getStartedButtons.first().click();
    await page.waitForTimeout(3000);
    
    // Fill social media step and continue
    await page.waitForSelector('input[name*="platforms"]', { timeout: 10000 });
    
    const instagramHandle = page.locator('input[name="platforms.0.handle"]');
    const instagramFollowers = page.locator('input[name="platforms.0.followers"]');
    const tiktokHandle = page.locator('input[name="platforms.1.handle"]');
    const tiktokFollowers = page.locator('input[name="platforms.1.followers"]');
    
    await instagramHandle.fill('testuser');
    await instagramFollowers.fill('1000');
    await tiktokHandle.fill('testuser_tiktok');
    await tiktokFollowers.fill('500');
    
    const continueButton = page.locator('button:has-text("Continue")');
    await continueButton.first().click();
    await page.waitForTimeout(3000);
    
    console.log(`📍 Current URL: ${page.url()}`);
    
    // Take screenshot of deal terms step
    await page.screenshot({ path: 'test-results/diagnostic-deal-terms-initial.png' });
    console.log('📸 Screenshot of deal terms step saved');
    
    // Check what fields are available on deal terms step
    const allInputs = page.locator('input, textarea, select');
    const inputCount = await allInputs.count();
    console.log(`📝 Total form elements on deal terms step: ${inputCount}`);
    
    // Log details of each input field
    for (let i = 0; i < inputCount; i++) {
      const input = allInputs.nth(i);
      const type = await input.getAttribute('type');
      const placeholder = await input.getAttribute('placeholder');
      const name = await input.getAttribute('name');
      const id = await input.getAttribute('id');
      const required = await input.getAttribute('required');
      const tagName = await input.evaluate(el => el.tagName.toLowerCase());
      console.log(`📝 ${tagName} ${i + 1}: type=${type}, placeholder=${placeholder}, name=${name}, id=${id}, required=${required}`);
    }
    
    // Try to fill the actual field found (the text input with placeholder)
    const textInput = page.locator('input[placeholder*="Nike Fall Photoshoot"]');
    if (await textInput.count() > 0) {
      await textInput.fill('Test Social Media Deal');
      console.log('✅ Filled deal nickname/title field');
    }
    
    // Try to upload a file if the file input exists
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.count() > 0) {
      console.log('📁 File upload input found (skipping for now)');
    }
    
    // Look for the Continue button (try different text variations)
    const continueButton2 = page.locator('button:has-text("Continue"), button:has-text("Next"), button:has-text("Submit"), button[type="submit"]');
    const continueButtonCount = await continueButton2.count();
    console.log(`➡️ Continue/Next/Submit buttons on deal terms step: ${continueButtonCount}`);
    
    // Check for popups that might be covering the continue button
    const popupElements = page.locator('.popup, .modal, .alert, [role="alert"], .notification, .toast');
    const popupCount = await popupElements.count();
    console.log(`🔔 Popup/modal elements found: ${popupCount}`);
    
    if (popupCount > 0) {
      for (let i = 0; i < popupCount; i++) {
        const popup = popupElements.nth(i);
        const popupText = await popup.textContent();
        console.log(`🔔 Popup ${i + 1}: ${popupText?.substring(0, 100)}`);
        
        // Look for close/dismiss buttons in popup
        const closeButtons = popup.locator('button:has-text("Close"), button:has-text("Dismiss"), button:has-text("×"), button:has-text("X")');
        if (await closeButtons.count() > 0) {
          console.log('🎯 Clicking popup close button...');
          await closeButtons.first().click();
          await page.waitForTimeout(1000);
        }
      }
    }
    
    // Also check for any buttons on the page
    const allButtons = page.locator('button');
    const allButtonCount = await allButtons.count();
    console.log(`🔘 Total buttons on deal terms step: ${allButtonCount}`);
    
    for (let i = 0; i < allButtonCount; i++) {
      const button = allButtons.nth(i);
      const buttonText = await button.textContent();
      const buttonType = await button.getAttribute('type');
      console.log(`🔘 Button ${i + 1}: text="${buttonText}", type=${buttonType}`);
    }
    
    // Take screenshot after handling popup
    await page.screenshot({ path: 'test-results/diagnostic-deal-terms-after-popup.png' });
    console.log('📸 Screenshot after handling popup saved');
    
    if (continueButtonCount > 0) {
      const isEnabled = await continueButton2.first().isEnabled();
      console.log(`➡️ Continue button enabled: ${isEnabled}`);
      
      if (isEnabled) {
        console.log('🎯 Clicking Continue button on deal terms step...');
        await continueButton2.first().click();
        await page.waitForTimeout(3000);
        
        const newUrl = page.url();
        console.log(`📍 URL after clicking Continue on deal terms: ${newUrl}`);
        
        // Take screenshot of next page
        await page.screenshot({ path: 'test-results/diagnostic-deal-terms-next-page.png' });
        console.log('📸 Screenshot of next page after deal terms saved');
        
        // Check what's on the next page
        const newPageTitle = await page.title();
        console.log(`📄 Next page title: ${newPageTitle}`);
        
        const newPageElements = page.locator('input, textarea, select, button');
        const newElementCount = await newPageElements.count();
        console.log(`📝 Form elements on next page: ${newElementCount}`);
        
        // Look for payor info specific content
        const payorElements = page.locator('text=Payor, text=company, text=contact');
        const payorCount = await payorElements.count();
        console.log(`📄 Payor related elements: ${payorCount}`);
        
      } else {
        console.log('❌ Continue button is disabled - form validation failed');
      }
    } else {
      console.log('❌ No Continue button found on deal terms step');
      
      // Check if we need to fill more fields or if there's a different navigation pattern
      const pageContent = await page.textContent('body');
      console.log('📄 Page content (first 500 chars):', pageContent?.substring(0, 500));
    }
  });
}); 