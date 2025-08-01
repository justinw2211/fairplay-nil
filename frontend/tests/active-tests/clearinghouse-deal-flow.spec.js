import { test, expect } from '@playwright/test';

/**
 * NIL GO CLEARINGHOUSE CHECK - COMPLETE FLOW TESTING
 *
 * This test completes the entire NIL Go Clearinghouse Check flow from start to finish.
 * It tests the complete user journey: Dashboard → NIL Go Clearinghouse Check → All 8 Steps → Submission → Clearinghouse Results
 * 
 * Deal Type: NIL Go Clearinghouse Check
 * Flow: 8 steps (Social Media → Deal Terms → Payor Info → Activities → Activity Form → Compliance → Compensation → Review)
 * End State: Clearinghouse results page
 * Success Rate: TBD (new test)
 * Performance: TBD
 */

test.describe('NIL Go Clearinghouse Check - Complete Flow Testing', () => {

  test('Complete NIL Go Clearinghouse Check Flow - End-to-End', async ({ page }) => {
    console.log('🎯 NIL GO CLEARINGHOUSE CHECK: Testing complete flow from dashboard to clearinghouse results...');

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

    // Step 0: Click on NIL Go Clearinghouse Check card and fill social media
    // Wait for dashboard to fully load (backend needs time to spin up)
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Give backend time to load
    
    // Wait for the deal cards to appear
    await page.waitForSelector('text="NIL Go Clearinghouse Check"', { timeout: 15000 });
    const clearinghouseDealCard = page.locator('text="NIL Go Clearinghouse Check"');
    await clearinghouseDealCard.click();
    await page.waitForLoadState('networkidle');

    // Fill social media form
    await page.waitForSelector('input, select, textarea', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    const socialMediaInputs = page.locator('input');
    const socialMediaInputCount = await socialMediaInputs.count();
    if (socialMediaInputCount > 0) {
      await socialMediaInputs.first().fill('@testuser');
    }
    if (socialMediaInputCount > 1) {
      await socialMediaInputs.nth(1).fill('1000');
    }
    
    const socialMediaSelects = page.locator('select');
    const socialMediaSelectCount = await socialMediaSelects.count();
    if (socialMediaSelectCount > 0) {
      try {
        await socialMediaSelects.first().selectOption({ index: 1 });
      } catch (error) {
        await socialMediaSelects.first().click();
        await page.waitForTimeout(200);
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(200);
        await page.keyboard.press('Enter');
      }
    }
    
    const continueButton = page.locator('button:has-text("Continue")');
    await continueButton.click();
    await page.waitForLoadState('networkidle');

    // Step 1: Fill deal terms
    const dealNicknameInput = page.locator('input[placeholder*="Nike"], input[placeholder*="John"]');
    await dealNicknameInput.fill('Test Clearinghouse Deal');
    
    const greenPopup = page.locator('text="Social media confirmed"');
    if (await greenPopup.count() > 0) {
      await page.locator('button[aria-label="Close"]').click();
    }
    
    const nextButton = page.locator('button:has-text("Next")');
    await nextButton.click();
    await page.waitForLoadState('networkidle');

    // Step 2: Fill payor info
    await page.locator('text="Business"').first().click();
    await page.locator('input[placeholder*="Nike"], input[placeholder*="John"]').fill('Test Company Inc.');
    await page.locator('button:has-text("Next")').click();
    await page.waitForLoadState('networkidle');

    // Step 3: Select activities
    console.log('📋 Selecting activities...');
    
    // Wait for activities to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Select Social Media activity
    const socialMediaCheckbox = page.locator('text="Social Media"').first();
    await socialMediaCheckbox.waitFor({ state: 'visible', timeout: 10000 });
    await socialMediaCheckbox.click();
    console.log('✅ Selected Social Media activity');
    
    // Check if Next button is enabled
    const nextButtonStep3 = page.locator('button:has-text("Next")');
    const isNextButtonStep3Enabled = await nextButtonStep3.isEnabled();
    console.log(`🔘 Next button enabled: ${isNextButtonStep3Enabled}`);
    
    if (isNextButtonStep3Enabled) {
      await nextButtonStep3.click();
      console.log('✅ Clicked Next button, waiting for navigation...');
      await page.waitForLoadState('networkidle');
      console.log('✅ Successfully navigated to Activity Form step');
    } else {
      console.log('❌ Next button not enabled on Activities step');
      await page.screenshot({ path: 'test-results/clearinghouse-flow-activities-no-next.png' });
      throw new Error('Next button not enabled on Activities step');
    }

    // Step 4: Fill social media activity form
    console.log('📱 Filling social media activity form...');
    
    // Wait for the activity form to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Look for Instagram option or any social media platform
    const instagramOption = page.locator('text="Instagram"');
    if (await instagramOption.count() > 0) {
      await instagramOption.first().click();
      console.log('✅ Selected Instagram platform');
    } else {
      // If Instagram is not available, try to select any available platform
      const platformOptions = page.locator('text="TikTok", text="Twitter", text="YouTube", text="Facebook"');
      if (await platformOptions.count() > 0) {
        await platformOptions.first().click();
        console.log('✅ Selected alternative platform');
      } else {
        console.log('⚠️ No social media platforms found, proceeding without selection');
      }
    }
    const activityButtons = page.locator('button');
    if (await activityButtons.count() >= 3) {
      await activityButtons.nth(2).click();
    }
    await page.locator('button:has-text("Continue")').click();
    await page.waitForLoadState('networkidle');

    // Step 5: Fill compliance questions
    console.log('📝 Filling compliance questions...');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Answer the compliance questions using the exact working pattern from Step 5
    const noOptions = page.locator('text="No"');
    const noOptionsCount = await noOptions.count();
    console.log(`🔢 "No" options found: ${noOptionsCount}`);

    // Click all "No" options systematically
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

    // Check if Continue button is enabled
    const continueButtonStep5 = page.locator('button:has-text("Continue")');
    const isContinueButtonEnabled = await continueButtonStep5.isEnabled();
    console.log(`🔘 Continue button enabled: ${isContinueButtonEnabled}`);

    if (isContinueButtonEnabled) {
      // Click Continue button
      await continueButtonStep5.click();
      console.log('✅ Clicked Continue button, waiting for navigation...');
      await page.waitForTimeout(1000);

      // Verify we moved to next step (Compensation)
      const newUrl = page.url();
      console.log(`📍 URL after Continue: ${newUrl}`);
      expect(newUrl).toMatch(/\/add\/deal\/compensation\/\d+/);
      console.log('✅ Successfully navigated to Compensation step');
    } else {
      console.log('❌ Continue button not found or not enabled');
      await page.screenshot({ path: 'test-results/clearinghouse-flow-compliance-no-continue.png' });
      throw new Error('Continue button not found or not enabled on Compliance step');
    }

    // Step 6: Fill compensation
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
      await descriptionInput.fill('Test clearinghouse compensation description');
      console.log('✅ Filled description field');
    }

    // Check if Next button is enabled
    const nextButtonCompensation = page.locator('button:has-text("Next")');
    const isNextButtonEnabled = await nextButtonCompensation.isEnabled();
    console.log(`🔘 Next button enabled: ${isNextButtonEnabled}`);

    // Initialize finalNextButtonEnabled
    let finalNextButtonEnabled = isNextButtonEnabled;

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
      finalNextButtonEnabled = await nextButtonCompensation.isEnabled();
      console.log(`🔘 Next button enabled after additional fields: ${finalNextButtonEnabled}`);
    }

    if (isNextButtonEnabled || finalNextButtonEnabled) {
      // Click Next button
      await nextButtonCompensation.click();
      console.log('✅ Clicked Next button, waiting for navigation...');
      await page.waitForTimeout(1000);

      // Verify we moved to next step (Deal Type)
      const newUrl = page.url();
      console.log(`📍 URL after Next: ${newUrl}`);
      expect(newUrl).toMatch(/\/add\/deal\/deal-type\/\d+/);
      console.log('✅ Successfully navigated to Deal Type step');
    } else {
      console.log('❌ Next button not found or not enabled');
      await page.screenshot({ path: 'test-results/clearinghouse-flow-compensation-no-next.png' });
      throw new Error('Next button not found or not enabled on Compensation step');
    }

    // Step 7: Deal Type Classification
    console.log('📝 Filling deal type classification...');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Select "Prospective deal" for NIL Go Clearinghouse
    const prospectiveOption = page.locator('text="Prospective deal"');
    await prospectiveOption.waitFor({ state: 'visible', timeout: 10000 });
    await prospectiveOption.click();
    console.log('✅ Selected "Prospective deal" option');

    // Click Next button
    const nextButtonDealType = page.locator('button:has-text("Next")');
    await nextButtonDealType.waitFor({ state: 'visible', timeout: 10000 });
    await nextButtonDealType.click();
    console.log('✅ Clicked Next button on Deal Type step');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Verify we moved to Review step
    const dealTypeUrl = page.url();
    console.log(`📍 URL after Deal Type: ${dealTypeUrl}`);
    expect(dealTypeUrl).toMatch(/\/add\/deal\/review\/\d+/);
    console.log('✅ Successfully navigated to Review step');

    // Step 8: Review and submit deal
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);
    expect(currentUrl).toMatch(/\/add\/deal\/review\/\d+/);

    // Review the deal information
    console.log('📋 Reviewing deal information...');
    
    // Look for submit button
    const submitButton = page.locator('button:has-text("Submit Deal"), button:has-text("Submit")');
    await submitButton.waitFor({ state: 'visible', timeout: 10000 });
    console.log('✅ Found submit button');
    
    // Click submit button
    await submitButton.click();
    console.log('✅ Clicked submit button');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Give time for submission

    // Verify we're on the clearinghouse review page
    const finalUrl = page.url();
    console.log(`📍 Final URL: ${finalUrl}`);
    expect(finalUrl).toMatch(/\/clearinghouse-wizard\/\d+/);
    console.log('✅ Successfully submitted deal and reached clearinghouse review page');

    // Step 8: Run NIL Go Prediction
    console.log('⚡ Running NIL Go Prediction...');
    
    // Look for the "Run NIL Go Prediction" button
    const runPredictionButton = page.locator('button:has-text("Run NIL Go Prediction")');
    await runPredictionButton.waitFor({ state: 'visible', timeout: 10000 });
    console.log('✅ Found "Run NIL Go Prediction" button');
    
    // Click the prediction button
    await runPredictionButton.click();
    console.log('✅ Clicked "Run NIL Go Prediction" button');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Give time for prediction to run

    // Verify we're on the clearinghouse results page
    const predictionUrl = page.url();
    console.log(`📍 Prediction URL: ${predictionUrl}`);
    expect(predictionUrl).toMatch(/\/clearinghouse-result\/\d+/);
    console.log('✅ Successfully completed NIL Go prediction and reached clearinghouse results page');

    // Step 9: Return to Dashboard
    console.log('🏠 Returning to dashboard...');
    
    // Look for the "Return to Dashboard" button
    const returnToDashboardButton = page.locator('button:has-text("Return to Dashboard")');
    await returnToDashboardButton.waitFor({ state: 'visible', timeout: 10000 });
    console.log('✅ Found "Return to Dashboard" button');
    
    // Click the dashboard button
    await returnToDashboardButton.click();
    console.log('✅ Clicked "Return to Dashboard" button');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Give time for navigation

    // Verify we're now on the student-athlete dashboard
    const dashboardUrl = page.url();
    console.log(`📍 Dashboard URL: ${dashboardUrl}`);
    expect(dashboardUrl).toMatch(/\/dashboard/);
    console.log('✅ Successfully navigated to student-athlete dashboard');

    // Take final screenshot for verification
    await page.screenshot({ path: 'test-results/clearinghouse-flow-dashboard.png' });
    console.log('📸 Final screenshot saved: clearinghouse-flow-dashboard.png');
    console.log('🎉 NIL GO CLEARINGHOUSE CHECK COMPLETE: Successfully completed entire Clearinghouse flow from dashboard to dashboard!');
  });
}); 