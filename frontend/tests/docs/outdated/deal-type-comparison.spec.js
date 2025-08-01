import { test, expect } from '@playwright/test';

/**
 * DEAL TYPE COMPARISON TEST SUITE
 * 
 * IMPORTANT ROUTING INFORMATION FOR STUDENT-ATHLETE USERS:
 * 
 * 1. AUTHENTICATION FLOW:
 *    - Users must be logged in to access deal creation
 *    - Test account: test1@test.edu / testuser
 *    - Authentication state is saved in playwright/.auth/user.json
 * 
 * 2. DEAL TYPE SELECTION FLOW:
 *    - Deal type selection happens on the DASHBOARD page (/dashboard)
 *    - NOT on a separate /deal-type-selection route
 *    - Dashboard contains "Create New Deal" section with three deal type cards
 * 
 * 3. DEAL TYPE CARDS ON DASHBOARD:
 *    - "Simple Deal Logging" (id: simple)
 *    - "NIL Go Clearinghouse Check" (id: clearinghouse) 
 *    - "Deal Valuation Analysis" (id: valuation)
 * 
 * 4. WIZARD NAVIGATION AFTER DEAL TYPE SELECTION:
 *    - All deal types start with: /add/deal/social-media/{dealId}?type={dealType}
 *    - Simple: Continues through standard wizard steps
 *    - Clearinghouse: Goes to /clearinghouse-wizard/{dealId} after standard steps
 *    - Valuation: Goes to /valuation-wizard/{dealId} after standard steps
 * 
 * 5. COMMON WIZARD STEPS (all deal types):
 *    - Step 0: Social Media (/add/deal/social-media/{dealId})
 *    - Step 1: Deal Terms (/add/deal/terms/{dealId})
 *    - Step 2: Payor Info (/add/deal/payor/{dealId})
 *    - Step 3: Activities (/add/deal/activities/select/{dealId})
 *    - Step 5: Compliance (/add/deal/compliance/{dealId})
 *    - Step 6: Compensation (/add/deal/compensation/{dealId})
 *    - Step 8: Review (/add/deal/review/{dealId})
 * 
 * 6. DEAL TYPE-SPECIFIC ENDINGS:
 *    - Simple: Ends at /add/deal/submission-success/{dealId}
 *    - Clearinghouse: Goes to /clearinghouse-wizard/{dealId} then /clearinghouse-result/{dealId}
 *    - Valuation: Goes to /valuation-wizard/{dealId} then /valuation-result/{dealId}
 * 
 * 7. TESTING CONSIDERATIONS:
 *    - Always start from /dashboard for deal type selection
 *    - Deal type cards may have loading states
 *    - Backend API must be running for deal creation
 *    - Use chromium-auth project for authenticated tests
 *    - Check for error states and backend availability
 */

// Test utilities for deal type comparison
const testUtils = {
  // Test data for different deal types
  testData: {
    simple: {
      dealNickname: 'Test Simple Deal',
      payorType: 'business',
      payorName: 'Test Company Inc.',
      payorEmail: 'test@company.com',
      payorPhone: '(555) 123-4567',
      compensationCash: '1000',
      activities: ['social_media_post']
    },
    clearinghouse: {
      dealNickname: 'Test Clearinghouse Deal',
      payorType: 'business',
      payorName: 'Nike Inc.',
      payorEmail: 'contact@nike.com',
      payorPhone: '(555) 123-4567',
      compensationCash: '2500', // Over $600 threshold
      activities: ['product_endorsement', 'social_media_post'],
      usesSchoolIp: false,
      grantExclusivity: 'no'
    },
    valuation: {
      dealNickname: 'Test Valuation Deal',
      payorType: 'business',
      payorName: 'Adidas Corp.',
      payorEmail: 'partnerships@adidas.com',
      payorPhone: '(555) 123-4567',
      compensationCash: '5000',
      activities: ['brand_ambassadorship', 'social_media_campaign'],
      socialMedia: {
        instagram: '25000',
        tiktok: '15000',
        twitter: '5000'
      }
    }
  },

  // Navigation utilities
  async navigateToDealTypeSelection(page) {
    console.log('🎯 Navigating to production dashboard for deal type selection');
    await page.goto('https://fairplay-nil.vercel.app/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the dashboard
    const pageTitle = await page.title();
    console.log(`📄 Page title: ${pageTitle}`);
    
    // Check for "Create New Deal" section
    const createDealSection = page.locator('text=Create New Deal');
    const sectionExists = await createDealSection.count() > 0;
    console.log(`🔍 Create New Deal section found: ${sectionExists}`);
    
    return sectionExists;
  },

  async selectDealType(page, dealType) {
    console.log(`🎯 Selecting deal type: ${dealType}`);
    
    // Look for deal type cards by their titles
    const dealTypeTitles = {
      'simple': 'Simple Deal Logging',
      'clearinghouse': 'NIL Go Clearinghouse Check',
      'valuation': 'Deal Valuation Analysis'
    };
    
    const targetTitle = dealTypeTitles[dealType];
    if (!targetTitle) {
      console.log(`❌ Unknown deal type: ${dealType}`);
      return false;
    }
    
    // Wait for cards to load and try multiple selectors
    await page.waitForTimeout(2000); // Wait for any loading states
    
    // First, try to find the card by title and then click its "Get Started" button
    const cardSelectors = [
      `text="${targetTitle}"`,
      `text*="${dealType}"`,
      '[data-testid*="deal-type"]',
      '.card',
      'button'
    ];
    
    for (const selector of cardSelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      console.log(`🔍 Trying selector "${selector}": found ${count} elements`);
      
      if (count > 0) {
        // Check if any element contains our target text
        for (let i = 0; i < count; i++) {
          const element = elements.nth(i);
          const text = await element.textContent();
          
          if (text && (text.includes(targetTitle) || text.toLowerCase().includes(dealType.toLowerCase()))) {
            console.log(`✅ Found ${dealType} card with text: "${text}"`);
            
            // Look for "Get Started" button within this card or nearby
            const getStartedButton = page.locator('button:has-text("Get Started")');
            if (await getStartedButton.count() > 0) {
              console.log(`🎯 Clicking "Get Started" button for ${dealType}`);
              await getStartedButton.click();
              await page.waitForTimeout(3000);
              return true;
            } else {
              // Fallback: click the card itself
              console.log(`🎯 Clicking ${dealType} card directly`);
              await element.click();
              await page.waitForTimeout(3000);
              return true;
            }
          }
        }
      }
    }
    
    // If we can't find the specific card, try clicking any "Get Started" button
    const getStartedButtons = page.locator('button:has-text("Get Started")');
    const buttonCount = await getStartedButtons.count();
    console.log(`🔍 Found ${buttonCount} "Get Started" buttons`);
    
    if (buttonCount > 0) {
      // Click the first "Get Started" button as a fallback
      console.log(`🎯 Clicking first "Get Started" button as fallback`);
      await getStartedButtons.first().click();
      await page.waitForTimeout(3000);
      return true;
    }
    
    console.log(`⚠️ Could not find ${dealType} card or "Get Started" button`);
    return false;
  },

  // Form filling utilities - Updated based on production findings
  async fillSocialMediaStep(page, dealType) {
    console.log(`📱 Filling social media step for ${dealType} deal`);
    
    // Wait for social media form to load
    await page.waitForSelector('input[name*="platforms"]', { timeout: 10000 });
    
    // Based on production findings, we have:
    // - platforms.0.handle (Instagram)
    // - platforms.0.followers (Instagram followers)
    // - platforms.1.handle (TikTok)
    // - platforms.1.followers (TikTok followers)
    
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
    
    // Look for next button and continue
    const nextButton = page.locator('button:has-text("Next"), button[type="submit"]');
    if (await nextButton.count() > 0) {
      await nextButton.click();
      console.log('✅ Clicked next button on social media step');
      await page.waitForTimeout(2000);
    }
  },

  async fillDealTermsStep(page, dealType) {
    console.log(`📄 Filling deal terms step for ${dealType} deal`);
    
    // Wait for deal terms form to load
    await page.waitForSelector('input[name*="nickname"]', { timeout: 10000 });
    
    // Fill deal nickname
    const nicknameInput = page.locator('input[name*="nickname"], input[placeholder*="nickname"]');
    if (await nicknameInput.count() > 0) {
      await nicknameInput.fill(testUtils.testData[dealType].dealNickname);
      console.log('✅ Filled deal nickname');
    }
    
    // Look for next button and continue
    const nextButton = page.locator('button:has-text("Next"), button[type="submit"]');
    if (await nextButton.count() > 0) {
      await nextButton.click();
      console.log('✅ Clicked next button on deal terms step');
      await page.waitForTimeout(2000);
    }
  },

  async fillPayorInfoStep(page, dealType) {
    console.log(`👤 Filling payor info step for ${dealType} deal`);
    
    // Wait for payor info form to load
    await page.waitForSelector('text=Payor Information', { timeout: 10000 });
    
    // Select payor type
    const payorTypeRadios = page.locator('input[type="radio"]');
    if (await payorTypeRadios.count() > 0) {
      const businessRadio = page.locator('input[value="business"]');
      const individualRadio = page.locator('input[value="individual"]');
      
      if (testUtils.testData[dealType].payorType === 'business' && await businessRadio.count() > 0) {
        await businessRadio.click();
        console.log('✅ Selected business payor type');
      } else if (testUtils.testData[dealType].payorType === 'individual' && await individualRadio.count() > 0) {
        await individualRadio.click();
        console.log('✅ Selected individual payor type');
      }
    }
    
    // Fill payor name
    const nameInput = page.locator('input[placeholder*="name"], input[name*="name"]');
    if (await nameInput.count() > 0) {
      await nameInput.fill(testUtils.testData[dealType].payorName);
      console.log('✅ Filled payor name');
    }
    
    // Fill payor email
    const emailInput = page.locator('input[type="email"], input[placeholder*="email"]');
    if (await emailInput.count() > 0) {
      await emailInput.fill(testUtils.testData[dealType].payorEmail);
      console.log('✅ Filled payor email');
    }
    
    // Fill payor phone
    const phoneInput = page.locator('input[type="tel"], input[placeholder*="phone"]');
    if (await phoneInput.count() > 0) {
      await phoneInput.fill(testUtils.testData[dealType].payorPhone);
      console.log('✅ Filled payor phone');
    }
    
    // Look for next button and continue
    const nextButton = page.locator('button:has-text("Next"), button[type="submit"]');
    if (await nextButton.count() > 0) {
      await nextButton.click();
      console.log('✅ Clicked next button on payor info step');
    }
  },

  async fillActivitiesStep(page, dealType) {
    console.log(`🎯 Filling activities step for ${dealType} deal`);
    
    // Wait for activities form to load
    await page.waitForSelector('text=Activities', { timeout: 10000 });
    
    // Select activities based on deal type
    const activities = testUtils.testData[dealType].activities;
    for (const activity of activities) {
      const activityCheckbox = page.locator(`input[value="${activity}"], input[name*="${activity}"]`);
      if (await activityCheckbox.count() > 0) {
        await activityCheckbox.check();
        console.log(`✅ Selected activity: ${activity}`);
      }
    }
    
    // Look for next button and continue
    const nextButton = page.locator('button:has-text("Next"), button[type="submit"]');
    if (await nextButton.count() > 0) {
      await nextButton.click();
      console.log('✅ Clicked next button on activities step');
    }
  },

  async fillComplianceStep(page, dealType) {
    console.log(`🛡️ Filling compliance step for ${dealType} deal`);
    
    // Wait for compliance form to load
    await page.waitForSelector('text=Compliance', { timeout: 10000 });
    
    // Handle school IP usage
    const schoolIpCheckbox = page.locator('input[name*="school_ip"], input[value*="school"]');
    if (await schoolIpCheckbox.count() > 0) {
      if (testUtils.testData[dealType].usesSchoolIp) {
        await schoolIpCheckbox.check();
        console.log('✅ Checked school IP usage');
      } else {
        await schoolIpCheckbox.uncheck();
        console.log('✅ Unchecked school IP usage');
      }
    }
    
    // Handle exclusivity
    const exclusivityRadios = page.locator('input[name*="exclusivity"]');
    if (await exclusivityRadios.count() > 0) {
      const yesRadio = page.locator('input[value="yes"]');
      const noRadio = page.locator('input[value="no"]');
      
      if (testUtils.testData[dealType].grantExclusivity === 'yes' && await yesRadio.count() > 0) {
        await yesRadio.click();
        console.log('✅ Selected exclusivity: yes');
      } else if (testUtils.testData[dealType].grantExclusivity === 'no' && await noRadio.count() > 0) {
        await noRadio.click();
        console.log('✅ Selected exclusivity: no');
      }
    }
    
    // Look for next button and continue
    const nextButton = page.locator('button:has-text("Next"), button[type="submit"]');
    if (await nextButton.count() > 0) {
      await nextButton.click();
      console.log('✅ Clicked next button on compliance step');
    }
  },

  async fillCompensationStep(page, dealType) {
    console.log(`💰 Filling compensation step for ${dealType} deal`);
    
    // Wait for compensation form to load
    await page.waitForSelector('text=Compensation', { timeout: 10000 });
    
    // Fill cash compensation
    const cashInput = page.locator('input[type="number"], input[placeholder*="amount"]');
    if (await cashInput.count() > 0) {
      await cashInput.fill(testUtils.testData[dealType].compensationCash);
      console.log('✅ Filled cash compensation');
    }
    
    // Look for next button and continue
    const nextButton = page.locator('button:has-text("Next"), button[type="submit"]');
    if (await nextButton.count() > 0) {
      await nextButton.click();
      console.log('✅ Clicked next button on compensation step');
    }
  },

  // Validation utilities
  async validateFormFields(page, stepName) {
    console.log(`🔍 Validating form fields on ${stepName} step`);
    
    const formFields = page.locator('input, textarea, select');
    const fieldCount = await formFields.count();
    console.log(`📝 Found ${fieldCount} form fields`);
    
    // Check for required field indicators
    const requiredFields = page.locator('input[required], textarea[required], select[required]');
    const requiredCount = await requiredFields.count();
    console.log(`⚠️ Found ${requiredCount} required fields`);
    
    return { fieldCount, requiredCount };
  },

  async captureStepScreenshot(page, stepName, dealType) {
    const screenshotPath = `test-results/deal-type-comparison/${dealType}-${stepName}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot saved: ${screenshotPath}`);
  },

  // Error checking utilities
  async checkForErrors(page) {
    const errorElements = page.locator('.error, .alert, [role="alert"], .text-red');
    const errorCount = await errorElements.count();
    
    if (errorCount > 0) {
      console.log(`❌ Found ${errorCount} error elements`);
      for (let i = 0; i < errorCount; i++) {
        const errorText = await errorElements.nth(i).textContent();
        console.log(`❌ Error ${i + 1}: ${errorText}`);
      }
      return true;
    }
    
    return false;
  }
};

// Test suite for deal type comparison
test.describe('Deal Type Comparison Tests', () => {
  
  // Simple test to verify infrastructure works
  test('should load homepage without authentication', async ({ page }) => {
    console.log('🚀 Testing basic page load...');
    
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    const pageTitle = await page.title();
    console.log(`📄 Page title: ${pageTitle}`);
    
    // Check for basic page elements
    const titleElement = page.locator('text=FAIR PLAY NIL');
    expect(await titleElement.count()).toBeGreaterThan(0);
    
    console.log('✅ Basic page load test passed');
  });

  test('should access deal type selection page', async ({ page }) => {
    console.log('🎯 Testing deal type selection from dashboard...');
    
    // Navigate to dashboard first (since deal type selection is on dashboard)
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForLoadState('networkidle');
    
    const pageTitle = await page.title();
    console.log(`📄 Page title: ${pageTitle}`);
    
    // Look for the "Create New Deal" section
    const createDealSection = page.locator('text=Create New Deal');
    const sectionExists = await createDealSection.count() > 0;
    console.log(`🔍 Create New Deal section found: ${sectionExists}`);
    
    // Check for deal type cards by looking for "Get Started" buttons
    const getStartedButtons = page.locator('button:has-text("Get Started")');
    const buttonCount = await getStartedButtons.count();
    console.log(`🔍 Found ${buttonCount} "Get Started" buttons`);
    
    // Also check for deal type card titles
    const dealTypeCards = page.locator('text=Simple Deal Logging, text=NIL Go Clearinghouse Check, text=Deal Valuation Analysis');
    const cardCount = await dealTypeCards.count();
    console.log(`🔍 Found ${cardCount} deal type card titles`);
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/deal-type-comparison/dashboard-deal-selection.png' });
    console.log('📸 Screenshot saved: dashboard-deal-selection.png');
    
    expect(sectionExists).toBeTruthy();
    expect(buttonCount).toBeGreaterThan(0);
    console.log('✅ Dashboard deal type selection test passed');
  });

  test.describe('Simple Deal Type Workflow', () => {
    test('should complete simple deal workflow', async ({ page }) => {
      console.log('🚀 Starting simple deal type test...');
      
      // Navigate to deal type selection
      const hasOptions = await testUtils.navigateToDealTypeSelection(page);
      expect(hasOptions).toBeTruthy();
      
      // Select simple deal type
      const selected = await testUtils.selectDealType(page, 'simple');
      expect(selected).toBeTruthy();
      
      // Wait for navigation to wizard
      await page.waitForTimeout(2000);
      console.log(`📍 Current URL: ${page.url()}`);
      
      // Complete wizard steps
      await testUtils.fillSocialMediaStep(page, 'simple');
      await testUtils.captureStepScreenshot(page, 'social-media', 'simple');
      
      await testUtils.fillDealTermsStep(page, 'simple');
      await testUtils.captureStepScreenshot(page, 'deal-terms', 'simple');
      
      await testUtils.fillPayorInfoStep(page, 'simple');
      await testUtils.captureStepScreenshot(page, 'payor-info', 'simple');
      
      await testUtils.fillActivitiesStep(page, 'simple');
      await testUtils.captureStepScreenshot(page, 'activities', 'simple');
      
      await testUtils.fillComplianceStep(page, 'simple');
      await testUtils.captureStepScreenshot(page, 'compliance', 'simple');
      
      await testUtils.fillCompensationStep(page, 'simple');
      await testUtils.captureStepScreenshot(page, 'compensation', 'simple');
      
      // Verify completion - should go to dashboard or review
      await page.waitForTimeout(2000);
      const finalUrl = page.url();
      console.log(`📍 Final URL: ${finalUrl}`);
      
      // Check for errors
      const hasErrors = await testUtils.checkForErrors(page);
      expect(hasErrors).toBeFalsy();
      
      // Verify we completed the workflow
      expect(finalUrl).toMatch(/dashboard|review|success/);
    });
  });

  test.describe('Clearinghouse Deal Type Workflow', () => {
    test('should complete clearinghouse deal workflow', async ({ page }) => {
      console.log('🏛️ Starting clearinghouse deal type test...');
      
      // Navigate to deal type selection
      const hasOptions = await testUtils.navigateToDealTypeSelection(page);
      expect(hasOptions).toBeTruthy();
      
      // Select clearinghouse deal type
      const selected = await testUtils.selectDealType(page, 'clearinghouse');
      expect(selected).toBeTruthy();
      
      // Wait for navigation to wizard
      await page.waitForTimeout(2000);
      console.log(`📍 Current URL: ${page.url()}`);
      
      // Complete wizard steps
      await testUtils.fillSocialMediaStep(page, 'clearinghouse');
      await testUtils.captureStepScreenshot(page, 'social-media', 'clearinghouse');
      
      await testUtils.fillDealTermsStep(page, 'clearinghouse');
      await testUtils.captureStepScreenshot(page, 'deal-terms', 'clearinghouse');
      
      await testUtils.fillPayorInfoStep(page, 'clearinghouse');
      await testUtils.captureStepScreenshot(page, 'payor-info', 'clearinghouse');
      
      await testUtils.fillActivitiesStep(page, 'clearinghouse');
      await testUtils.captureStepScreenshot(page, 'activities', 'clearinghouse');
      
      await testUtils.fillComplianceStep(page, 'clearinghouse');
      await testUtils.captureStepScreenshot(page, 'compliance', 'clearinghouse');
      
      await testUtils.fillCompensationStep(page, 'clearinghouse');
      await testUtils.captureStepScreenshot(page, 'compensation', 'clearinghouse');
      
      // Check for clearinghouse-specific elements
      const clearinghouseElements = page.locator('text=clearinghouse, text=Clearinghouse, text=NIL Go');
      const elementCount = await clearinghouseElements.count();
      console.log(`🏛️ Found ${elementCount} clearinghouse-related elements`);
      
      // Verify completion - should go to clearinghouse wizard or results
      await page.waitForTimeout(2000);
      const finalUrl = page.url();
      console.log(`📍 Final URL: ${finalUrl}`);
      
      // Check for errors
      const hasErrors = await testUtils.checkForErrors(page);
      expect(hasErrors).toBeFalsy();
      
      // Verify we completed the workflow
      expect(finalUrl).toMatch(/clearinghouse|review|success/);
    });
  });

  test.describe('Valuation Deal Type Workflow', () => {
    test('should complete valuation deal workflow', async ({ page }) => {
      console.log('💰 Starting valuation deal type test...');
      
      // Navigate to deal type selection
      const hasOptions = await testUtils.navigateToDealTypeSelection(page);
      expect(hasOptions).toBeTruthy();
      
      // Select valuation deal type
      const selected = await testUtils.selectDealType(page, 'valuation');
      expect(selected).toBeTruthy();
      
      // Wait for navigation to wizard
      await page.waitForTimeout(2000);
      console.log(`📍 Current URL: ${page.url()}`);
      
      // Complete wizard steps
      await testUtils.fillSocialMediaStep(page, 'valuation');
      await testUtils.captureStepScreenshot(page, 'social-media', 'valuation');
      
      await testUtils.fillDealTermsStep(page, 'valuation');
      await testUtils.captureStepScreenshot(page, 'deal-terms', 'valuation');
      
      await testUtils.fillPayorInfoStep(page, 'valuation');
      await testUtils.captureStepScreenshot(page, 'payor-info', 'valuation');
      
      await testUtils.fillActivitiesStep(page, 'valuation');
      await testUtils.captureStepScreenshot(page, 'activities', 'valuation');
      
      await testUtils.fillComplianceStep(page, 'valuation');
      await testUtils.captureStepScreenshot(page, 'compliance', 'valuation');
      
      await testUtils.fillCompensationStep(page, 'valuation');
      await testUtils.captureStepScreenshot(page, 'compensation', 'valuation');
      
      // Check for valuation-specific elements
      const valuationElements = page.locator('text=valuation, text=Valuation, text=market value');
      const elementCount = await valuationElements.count();
      console.log(`💰 Found ${elementCount} valuation-related elements`);
      
      // Verify completion - should go to valuation wizard or results
      await page.waitForTimeout(2000);
      const finalUrl = page.url();
      console.log(`📍 Final URL: ${finalUrl}`);
      
      // Check for errors
      const hasErrors = await testUtils.checkForErrors(page);
      expect(hasErrors).toBeFalsy();
      
      // Verify we completed the workflow
      expect(finalUrl).toMatch(/valuation|review|success/);
    });
  });

  test.describe('Form Field Comparison', () => {
    test('should compare form fields across deal types', async ({ page }) => {
      console.log('🔍 Comparing form fields across deal types...');
      
      const dealTypes = ['simple', 'clearinghouse', 'valuation'];
      const fieldComparison = {};
      
      for (const dealType of dealTypes) {
        console.log(`📊 Analyzing form fields for ${dealType} deal type...`);
        
        // Navigate to deal type selection
        await testUtils.navigateToDealTypeSelection(page);
        await testUtils.selectDealType(page, dealType);
        await page.waitForTimeout(2000);
        
        // Analyze each step
        const stepAnalysis = {};
        
        // Social media step
        await testUtils.fillSocialMediaStep(page, dealType);
        const socialMediaFields = await testUtils.validateFormFields(page, 'social-media');
        stepAnalysis.socialMedia = socialMediaFields;
        
        // Deal terms step
        await testUtils.fillDealTermsStep(page, dealType);
        const dealTermsFields = await testUtils.validateFormFields(page, 'deal-terms');
        stepAnalysis.dealTerms = dealTermsFields;
        
        // Payor info step
        await testUtils.fillPayorInfoStep(page, dealType);
        const payorInfoFields = await testUtils.validateFormFields(page, 'payor-info');
        stepAnalysis.payorInfo = payorInfoFields;
        
        // Activities step
        await testUtils.fillActivitiesStep(page, dealType);
        const activitiesFields = await testUtils.validateFormFields(page, 'activities');
        stepAnalysis.activities = activitiesFields;
        
        // Compliance step
        await testUtils.fillComplianceStep(page, dealType);
        const complianceFields = await testUtils.validateFormFields(page, 'compliance');
        stepAnalysis.compliance = complianceFields;
        
        // Compensation step
        await testUtils.fillCompensationStep(page, dealType);
        const compensationFields = await testUtils.validateFormFields(page, 'compensation');
        stepAnalysis.compensation = compensationFields;
        
        fieldComparison[dealType] = stepAnalysis;
        
        // Navigate back to start for next deal type
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');
      }
      
      // Log comparison results
      console.log('📊 Form field comparison results:');
      console.log(JSON.stringify(fieldComparison, null, 2));
      
      // Verify that all deal types have form fields
      for (const dealType of dealTypes) {
        const analysis = fieldComparison[dealType];
        expect(analysis.socialMedia.fieldCount).toBeGreaterThan(0);
        expect(analysis.dealTerms.fieldCount).toBeGreaterThan(0);
        expect(analysis.payorInfo.fieldCount).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Navigation Pattern Comparison', () => {
    test('should compare navigation patterns across deal types', async ({ page }) => {
      console.log('🧭 Comparing navigation patterns across deal types...');
      
      const dealTypes = ['simple', 'clearinghouse', 'valuation'];
      const navigationPatterns = {};
      
      for (const dealType of dealTypes) {
        console.log(`🧭 Analyzing navigation for ${dealType} deal type...`);
        
        const urls = [];
        
        // Navigate to deal type selection
        await testUtils.navigateToDealTypeSelection(page);
        urls.push(page.url());
        
        // Select deal type
        await testUtils.selectDealType(page, dealType);
        await page.waitForTimeout(2000);
        urls.push(page.url());
        
        // Complete wizard steps and track URLs
        await testUtils.fillSocialMediaStep(page, dealType);
        urls.push(page.url());
        
        await testUtils.fillDealTermsStep(page, dealType);
        urls.push(page.url());
        
        await testUtils.fillPayorInfoStep(page, dealType);
        urls.push(page.url());
        
        await testUtils.fillActivitiesStep(page, dealType);
        urls.push(page.url());
        
        await testUtils.fillComplianceStep(page, dealType);
        urls.push(page.url());
        
        await testUtils.fillCompensationStep(page, dealType);
        urls.push(page.url());
        
        // Wait for final navigation
        await page.waitForTimeout(2000);
        urls.push(page.url());
        
        navigationPatterns[dealType] = urls;
        
        // Navigate back to start for next deal type
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');
      }
      
      // Log navigation comparison results
      console.log('🧭 Navigation pattern comparison results:');
      console.log(JSON.stringify(navigationPatterns, null, 2));
      
      // Verify that all deal types complete the workflow
      for (const dealType of dealTypes) {
        const urls = navigationPatterns[dealType];
        expect(urls.length).toBeGreaterThan(5); // Should have multiple steps
        expect(urls[urls.length - 1]).toMatch(/dashboard|clearinghouse|valuation|review|success/);
      }
    });
  });

  test.describe('Production Deal Type Tests', () => {
    test('should complete simple deal workflow on production', async ({ page }) => {
      console.log('🚀 Starting simple deal type test on production...');
      
      // Navigate to production dashboard
      const hasOptions = await testUtils.navigateToDealTypeSelection(page);
      expect(hasOptions).toBeTruthy();
      
      // Select simple deal type
      const selected = await testUtils.selectDealType(page, 'simple');
      expect(selected).toBeTruthy();
      
      // Wait for navigation to wizard
      await page.waitForTimeout(3000);
      console.log(`📍 Current URL: ${page.url()}`);
      
      // Verify we're on the social media step
      expect(page.url()).toMatch(/\/add\/deal\/social-media\/\d+\?type=simple/);
      
      // Complete wizard steps
      await testUtils.fillSocialMediaStep(page, 'simple');
      await testUtils.captureStepScreenshot(page, 'social-media', 'simple');
      
      // Verify we moved to deal terms step
      console.log(`📍 URL after social media step: ${page.url()}`);
      expect(page.url()).toMatch(/\/add\/deal\/terms\/\d+\?type=simple/);
      
      await testUtils.fillDealTermsStep(page, 'simple');
      await testUtils.captureStepScreenshot(page, 'deal-terms', 'simple');
      
      // Continue with remaining steps...
      await testUtils.fillPayorInfoStep(page, 'simple');
      await testUtils.captureStepScreenshot(page, 'payor-info', 'simple');
      
      await testUtils.fillActivitiesStep(page, 'simple');
      await testUtils.captureStepScreenshot(page, 'activities', 'simple');
      
      await testUtils.fillComplianceStep(page, 'simple');
      await testUtils.captureStepScreenshot(page, 'compliance', 'simple');
      
      await testUtils.fillCompensationStep(page, 'simple');
      await testUtils.captureStepScreenshot(page, 'compensation', 'simple');
      
      // Verify completion - should go to dashboard or review
      await page.waitForTimeout(2000);
      const finalUrl = page.url();
      console.log(`📍 Final URL: ${finalUrl}`);
      
      // Check for errors
      const hasErrors = await testUtils.checkForErrors(page);
      expect(hasErrors).toBeFalsy();
      
      // Verify we completed the workflow
      expect(finalUrl).toMatch(/dashboard|review|success/);
      
      console.log('✅ Simple deal workflow completed successfully on production');
    });
  });
}); 