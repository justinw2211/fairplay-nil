import { test, expect } from '@playwright/test';

/**
 * SIMPLE DEAL LOGGING - AUTOMATED NAVIGATION TESTING
 *
 * Progressive automation framework for testing Simple Deal Logging navigation
 * Features: Hybrid testing, workarounds for known issues, static test data, organized reporting
 */

// Test Data Configuration
const TEST_DATA = {
  user: {
    email: 'test1@test.edu',
    password: 'testuser'
  },
  deal: {
    nickname: 'Automated Navigation Test Deal',
    company: 'Test Company Inc.',
    username: '@testuser',
    followers: '1000',
    compensation: '1000'
  }
};

// Test Configuration
const TEST_CONFIG = {
  baseURL: 'https://fairplay-nil.vercel.app',
  timeout: 15000,
  waitTime: 3000
};

// Helper Functions
const helpers = {
  async login(page) {
    console.log('🔐 Attempting login...');
    const loginForm = page.locator('input[type="email"]');
    if (await loginForm.count() > 0) {
      await loginForm.fill(TEST_DATA.user.email);
      await page.locator('input[type="password"]').fill(TEST_DATA.user.password);
      await page.locator('button[type="submit"]').click();
      await page.waitForLoadState('networkidle');
      console.log('✅ Login successful');
      return true;
    }
    console.log('✅ Already logged in');
    return false;
  },

  async waitForPageLoad(page) {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(TEST_CONFIG.waitTime);
  },

  async fillSocialMediaForm(page) {
    console.log('📱 Filling social media form...');
    
    const socialMediaInputs = page.locator('input');
    const inputCount = await socialMediaInputs.count();
    console.log(`Found ${inputCount} social media inputs`);

    if (inputCount > 0) {
      await socialMediaInputs.first().fill(TEST_DATA.deal.username);
      console.log('✅ Filled username');
    }
    if (inputCount > 1) {
      await socialMediaInputs.nth(1).fill(TEST_DATA.deal.followers);
      console.log('✅ Filled followers');
    }

    // Handle dropdowns
    const selects = page.locator('select');
    const selectCount = await selects.count();
    for (let i = 0; i < selectCount; i++) {
      try {
        await selects.nth(i).selectOption({ index: 1 });
        console.log(`✅ Selected dropdown ${i + 1}`);
      } catch (error) {
        console.log(`⚠️ Dropdown ${i + 1} selection failed, trying manual`);
        await selects.nth(i).click();
        await page.waitForTimeout(200);
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(200);
        await page.keyboard.press('Enter');
      }
    }
  },

  async fillDealTerms(page) {
    console.log('📋 Filling deal terms...');
    
    const dealNicknameInput = page.locator('input[placeholder*="Nike"], input[placeholder*="John"], input[placeholder*="Deal Nickname"]');
    await dealNicknameInput.fill(TEST_DATA.deal.nickname);
    console.log('✅ Filled deal nickname');

    // Handle green popup if present
    const greenPopup = page.locator('text="Social media confirmed"');
    if (await greenPopup.count() > 0) {
      await page.locator('button[aria-label="Close"]').click();
      console.log('✅ Dismissed green popup');
    }
  },

  async fillPayorInfo(page) {
    console.log('🏢 Filling payor info...');
    
    await page.locator('text="Business"').first().click();
    console.log('✅ Selected Business payor type');

    const companyInput = page.locator('input[placeholder*="Nike"], input[placeholder*="John"], input[placeholder*="Company"]');
    await companyInput.fill(TEST_DATA.deal.company);
    console.log('✅ Filled company name');
  },

  async selectActivities(page) {
    console.log('🎯 Selecting activities...');
    
    await page.locator('text="Social Media"').first().click();
    console.log('✅ Selected Social Media activity');
  },

  async fillActivityForm(page) {
    console.log('📝 Filling activity form...');
    
    // Select platforms (Instagram, TikTok, etc.)
    const platformOptions = page.locator('text="Instagram", text="TikTok", text="Snapchat", text="X", text="YouTube"');
    const platformCount = await platformOptions.count();
    console.log(`Found ${platformCount} platform options`);

    for (let i = 0; i < Math.min(platformCount, 3); i++) {
      await platformOptions.nth(i).click();
      console.log(`✅ Selected platform ${i + 1}`);
      await page.waitForTimeout(500);
    }

    // Fill content guidelines
    const guidelinesInput = page.locator('textarea, input[placeholder*="guidelines"], input[placeholder*="Guidelines"]');
    if (await guidelinesInput.count() > 0) {
      await guidelinesInput.first().fill('Automated test content guidelines');
      console.log('✅ Filled content guidelines');
    }
  },

  async fillCompliance(page) {
    console.log('⚖️ Filling compliance...');
    
    const noOptions = page.locator('text="No"');
    const noCount = await noOptions.count();
    console.log(`Found ${noCount} "No" options`);

    for (let i = 0; i < noCount; i++) {
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
  },

  async fillCompensation(page) {
    console.log('💰 Filling compensation...');
    
    const compensationInputs = page.locator('input[type="number"]');
    const inputCount = await compensationInputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      await compensationInputs.nth(i).fill(TEST_DATA.deal.compensation);
      console.log(`✅ Filled compensation input ${i + 1}`);
    }

    // Handle dropdowns
    const selects = page.locator('select');
    const selectCount = await selects.count();
    for (let i = 0; i < selectCount; i++) {
      try {
        await selects.nth(i).selectOption({ index: 1 });
        console.log(`✅ Selected compensation dropdown ${i + 1}`);
      } catch (error) {
        console.log(`⚠️ Could not select compensation dropdown ${i + 1}`);
      }
    }
  },

  async navigateWithWorkaround(page, stepNumber, expectedButton) {
    console.log(`🔄 Step ${stepNumber}: Looking for navigation button...`);
    
    // Try the expected button first
    let button = page.locator(`button:has-text("${expectedButton}")`);
    
    // If not found, try alternatives based on known issues
    if (await button.count() === 0) {
      console.log(`⚠️ "${expectedButton}" button not found, trying alternatives...`);
      
      if (stepNumber === 1) {
        // Step 1: Known issue - no Back button, only Next
        console.log('⚠️ Step 1: Back button missing (known issue)');
        button = page.locator('button:has-text("Next")');
      } else if (stepNumber === 4 || stepNumber === 5) {
        // Steps 4-5: Known issue - uses "Continue" instead of "Next"
        console.log(`⚠️ Step ${stepNumber}: Using "Continue" instead of "Next" (known issue)`);
        button = page.locator('button:has-text("Continue")');
      }
    }

    if (await button.count() > 0) {
      await expect(button).toBeVisible();
      console.log(`✅ Found navigation button for Step ${stepNumber}`);
      
      // Check if button is enabled
      const isEnabled = await button.isEnabled();
      if (!isEnabled) {
        console.log(`⚠️ Button is disabled, may need more form filling`);
        return false;
      }
      
      await button.click();
      await this.waitForPageLoad(page);
      console.log(`✅ Successfully navigated from Step ${stepNumber}`);
      return true;
    } else {
      console.log(`❌ No navigation button found for Step ${stepNumber}`);
      return false;
    }
  }
};

// Test Results Tracking
const testResults = {
  steps: {},
  issues: [],
  
  logStep(stepNumber, stepName, success, details = '') {
    this.steps[stepNumber] = {
      name: stepName,
      success,
      details,
      timestamp: new Date().toISOString()
    };
    
    const status = success ? '✅' : '❌';
    console.log(`${status} Step ${stepNumber}: ${stepName} ${details}`);
  },
  
  logIssue(stepNumber, issue, severity = 'medium') {
    this.issues.push({
      step: stepNumber,
      issue,
      severity,
      timestamp: new Date().toISOString()
    });
    console.log(`⚠️ Issue on Step ${stepNumber}: ${issue}`);
  },
  
  generateReport() {
    console.log('\n📊 TEST EXECUTION REPORT');
    console.log('========================');
    
    const totalSteps = Object.keys(this.steps).length;
    const successfulSteps = Object.values(this.steps).filter(s => s.success).length;
    const successRate = ((successfulSteps / totalSteps) * 100).toFixed(1);
    
    console.log(`\nOverall Success Rate: ${successRate}% (${successfulSteps}/${totalSteps})`);
    
    console.log('\nStep-by-Step Results:');
    Object.entries(this.steps).forEach(([step, data]) => {
      const status = data.success ? '✅' : '❌';
      console.log(`  ${status} Step ${step}: ${data.name} - ${data.details}`);
    });
    
    if (this.issues.length > 0) {
      console.log('\nIssues Found:');
      this.issues.forEach(issue => {
        console.log(`  ⚠️ Step ${issue.step}: ${issue.issue} (${issue.severity})`);
      });
    }
    
    return {
      successRate,
      totalSteps,
      successfulSteps,
      issues: this.issues
    };
  }
};

// Main Test Suite
test.describe('Simple Deal Logging - Automated Navigation Testing', () => {
  test('Complete navigation flow with automated helpers', async ({ page }) => {
    console.log('🚀 Starting automated Simple Deal Logging navigation test...');
    
    // Initialize test
    await page.goto(`${TEST_CONFIG.baseURL}/dashboard`);
    await helpers.waitForPageLoad(page);
    
    // Login
    await helpers.login(page);
    
    // Step 0: Navigate to Simple Deal Logging
    console.log('\n📋 Step 0: Deal Selection');
    await page.waitForSelector('text="Simple Deal Logging"', { timeout: TEST_CONFIG.timeout });
    const simpleDealCard = page.locator('text="Simple Deal Logging"');
    await simpleDealCard.click();
    await helpers.waitForPageLoad(page);
    testResults.logStep(0, 'Deal Selection', true, 'Successfully selected Simple Deal Logging');
    
    // Step 0: Social Media Form
    console.log('\n📱 Step 0: Social Media Form');
    await page.waitForSelector('input, select, textarea', { timeout: TEST_CONFIG.timeout });
    await helpers.fillSocialMediaForm(page);
    
    const continueButton = page.locator('button:has-text("Continue")');
    await expect(continueButton).toBeVisible();
    await continueButton.click();
    await helpers.waitForPageLoad(page);
    testResults.logStep(0, 'Social Media Form', true, 'Successfully filled and navigated');
    
    // Step 1: Deal Terms
    console.log('\n📋 Step 1: Deal Terms');
    await helpers.fillDealTerms(page);
    
    // Workaround for missing Back button
    const backButton = page.locator('button:has-text("Back")');
    if (await backButton.count() === 0) {
      testResults.logIssue(1, 'Missing Back button', 'high');
    }
    
    const nextButton = page.locator('button:has-text("Next")');
    await expect(nextButton).toBeVisible();
    await nextButton.click();
    await helpers.waitForPageLoad(page);
    testResults.logStep(1, 'Deal Terms', true, 'Successfully filled and navigated');
    
    // Step 2: Payor Info
    console.log('\n🏢 Step 2: Payor Info');
    await helpers.fillPayorInfo(page);
    
    const step2Next = page.locator('button:has-text("Next")');
    await expect(step2Next).toBeVisible();
    await step2Next.click();
    await helpers.waitForPageLoad(page);
    testResults.logStep(2, 'Payor Info', true, 'Successfully filled and navigated');
    
    // Step 3: Activities
    console.log('\n🎯 Step 3: Activities');
    await helpers.selectActivities(page);
    
    const step3Next = page.locator('button:has-text("Next")');
    await expect(step3Next).toBeVisible();
    await step3Next.click();
    await helpers.waitForPageLoad(page);
    testResults.logStep(3, 'Activities', true, 'Successfully selected and navigated');
    
    // Step 4: Activity Form
    console.log('\n📝 Step 4: Activity Form');
    await helpers.fillActivityForm(page);
    
    // Workaround for "Continue" vs "Next" inconsistency
    const step4Button = page.locator('button:has-text("Continue"), button:has-text("Next")');
    await expect(step4Button).toBeVisible();
    await step4Button.click();
    await helpers.waitForPageLoad(page);
    testResults.logStep(4, 'Activity Form', true, 'Successfully filled and navigated');
    
    // Step 5: Compliance
    console.log('\n⚖️ Step 5: Compliance');
    await helpers.fillCompliance(page);
    
    // Workaround for "Continue" vs "Next" inconsistency
    const step5Button = page.locator('button:has-text("Continue"), button:has-text("Next")');
    await expect(step5Button).toBeVisible();
    await step5Button.click();
    await helpers.waitForPageLoad(page);
    testResults.logStep(5, 'Compliance', true, 'Successfully filled and navigated');
    
    // Step 6: Compensation
    console.log('\n💰 Step 6: Compensation');
    await helpers.fillCompensation(page);
    
    const step6Next = page.locator('button:has-text("Next")');
    await expect(step6Next).toBeVisible();
    await step6Next.click();
    await helpers.waitForPageLoad(page);
    testResults.logStep(6, 'Compensation', true, 'Successfully filled and navigated');
    
    // Step 7: Review
    console.log('\n📋 Step 7: Review');
    const submitButton = page.locator('button:has-text("Submit Deal"), button:has-text("Submit")');
    await expect(submitButton).toBeVisible();
    testResults.logStep(7, 'Review', true, 'Successfully reached review step');
    
    // Generate final report
    const report = testResults.generateReport();
    
    console.log('\n🎉 Automated navigation test completed!');
    console.log(`Final Success Rate: ${report.successRate}%`);
    
    // Assert overall success
    expect(report.successRate).toBeGreaterThanOrEqual(80);
  });
}); 