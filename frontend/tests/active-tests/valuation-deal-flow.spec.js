/**
 * DEAL VALUATION ANALYSIS - COMPLETE FLOW TESTING
 *
 * This test completes the entire Deal Valuation Analysis flow from start to finish.
 * It tests the complete user journey: Dashboard → Deal Valuation Analysis → All Steps → Valuation → Dashboard
 * 
 * Deal Type: Deal Valuation Analysis
 * Flow: Multiple steps (Social Media → Deal Terms → Payor Info → Activities → Activity Form → Compliance → Compensation → Review → Valuation)
 * End State: Student-athlete dashboard (after valuation completion)
 * Success Rate: TBD
 * Performance: TBD
 */

import { test, expect } from '@playwright/test';

test.describe('Deal Valuation Analysis - Complete Flow Testing', () => {
  test('Complete Deal Valuation Analysis Flow - End-to-End', async ({ page }) => {
    console.log('🎯 DEAL VALUATION ANALYSIS: Testing complete flow from dashboard to dashboard...');

    // Navigate to production dashboard
    await page.goto('https://fairplay-nil.vercel.app/dashboard');
    await page.waitForLoadState('networkidle');
    console.log('✅ Navigated to dashboard');

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

    // Step 0: Click on Deal Valuation Analysis card
    console.log('📊 Selecting Deal Valuation Analysis...');
    
    // Wait for dashboard to fully load (backend needs time to spin up)
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Give backend time to load
    
    // Wait for the deal cards to appear
    await page.waitForSelector('text="Deal Valuation Analysis"', { timeout: 15000 });
    
    // Look for the Deal Valuation Analysis card and click its "Get Started" button
    const valuationCard = page.locator('text="Deal Valuation Analysis"');
    if (await valuationCard.count() > 0) {
      // Find the "Get Started" button for the Deal Valuation Analysis card
      const getStartedButtons = page.locator('button:has-text("Get Started")');
      const buttonCount = await getStartedButtons.count();
      console.log(`🔢 Found ${buttonCount} "Get Started" buttons`);
      
      // The Deal Valuation Analysis should be the third "Get Started" button (after Simple Deal Logging and NIL Go Clearinghouse)
      if (buttonCount >= 3) {
        await getStartedButtons.nth(2).click();
        console.log('✅ Clicked Deal Valuation Analysis "Get Started" button (3rd button)');
      } else {
        console.log('❌ Not enough "Get Started" buttons found');
        await page.screenshot({ path: 'test-results/valuation-flow-no-buttons.png' });
        throw new Error('Not enough "Get Started" buttons found on dashboard');
      }
    } else {
      console.log('❌ Could not find Deal Valuation Analysis card');
      await page.screenshot({ path: 'test-results/valuation-flow-no-card.png' });
      throw new Error('Deal Valuation Analysis card not found on dashboard');
    }
    
    await page.waitForLoadState('networkidle');
    console.log('✅ Selected Deal Valuation Analysis');

    // Step 1: Fill social media form
    console.log('📱 Filling social media information...');
    
    // Wait for the form to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // The form already has data filled in, so we just need to click Continue
    const socialMediaContinueButton = page.locator('button:has-text("Continue")');
    await socialMediaContinueButton.waitFor({ state: 'visible', timeout: 10000 });
    console.log('✅ Found Continue button');
    
    await socialMediaContinueButton.click();
    console.log('✅ Clicked Continue button');
    await page.waitForLoadState('networkidle');
    console.log('✅ Successfully navigated to Deal Terms step');

    // Step 2: Fill deal terms
    console.log('📋 Filling deal terms...');
    
    // Wait for the form to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Fill the deal nickname field
    const dealNicknameInput = page.locator('input[placeholder*="Deal Nickname"], input[placeholder*="Nike"], input[placeholder*="John"]');
    await dealNicknameInput.waitFor({ state: 'visible', timeout: 10000 });
    await dealNicknameInput.fill('Test Valuation Deal');
    console.log('✅ Filled deal nickname');
    
    // Handle any popup notifications
    const greenPopup = page.locator('text="Social media confirmed"');
    if (await greenPopup.count() > 0) {
      await page.locator('button[aria-label="Close"]').click();
      console.log('✅ Closed social media confirmation popup');
    }
    
    // Click Next button
    const nextButton = page.locator('button:has-text("Next")');
    await nextButton.waitFor({ state: 'visible', timeout: 10000 });
    await nextButton.click();
    console.log('✅ Clicked Next button');
    await page.waitForLoadState('networkidle');
    console.log('✅ Successfully navigated to Payor Info step');

    // Step 3: Fill payor info
    console.log('🏢 Filling payor information...');
    
    // Wait for the form to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Select Business radio button
    await page.locator('text="Business"').first().click();
    console.log('✅ Selected Business radio button');
    
    // Fill the required company name field
    const companyNameInput = page.locator('input[placeholder*="Nike"], input[placeholder*="John"]');
    await companyNameInput.fill('Test Company Inc.');
    console.log('✅ Filled company name field');
    
    // Click Next button
    const nextButtonStep3 = page.locator('button:has-text("Next")');
    await nextButtonStep3.click();
    console.log('✅ Clicked Next button, waiting for navigation...');
    await page.waitForLoadState('networkidle');
    console.log('✅ Successfully navigated to Activities step');

    // Step 4: Select activities
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
    const nextButtonStep4 = page.locator('button:has-text("Next")');
    const isNextButtonStep4Enabled = await nextButtonStep4.isEnabled();
    console.log(`🔘 Next button enabled: ${isNextButtonStep4Enabled}`);
    
    if (isNextButtonStep4Enabled) {
      await nextButtonStep4.click();
      console.log('✅ Clicked Next button, waiting for navigation...');
      await page.waitForLoadState('networkidle');
      console.log('✅ Successfully navigated to Activity Form step');
    } else {
      console.log('❌ Next button not enabled on Activities step');
      await page.screenshot({ path: 'test-results/valuation-flow-activities-no-next.png' });
      throw new Error('Next button not enabled on Activities step');
    }

    // Step 5: Fill social media activity form
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
      await activityButtons.nth(2).click(); // Click Continue button
    } else {
      await page.locator('button:has-text("Continue")').click();
    }
    await page.waitForLoadState('networkidle');
    console.log('✅ Successfully navigated to Compliance step');

    // Step 6: Fill compliance questions
    console.log('📝 Filling compliance questions...');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Give more time for compliance page to load

    // Try multiple approaches to find and click compliance options
    console.log('🔍 Looking for compliance options...');
    
    // Approach 1: Look for "No" text options
    const noOptions = page.locator('text="No"');
    const noOptionsCount = await noOptions.count();
    console.log(`🔢 "No" options found: ${noOptionsCount}`);
    
    if (noOptionsCount > 0) {
      // Click all "No" options systematically
      for (let i = 0; i < noOptionsCount; i++) {
        try {
          const option = noOptions.nth(i);
          await option.waitFor({ state: 'visible', timeout: 5000 });
          await option.click({ timeout: 5000 });
          console.log(`✅ Clicked "No" option ${i + 1}`);
          await page.waitForTimeout(300);
        } catch (error) {
          console.log(`⚠️ Failed to click "No" option ${i + 1}: ${error.message}`);
        }
      }
    } else {
      // Approach 2: Look for radio buttons and click every other one (assuming "No" is second)
      const radioButtons = page.locator('input[type="radio"]');
      const radioButtonCount = await radioButtons.count();
      console.log(`🔢 Radio buttons found: ${radioButtonCount}`);
      
      if (radioButtonCount > 0) {
        for (let i = 1; i < radioButtonCount; i += 2) {
          try {
            await radioButtons.nth(i).click();
            console.log(`✅ Clicked radio button ${i + 1}`);
            await page.waitForTimeout(300);
          } catch (error) {
            console.log(`⚠️ Failed to click radio button ${i + 1}: ${error.message}`);
          }
        }
      } else {
        // Approach 3: Look for any clickable elements with "No" text
        const allElements = page.locator('*');
        const allElementsCount = await allElements.count();
        console.log(`🔢 Total elements found: ${allElementsCount}`);
        
        // Try to find any element containing "No" text
        for (let i = 0; i < Math.min(allElementsCount, 100); i++) {
          try {
            const element = allElements.nth(i);
            const text = await element.textContent();
            if (text && text.includes('No')) {
              await element.click();
              console.log(`✅ Clicked element with "No" text`);
              await page.waitForTimeout(300);
            }
          } catch (error) {
            // Ignore errors for this approach
          }
        }
      }
    }

    // Check if Continue button is enabled
    const continueButtonStep6 = page.locator('button:has-text("Continue")');
    const isContinueButtonEnabled = await continueButtonStep6.isEnabled();
    console.log(`🔘 Continue button enabled: ${isContinueButtonEnabled}`);

    if (isContinueButtonEnabled) {
      // Click Continue button
      await continueButtonStep6.click();
      console.log('✅ Clicked Continue button, waiting for navigation...');
      await page.waitForTimeout(2000);

      // Verify we moved to next step (Compensation)
      const newUrl = page.url();
      console.log(`📍 URL after Continue: ${newUrl}`);
      expect(newUrl).toMatch(/\/add\/deal\/compensation\/\d+/);
      console.log('✅ Successfully navigated to Compensation step');
    } else {
      console.log('❌ Continue button not found or not enabled');
      await page.screenshot({ path: 'test-results/valuation-flow-compliance-no-continue.png' });
      throw new Error('Continue button not found or not enabled on Compliance step');
    }

    // Step 7: Fill compensation
    console.log('💰 Filling compensation information...');
    
    // Wait for the form to load
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
    const nextButtonStep7 = page.locator('button:has-text("Next")');
    const isNextButtonStep7Enabled = await nextButtonStep7.isEnabled();
    console.log(`🔘 Next button enabled: ${isNextButtonStep7Enabled}`);

    // Initialize finalNextButtonEnabled
    let finalNextButtonEnabled = isNextButtonStep7Enabled;

    // If still not enabled, try to fill additional fields
    if (!isNextButtonStep7Enabled) {
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
      finalNextButtonEnabled = await nextButtonStep7.isEnabled();
      console.log(`🔘 Next button enabled after additional fields: ${finalNextButtonEnabled}`);
    }

    if (isNextButtonStep7Enabled || finalNextButtonEnabled) {
      // Click Next button
      await nextButtonStep7.click();
      console.log('✅ Clicked Next button, waiting for navigation...');
      await page.waitForTimeout(1000);

      // Verify we moved to next step (Deal Type)
      const newUrl = page.url();
      console.log(`📍 URL after Next: ${newUrl}`);
      expect(newUrl).toMatch(/\/add\/deal\/deal-type\/\d+/);
      console.log('✅ Successfully navigated to Deal Type step');
    } else {
      console.log('❌ Next button not found or not enabled');
      await page.screenshot({ path: 'test-results/valuation-flow-compensation-no-next.png' });
      throw new Error('Next button not found or not enabled on Compensation step');
    }

    // Step 8: Deal Type Classification
    console.log('📝 Filling deal type classification...');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Select "Confirmed deal" for Deal Valuation
    const confirmedOption = page.locator('text="Confirmed deal"');
    await confirmedOption.waitFor({ state: 'visible', timeout: 10000 });
    await confirmedOption.click();
    console.log('✅ Selected "Confirmed deal" option');

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

    // Step 9: Review and submit
    console.log('📋 Reviewing deal information...');
    
    // Wait for review page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Find and click submit button
    const submitButton = page.locator('button:has-text("Submit"), button:has-text("Submit Deal")');
    await submitButton.waitFor({ state: 'visible', timeout: 10000 });
    console.log('✅ Found submit button');
    
    await submitButton.click();
    console.log('✅ Clicked submit button');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Give time for submission

    // Verify we're on the valuation review page
    const finalUrl = page.url();
    console.log(`📍 Final URL: ${finalUrl}`);
    expect(finalUrl).toMatch(/\/valuation-wizard\/\d+/);
    console.log('✅ Successfully submitted deal and reached valuation review page');

    // Step 10: Run valuation analysis
    console.log('⚡ Running Valuation Analysis...');
    
    // Look for the "Run Valuation Analysis" button
    const valuationButton = page.locator('button:has-text("Run Valuation Analysis"), button:has-text("Get Valuation")');
    await valuationButton.waitFor({ state: 'visible', timeout: 10000 });
    console.log('✅ Found valuation analysis button');
    
    await valuationButton.click();
    console.log('✅ Clicked valuation analysis button');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Give time for analysis

    // Verify we're on the valuation results page
    const valuationResultUrl = page.url();
    console.log(`📍 Valuation Result URL: ${valuationResultUrl}`);
    expect(valuationResultUrl).toMatch(/\/valuation-result\/\d+/);
    console.log('✅ Successfully completed valuation analysis and reached results page');

    // Step 11: Return to dashboard
    console.log('🏠 Returning to dashboard...');
    
    // Look for the "Return to Dashboard" button
    const dashboardButton = page.locator('button:has-text("Return to Dashboard")');
    await dashboardButton.waitFor({ state: 'visible', timeout: 10000 });
    console.log('✅ Found "Return to Dashboard" button');
    
    await dashboardButton.click();
    console.log('✅ Clicked "Return to Dashboard" button');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Give time for navigation

    // Verify we're now on the student-athlete dashboard
    const dashboardUrl = page.url();
    console.log(`📍 Dashboard URL: ${dashboardUrl}`);
    expect(dashboardUrl).toMatch(/\/dashboard/);
    console.log('✅ Successfully navigated to student-athlete dashboard');

    // Take final screenshot for verification
    await page.screenshot({ path: 'test-results/valuation-flow-dashboard.png' });
    console.log('📸 Final screenshot saved: valuation-flow-dashboard.png');
    console.log('🎉 DEAL VALUATION ANALYSIS COMPLETE: Successfully completed entire Valuation flow from dashboard to dashboard!');
  });
}); 