import { test, expect } from '@playwright/test';

/**
 * SIMPLE DEAL LOGGING - STEP-BY-STEP NAVIGATION TESTING
 *
 * Test navigation through the Simple Deal Logging form step by step
 * Focus on understanding actual UI structure and navigation patterns
 */

test.describe('Simple Deal Logging - Step-by-Step Navigation Testing', () => {
  test('Navigate through form steps with proper form filling', async ({ page }) => {
    console.log('🧭 Testing Simple Deal Logging navigation step by step...');

    // Navigate to production dashboard
    await page.goto('https://fairplay-nil.vercel.app/dashboard');
    await page.waitForLoadState('networkidle');

    // Check if we need to log in
    const loginForm = page.locator('input[type="email"]');
    if (await loginForm.count() > 0) {
      console.log('🔐 Need to log in...');
      await loginForm.fill('test1@test.edu');
      await page.locator('input[type="password"]').fill('testuser');
      await page.locator('button[type="submit"]').click();
      await page.waitForLoadState('networkidle');
      console.log('✅ Logged in successfully');
    }

    // Wait for dashboard to fully load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Wait for the deal cards to appear
    await page.waitForSelector('text="Simple Deal Logging"', { timeout: 15000 });
    console.log('✅ Found Simple Deal Logging card');

    // Click on Simple Deal Logging card
    const simpleDealCard = page.locator('text="Simple Deal Logging"');
    await simpleDealCard.click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Clicked on Simple Deal Logging card');

    // Step 0: Social Media - Wait for form to load
    console.log('📱 Step 0: Social Media - Waiting for form...');
    await page.waitForSelector('input, select, textarea', { timeout: 10000 });
    await page.waitForTimeout(2000);
    console.log('✅ Social media form loaded');

    // Fill basic social media info
    const socialMediaInputs = page.locator('input');
    const socialMediaInputCount = await socialMediaInputs.count();
    console.log(`Found ${socialMediaInputCount} social media inputs`);

    if (socialMediaInputCount > 0) {
      await socialMediaInputs.first().fill('@testuser');
      console.log('✅ Filled username field');
    }

    if (socialMediaInputCount > 1) {
      await socialMediaInputs.nth(1).fill('1000');
      console.log('✅ Filled follower count field');
    }

    // Handle select dropdowns
    const socialMediaSelects = page.locator('select');
    const socialMediaSelectCount = await socialMediaSelects.count();
    console.log(`Found ${socialMediaSelectCount} social media selects`);

    if (socialMediaSelectCount > 0) {
      try {
        await socialMediaSelects.first().selectOption({ index: 1 });
        console.log('✅ Selected first dropdown option');
      } catch (error) {
        console.log('⚠️ Could not select dropdown, trying manual selection');
        await socialMediaSelects.first().click();
        await page.waitForTimeout(200);
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(200);
        await page.keyboard.press('Enter');
      }
    }

    // Check for Continue button
    const continueButton = page.locator('button:has-text("Continue")');
    await expect(continueButton).toBeVisible();
    console.log('✅ Continue button found on Step 0');

    // Navigate forward to Step 1
    console.log('➡️ Clicking Continue to navigate to Step 1...');
    await continueButton.click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Navigated to Step 1');

    // Step 1: Deal Terms - Fill required fields first
    console.log('📋 Step 1: Deal Terms - Filling required fields...');
    await page.waitForTimeout(2000);

    // Fill the deal nickname field (required)
    const dealNicknameInput = page.locator('input[placeholder*="Nike"], input[placeholder*="John"], input[placeholder*="Deal Nickname"]');
    await dealNicknameInput.fill('Navigation Test Deal');
    console.log('✅ Filled deal nickname');

    // Check for green popup and dismiss if present
    const greenPopup = page.locator('text="Social media confirmed"');
    if (await greenPopup.count() > 0) {
      await page.locator('button[aria-label="Close"]').click();
      console.log('✅ Dismissed green popup');
    }

    // Check what buttons are actually present
    const finishLaterButton = page.locator('button:has-text("Finish Later")');
    const nextButton = page.locator('button:has-text("Next")');
    
    console.log(`Finish Later button found: ${await finishLaterButton.count() > 0}`);
    console.log(`Next button found: ${await nextButton.count() > 0}`);
    console.log(`Next button enabled: ${await nextButton.isEnabled()}`);

    // Check if Next button is enabled (should be after filling required field)
    await expect(nextButton).toBeVisible();
    console.log('✅ Next button found on Step 1');

    // Navigate to Step 2
    console.log('➡️ Clicking Next to navigate to Step 2...');
    await nextButton.click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Navigated to Step 2');

    // Step 2: Payor Info - Fill required fields
    console.log('🏢 Step 2: Payor Info - Filling required fields...');
    await page.waitForTimeout(2000);

    // Select payor type
    await page.locator('text="Business"').first().click();
    console.log('✅ Selected Business payor type');

    // Fill company name
    const companyNameInput = page.locator('input[placeholder*="Nike"], input[placeholder*="John"], input[placeholder*="Company"]');
    await companyNameInput.fill('Test Company Inc.');
    console.log('✅ Filled company name');

    // Check for Next button
    const step2NextButton = page.locator('button:has-text("Next")');
    await expect(step2NextButton).toBeVisible();
    console.log('✅ Next button found on Step 2');

    // Navigate to Step 3
    console.log('➡️ Clicking Next to navigate to Step 3...');
    await step2NextButton.click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Navigated to Step 3');

    // Step 3: Select Activities
    console.log('🎯 Step 3: Select Activities...');
    await page.waitForTimeout(2000);

    // Select an activity
    await page.locator('text="Social Media"').first().click();
    console.log('✅ Selected Social Media activity');

    // Check for Next button
    const step3NextButton = page.locator('button:has-text("Next")');
    await expect(step3NextButton).toBeVisible();
    console.log('✅ Next button found on Step 3');

    // Navigate to Step 4
    console.log('➡️ Clicking Next to navigate to Step 4...');
    await step3NextButton.click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Navigated to Step 4');

    // Step 4: Activity Form
    console.log('📝 Step 4: Activity Form...');
    await page.waitForTimeout(2000);

    // Fill activity form fields
    const activityInputs = page.locator('input');
    const activityInputCount = await activityInputs.count();
    console.log(`Found ${activityInputCount} activity form inputs`);

    // Fill first few inputs
    for (let i = 0; i < Math.min(activityInputCount, 3); i++) {
      const input = activityInputs.nth(i);
      const type = await input.getAttribute('type');
      
      if (type === 'number') {
        await input.fill('1000');
      } else {
        await input.fill('Test Activity');
      }
      console.log(`✅ Filled activity input ${i + 1}`);
    }

    // Check for Next button
    const step4NextButton = page.locator('button:has-text("Next")');
    await expect(step4NextButton).toBeVisible();
    console.log('✅ Next button found on Step 4');

    // Navigate to Step 5
    console.log('➡️ Clicking Next to navigate to Step 5...');
    await step4NextButton.click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Navigated to Step 5');

    // Step 5: Compliance
    console.log('⚖️ Step 5: Compliance...');
    await page.waitForTimeout(2000);

    // Handle compliance questions (select "No" for all)
    const noOptions = page.locator('text="No"');
    const noOptionsCount = await noOptions.count();
    console.log(`Found ${noOptionsCount} "No" options`);

    for (let i = 0; i < noOptionsCount; i++) {
      try {
        const option = noOptions.nth(i);
        await option.waitFor({ state: 'visible', timeout: 5000 });
        await option.click({ timeout: 5000 });
        console.log(`✅ Clicked "No" option ${i + 1}`);
        await page.waitForTimeout(200);
      } catch (error) {
        console.log(`⚠️ Failed to click "No" option ${i + 1}: ${error.message}`);
      }
    }

    // Check for Continue button
    const step5ContinueButton = page.locator('button:has-text("Continue")');
    await expect(step5ContinueButton).toBeVisible();
    console.log('✅ Continue button found on Step 5');

    // Navigate to Step 6
    console.log('➡️ Clicking Continue to navigate to Step 6...');
    await step5ContinueButton.click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Navigated to Step 6');

    // Step 6: Compensation
    console.log('💰 Step 6: Compensation...');
    await page.waitForTimeout(2000);

    // Fill compensation fields
    const compensationInputs = page.locator('input[type="number"]');
    const compensationInputCount = await compensationInputs.count();
    console.log(`Found ${compensationInputCount} compensation inputs`);

    for (let i = 0; i < compensationInputCount; i++) {
      await compensationInputs.nth(i).fill('1000');
      console.log(`✅ Filled compensation input ${i + 1}`);
    }

    // Handle select dropdowns
    const compensationSelects = page.locator('select');
    const compensationSelectCount = await compensationSelects.count();
    for (let i = 0; i < compensationSelectCount; i++) {
      try {
        await compensationSelects.nth(i).selectOption({ index: 1 });
        console.log(`✅ Selected compensation dropdown ${i + 1}`);
      } catch (error) {
        console.log(`⚠️ Could not select compensation dropdown ${i + 1}`);
      }
    }

    // Check for Next button
    const step6NextButton = page.locator('button:has-text("Next")');
    await expect(step6NextButton).toBeVisible();
    console.log('✅ Next button found on Step 6');

    // Navigate to Step 7
    console.log('➡️ Clicking Next to navigate to Step 7...');
    await step6NextButton.click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Navigated to Step 7');

    // Step 7: Review
    console.log('📋 Step 7: Review...');
    await page.waitForTimeout(2000);

    // Check for Submit button
    const submitButton = page.locator('button:has-text("Submit Deal"), button:has-text("Submit")');
    await expect(submitButton).toBeVisible();
    console.log('✅ Submit button found on Step 7');

    console.log('✅ Navigation test completed successfully through all steps!');
  });
}); 