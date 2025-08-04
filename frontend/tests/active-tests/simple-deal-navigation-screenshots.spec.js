import { test, expect } from '@playwright/test';

/**
 * SIMPLE DEAL LOGGING - SCREENSHOT CAPTURE TEST -- WORKING *
 *
 * Based on simple-deal-logging-flow.spec.js but with screenshot capture
 * at each step to document the UI flow and navigation patterns
 */

test.describe('Simple Deal Logging - Screenshot Capture Test', () => {
  test('Capture screenshots of each step in the deal wizard', async ({ page }) => {
    console.log('📸 Starting screenshot capture test for Simple Deal Logging...');

    // Navigate to production dashboard
    await page.goto('https://fairplay-nil.vercel.app/dashboard');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/01-dashboard-initial.png', fullPage: true });
    console.log('📸 Screenshot: Initial dashboard');

    // Check if we need to log in
    const loginForm = page.locator('input[type="email"]');
    if (await loginForm.count() > 0) {
      console.log('🔐 Need to log in...');
      await loginForm.fill('test1@test.edu');
      await page.locator('input[type="password"]').fill('testuser');
      await page.locator('button[type="submit"]').click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/02-dashboard-after-login.png', fullPage: true });
      console.log('📸 Screenshot: Dashboard after login');
    }

    // Wait for dashboard to fully load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Wait for the deal cards to appear
    await page.waitForSelector('text="Simple Deal Logging"', { timeout: 15000 });
    console.log('✅ Found Simple Deal Logging card');
    await page.screenshot({ path: 'test-results/03-deal-cards-visible.png', fullPage: true });
    console.log('📸 Screenshot: Deal cards visible');

    // Click on Simple Deal Logging card
    const simpleDealCard = page.locator('text="Simple Deal Logging"');
    await simpleDealCard.click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Clicked on Simple Deal Logging card');

    // Step 0: Social Media - Wait for form to load
    console.log('📱 Step 0: Social Media - Waiting for form...');
    await page.waitForSelector('input, select, textarea', { timeout: 10000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/04-step-0-social-media-empty.png', fullPage: true });
    console.log('📸 Screenshot: Step 0 - Social Media form (empty)');

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
    await page.screenshot({ path: 'test-results/05-step-0-social-media-filled.png', fullPage: true });
    console.log('📸 Screenshot: Step 0 - Social Media form (filled)');

    // Navigate forward to Step 1
    console.log('➡️ Clicking Continue to navigate to Step 1...');
    await continueButton.click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Navigated to Step 1');

    // Step 1: Deal Terms - Fill required fields first
    console.log('📋 Step 1: Deal Terms - Filling required fields...');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/06-step-1-deal-terms-empty.png', fullPage: true });
    console.log('📸 Screenshot: Step 1 - Deal Terms form (empty)');

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
    await page.screenshot({ path: 'test-results/07-step-1-deal-terms-filled.png', fullPage: true });
    console.log('📸 Screenshot: Step 1 - Deal Terms form (filled)');

    // Navigate to Step 2
    console.log('➡️ Clicking Next to navigate to Step 2...');
    await nextButton.click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Navigated to Step 2');

    // Step 2: Payor Info - Fill required fields
    console.log('🏢 Step 2: Payor Info - Filling required fields...');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/08-step-2-payor-info-empty.png', fullPage: true });
    console.log('📸 Screenshot: Step 2 - Payor Info form (empty)');

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
    await page.screenshot({ path: 'test-results/09-step-2-payor-info-filled.png', fullPage: true });
    console.log('📸 Screenshot: Step 2 - Payor Info form (filled)');

    // Navigate to Step 3
    console.log('➡️ Clicking Next to navigate to Step 3...');
    await step2NextButton.click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Navigated to Step 3');

    // Step 3: Select Activities
    console.log('🎯 Step 3: Select Activities...');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/10-step-3-select-activities-empty.png', fullPage: true });
    console.log('📸 Screenshot: Step 3 - Select Activities (empty)');

    // Select an activity
    await page.locator('text="Social Media"').first().click();
    console.log('✅ Selected Social Media activity');

    // Check for Next button
    const step3NextButton = page.locator('button:has-text("Next")');
    await expect(step3NextButton).toBeVisible();
    console.log('✅ Next button found on Step 3');
    await page.screenshot({ path: 'test-results/11-step-3-select-activities-selected.png', fullPage: true });
    console.log('📸 Screenshot: Step 3 - Select Activities (selected)');

    // Navigate to Step 4
    console.log('➡️ Clicking Next to navigate to Step 4...');
    await step3NextButton.click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Navigated to Step 4');

    // Step 4: Activity Form (Social Media Platform Selection)
    console.log('📝 Step 4: Activity Form (Social Media Platform Selection)...');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/12-step-4-activity-form-empty.png', fullPage: true });
    console.log('📸 Screenshot: Step 4 - Activity Form (empty)');

    // Fill social media activity form (using working logic from simple-deal-logging-flow.spec.js)
    await page.locator('text="Instagram"').first().click();
    console.log('✅ Selected Instagram platform');
    
    const activityButtons = page.locator('button');
    if (await activityButtons.count() >= 3) {
      await activityButtons.nth(2).click();
      console.log('✅ Clicked additional activity button');
    }
    
    await page.screenshot({ path: 'test-results/13-step-4-activity-form-filled.png', fullPage: true });
    console.log('📸 Screenshot: Step 4 - Activity Form (filled)');

    // Check for Continue button (not Next button)
    const step4ContinueButton = page.locator('button:has-text("Continue")');
    await expect(step4ContinueButton).toBeVisible();
    console.log('✅ Continue button found on Step 4');

    // Navigate to Step 5
    console.log('➡️ Clicking Continue to navigate to Step 5...');
    await step4ContinueButton.click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Navigated to Step 5');

    // Step 5: Compliance
    console.log('⚖️ Step 5: Compliance...');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/14-step-5-compliance-empty.png', fullPage: true });
    console.log('📸 Screenshot: Step 5 - Compliance form (empty)');

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
    await page.screenshot({ path: 'test-results/15-step-5-compliance-filled.png', fullPage: true });
    console.log('📸 Screenshot: Step 5 - Compliance form (filled)');

    // Navigate to Step 6
    console.log('➡️ Clicking Continue to navigate to Step 6...');
    await step5ContinueButton.click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Navigated to Step 6');

    // Step 6: Compensation
    console.log('💰 Step 6: Compensation...');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/16-step-6-compensation-empty.png', fullPage: true });
    console.log('📸 Screenshot: Step 6 - Compensation form (empty)');

    // Fill compensation fields using working logic from comprehensive guide
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Wait for any form elements to be visible
    await page.waitForSelector('input, select, textarea', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // Fill the first input (likely amount)
    const compensationInputs = page.locator('input');
    const compensationInputCount = await compensationInputs.count();
    console.log(`🔢 Found ${compensationInputCount} input fields`);
    
    if (compensationInputCount > 0) {
      await compensationInputs.first().fill('1000');
      console.log('✅ Filled first input field with 1000');
    }
    
    // Try to select from dropdown
    const compensationSelects = page.locator('select');
    const compensationSelectCount = await compensationSelects.count();
    console.log(`🔢 Found ${compensationSelectCount} select fields`);
    
    if (compensationSelectCount > 0) {
      try {
        await compensationSelects.first().selectOption({ index: 1 });
        console.log('✅ Selected first option from dropdown');
      } catch (error) {
        console.log('⚠️ Could not select from dropdown, trying keyboard navigation...');
        await compensationSelects.first().click();
        await page.waitForTimeout(200);
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(200);
        await page.keyboard.press('Enter');
        console.log('✅ Selected option using keyboard');
      }
    }

    // Fill description if needed
    const descriptionInput = page.locator('textarea').first();
    if (await descriptionInput.count() > 0) {
      await descriptionInput.fill('Test compensation description');
      console.log('✅ Filled description field');
    }

    // Check if Next button is enabled
    const nextButtonCompensation = page.locator('button:has-text("Next")');
    const isNextButtonEnabled = await nextButtonCompensation.isEnabled();
    console.log(`🔘 Next button enabled: ${isNextButtonEnabled}`);

    // If still not enabled, try to fill additional fields
    if (!isNextButtonEnabled) {
      console.log('🔍 Form not valid, checking for additional required fields...');
      
      // Look for additional inputs
      const additionalInputs = page.locator('input');
      const additionalInputCount = await additionalInputs.count();
      console.log(`🔢 Total inputs found: ${additionalInputCount}`);
      
      // Try filling any empty inputs
      for (let i = 0; i < additionalInputCount; i++) {
        const input = additionalInputs.nth(i);
        const value = await input.inputValue();
        if (!value && await input.isVisible()) {
          await input.fill('100');
          console.log(`✅ Filled input ${i + 1}`);
        }
      }
      
      // Check again
      const finalNextButtonEnabled = await nextButtonCompensation.isEnabled();
      console.log(`🔘 Next button enabled after additional fields: ${finalNextButtonEnabled}`);
    }

    await page.screenshot({ path: 'test-results/17-step-6-compensation-filled.png', fullPage: true });
    console.log('📸 Screenshot: Step 6 - Compensation form (filled)');

    // Check for Next button
    const step6NextButton = page.locator('button:has-text("Next")');
    await expect(step6NextButton).toBeVisible();
    console.log('✅ Next button found on Step 6');

    // Navigate to Step 7
    console.log('➡️ Clicking Next to navigate to Step 7...');
    await step6NextButton.click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Navigated to Step 7');

    // Step 7: Deal Type Classification
    console.log('📋 Step 7: Deal Type Classification...');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/18-step-7-deal-type.png', fullPage: true });
    console.log('📸 Screenshot: Step 7 - Deal Type Classification');

    // Select deal type option
    let testDemoOption = page.locator('text="Test/demo response (fictional data)"');
    if (await testDemoOption.count() === 0) {
      console.log('⚠️ Full text not found, trying partial text...');
      testDemoOption = page.locator('text="Test/demo response"');
    }
    if (await testDemoOption.count() === 0) {
      console.log('⚠️ Partial text not found, trying radio button...');
      testDemoOption = page.locator('input[type="radio"]').first();
    }
    
    await testDemoOption.waitFor({ state: 'visible', timeout: 10000 });
    await testDemoOption.click();
    console.log('✅ Selected "Test/demo response" option');

    // Check for Next button
    const step7NextButton = page.locator('button:has-text("Next")');
    await expect(step7NextButton).toBeVisible();
    console.log('✅ Next button found on Step 7');
    await page.screenshot({ path: 'test-results/19-step-7-deal-type-filled.png', fullPage: true });
    console.log('📸 Screenshot: Step 7 - Deal Type Classification (filled)');

    // Navigate to Step 8
    console.log('➡️ Clicking Next to navigate to Step 8...');
    await step7NextButton.click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Navigated to Step 8');

    // Step 8: Review
    console.log('📋 Step 8: Review...');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/20-step-8-review.png', fullPage: true });
    console.log('📸 Screenshot: Step 8 - Review page');

    // Check for Submit button
    const submitButton = page.locator('button:has-text("Submit Deal"), button:has-text("Submit")');
    await expect(submitButton).toBeVisible();
    console.log('✅ Submit button found on Step 8');

    console.log('✅ Screenshot capture test completed successfully!');
    console.log('📸 All screenshots saved to test-results/ directory');
  });
}); 