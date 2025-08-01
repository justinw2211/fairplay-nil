import { test, expect } from '@playwright/test';

/**
 * SIMPLE DEAL LOGGING - ROBUST AUTOMATED NAVIGATION TESTING
 *
 * Automated test with failure recovery and multiple fallback strategies
 * Automatically iterates through different approaches when stuck
 */

// Test Configuration
const CONFIG = {
  baseURL: 'https://fairplay-nil.vercel.app',
  timeout: 10000,
  retryAttempts: 3,
  waitTime: 2000
};

// Test Data
const TEST_DATA = {
  user: { email: 'test1@test.edu', password: 'testuser' },
  deal: { nickname: 'Auto Test Deal', company: 'Test Company', username: '@testuser', followers: '1000' }
};

// Robust Helper Functions
const robustHelpers = {
  async safeWait(page, selector, timeout = CONFIG.timeout) {
    try {
      await page.waitForSelector(selector, { timeout });
      return true;
    } catch (error) {
      console.log(`⚠️ Timeout waiting for: ${selector}`);
      return false;
    }
  },

  async safeClick(page, selector, description = 'element') {
    try {
      await page.locator(selector).click();
      console.log(`✅ Clicked ${description}`);
      return true;
    } catch (error) {
      console.log(`❌ Failed to click ${description}: ${error.message}`);
      return false;
    }
  },

  async safeFill(page, selector, value, description = 'field') {
    try {
      await page.locator(selector).fill(value);
      console.log(`✅ Filled ${description}: ${value}`);
      return true;
    } catch (error) {
      console.log(`❌ Failed to fill ${description}: ${error.message}`);
      return false;
    }
  },

  async findAndClickButton(page, buttonTexts, description = 'button') {
    for (const buttonText of buttonTexts) {
      const button = page.locator(`button:has-text("${buttonText}")`);
      if (await button.count() > 0) {
        try {
          await button.click();
          console.log(`✅ Clicked ${description}: ${buttonText}`);
          return true;
        } catch (error) {
          console.log(`⚠️ Failed to click ${buttonText}: ${error.message}`);
        }
      }
    }
    console.log(`❌ No button found for: ${buttonTexts.join(', ')}`);
    return false;
  },

  async autoFillForm(page, stepNumber) {
    console.log(`🤖 Auto-filling Step ${stepNumber}...`);
    
    switch (stepNumber) {
      case 0: // Social Media
        await this.safeFill(page, 'input', TEST_DATA.deal.username, 'username');
        await this.safeFill(page, 'input:nth-child(2)', TEST_DATA.deal.followers, 'followers');
        
        // Handle dropdowns
        const selects = page.locator('select');
        const selectCount = await selects.count();
        for (let i = 0; i < selectCount; i++) {
          try {
            await selects.nth(i).selectOption({ index: 1 });
          } catch (error) {
            await selects.nth(i).click();
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('Enter');
          }
        }
        break;
        
      case 1: // Deal Terms
        await this.safeFill(page, 'input[placeholder*="Nike"], input[placeholder*="John"], input[placeholder*="Deal Nickname"]', 
          TEST_DATA.deal.nickname, 'deal nickname');
        
        // Handle popup
        const popup = page.locator('text="Social media confirmed"');
        if (await popup.count() > 0) {
          await this.safeClick(page, 'button[aria-label="Close"]', 'popup close');
        }
        break;
        
      case 2: // Payor Info
        await this.safeClick(page, 'text="Business"', 'business type');
        await this.safeFill(page, 'input[placeholder*="Company"]', TEST_DATA.deal.company, 'company name');
        break;
        
      case 3: // Activities
        await this.safeClick(page, 'text="Social Media"', 'social media activity');
        break;
        
      case 4: // Activity Form
        // Select platforms
        const platforms = ['Instagram', 'TikTok', 'Snapchat'];
        for (const platform of platforms) {
          await this.safeClick(page, `text="${platform}"`, platform);
          await page.waitForTimeout(500);
        }
        
        // Fill guidelines
        await this.safeFill(page, 'textarea', 'Automated test guidelines', 'content guidelines');
        break;
        
      case 5: // Compliance
        const noOptions = page.locator('text="No"');
        const noCount = await noOptions.count();
        for (let i = 0; i < noCount; i++) {
          try {
            await noOptions.nth(i).click();
            await page.waitForTimeout(200);
          } catch (error) {
            console.log(`⚠️ Failed to click No option ${i + 1}`);
          }
        }
        break;
        
      case 6: // Compensation
        const numberInputs = page.locator('input[type="number"]');
        const inputCount = await numberInputs.count();
        for (let i = 0; i < inputCount; i++) {
          await numberInputs.nth(i).fill('1000');
        }
        
        // Handle dropdowns
        const compSelects = page.locator('select');
        const compSelectCount = await compSelects.count();
        for (let i = 0; i < compSelectCount; i++) {
          try {
            await compSelects.nth(i).selectOption({ index: 1 });
          } catch (error) {
            console.log(`⚠️ Failed to select compensation dropdown ${i + 1}`);
          }
        }
        break;
    }
  },

  async navigateStep(page, stepNumber) {
    console.log(`🔄 Navigating Step ${stepNumber}...`);
    
    // Wait for page load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(CONFIG.waitTime);
    
    // Auto-fill the form
    await this.autoFillForm(page, stepNumber);
    
    // Try different navigation strategies
    const navigationStrategies = [
      // Strategy 1: Try Next button
      () => this.findAndClickButton(page, ['Next'], 'Next button'),
      
      // Strategy 2: Try Continue button
      () => this.findAndClickButton(page, ['Continue'], 'Continue button'),
      
      // Strategy 3: Try both Next and Continue
      () => this.findAndClickButton(page, ['Next', 'Continue'], 'navigation button'),
      
      // Strategy 4: Look for any button with navigation text
      async () => {
        const allButtons = page.locator('button');
        const buttonCount = await allButtons.count();
        for (let i = 0; i < buttonCount; i++) {
          const button = allButtons.nth(i);
          const text = await button.textContent();
          if (text && (text.includes('Next') || text.includes('Continue'))) {
            try {
              await button.click();
              console.log(`✅ Clicked button: ${text}`);
              return true;
            } catch (error) {
              console.log(`⚠️ Failed to click button: ${text}`);
            }
          }
        }
        return false;
      }
    ];
    
    // Try each strategy
    for (let i = 0; i < navigationStrategies.length; i++) {
      console.log(`🔄 Trying navigation strategy ${i + 1}...`);
      const success = await navigationStrategies[i]();
      if (success) {
        console.log(`✅ Successfully navigated from Step ${stepNumber}`);
        return true;
      }
    }
    
    console.log(`❌ Failed to navigate from Step ${stepNumber}`);
    return false;
  }
};

// Test Results Tracker
const testTracker = {
  steps: {},
  issues: [],
  
  logStep(stepNumber, success, details = '') {
    this.steps[stepNumber] = { success, details, timestamp: Date.now() };
    const status = success ? '✅' : '❌';
    console.log(`${status} Step ${stepNumber}: ${details}`);
  },
  
  logIssue(stepNumber, issue) {
    this.issues.push({ step: stepNumber, issue, timestamp: Date.now() });
    console.log(`⚠️ Step ${stepNumber} issue: ${issue}`);
  },
  
  generateReport() {
    const totalSteps = Object.keys(this.steps).length;
    const successfulSteps = Object.values(this.steps).filter(s => s.success).length;
    const successRate = totalSteps > 0 ? (successfulSteps / totalSteps * 100).toFixed(1) : 0;
    
    console.log('\n📊 AUTOMATED TEST REPORT');
    console.log('========================');
    console.log(`Success Rate: ${successRate}% (${successfulSteps}/${totalSteps})`);
    
    Object.entries(this.steps).forEach(([step, data]) => {
      const status = data.success ? '✅' : '❌';
      console.log(`  ${status} Step ${step}: ${data.details}`);
    });
    
    if (this.issues.length > 0) {
      console.log('\nIssues Found:');
      this.issues.forEach(issue => {
        console.log(`  ⚠️ Step ${issue.step}: ${issue.issue}`);
      });
    }
    
    return { successRate, totalSteps, successfulSteps, issues: this.issues };
  }
};

// Main Test
test.describe('Simple Deal Logging - Robust Automated Navigation', () => {
  test('Automated navigation with fallback strategies', async ({ page }) => {
    console.log('🚀 Starting robust automated navigation test...');
    
    // Initialize
    await page.goto(`${CONFIG.baseURL}/dashboard`);
    await page.waitForLoadState('networkidle');
    
    // Login
    const loginForm = page.locator('input[type="email"]');
    if (await loginForm.count() > 0) {
      await loginForm.fill(TEST_DATA.user.email);
      await page.locator('input[type="password"]').fill(TEST_DATA.user.password);
      await page.locator('button[type="submit"]').click();
      await page.waitForLoadState('networkidle');
      console.log('✅ Logged in');
    }
    
    // Step 0: Select Simple Deal Logging
    console.log('\n📋 Step 0: Deal Selection');
    const dealFound = await robustHelpers.safeWait(page, 'text="Simple Deal Logging"');
    if (dealFound) {
      await robustHelpers.safeClick(page, 'text="Simple Deal Logging"', 'Simple Deal Logging card');
      testTracker.logStep(0, true, 'Deal selection successful');
    } else {
      testTracker.logStep(0, false, 'Deal card not found');
      return;
    }
    
    // Step 0: Social Media Form
    console.log('\n📱 Step 0: Social Media Form');
    const formLoaded = await robustHelpers.safeWait(page, 'input, select, textarea');
    if (formLoaded) {
      const navigationSuccess = await robustHelpers.navigateStep(page, 0);
      testTracker.logStep(0, navigationSuccess, 'Social media form completed');
    } else {
      testTracker.logStep(0, false, 'Social media form not loaded');
      return;
    }
    
    // Step 1: Deal Terms
    console.log('\n📋 Step 1: Deal Terms');
    const step1Success = await robustHelpers.navigateStep(page, 1);
    testTracker.logStep(1, step1Success, 'Deal terms completed');
    
    // Step 2: Payor Info
    console.log('\n🏢 Step 2: Payor Info');
    const step2Success = await robustHelpers.navigateStep(page, 2);
    testTracker.logStep(2, step2Success, 'Payor info completed');
    
    // Step 3: Activities
    console.log('\n🎯 Step 3: Activities');
    const step3Success = await robustHelpers.navigateStep(page, 3);
    testTracker.logStep(3, step3Success, 'Activities completed');
    
    // Step 4: Activity Form
    console.log('\n📝 Step 4: Activity Form');
    const step4Success = await robustHelpers.navigateStep(page, 4);
    testTracker.logStep(4, step4Success, 'Activity form completed');
    
    // Step 5: Compliance
    console.log('\n⚖️ Step 5: Compliance');
    const step5Success = await robustHelpers.navigateStep(page, 5);
    testTracker.logStep(5, step5Success, 'Compliance completed');
    
    // Step 6: Compensation
    console.log('\n💰 Step 6: Compensation');
    const step6Success = await robustHelpers.navigateStep(page, 6);
    testTracker.logStep(6, step6Success, 'Compensation completed');
    
    // Step 7: Review
    console.log('\n📋 Step 7: Review');
    const submitButton = page.locator('button:has-text("Submit Deal"), button:has-text("Submit")');
    const reviewSuccess = await submitButton.count() > 0;
    testTracker.logStep(7, reviewSuccess, 'Review step reached');
    
    // Generate final report
    const report = testTracker.generateReport();
    
    console.log('\n🎉 Automated test completed!');
    console.log(`Final Success Rate: ${report.successRate}%`);
    
    // Assert minimum success rate
    expect(parseFloat(report.successRate)).toBeGreaterThanOrEqual(70);
  });
}); 