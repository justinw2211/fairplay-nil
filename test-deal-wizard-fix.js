#!/usr/bin/env node

/**
 * Test Script for Deal Wizard Fix
 * 
 * This script tests the fix for the loading screen issue after completing
 * the "select activities" page in the deal wizard.
 */

const puppeteer = require('puppeteer');

class DealWizardTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = [];
  }

  async init() {
    console.log('🚀 Starting Deal Wizard Fix Test...');
    this.browser = await puppeteer.launch({ 
      headless: false, 
      defaultViewport: null,
      args: ['--start-maximized']
    });
    this.page = await this.browser.newPage();
    
    // Enable console logging
    this.page.on('console', msg => {
      if (msg.type() === 'log') {
        console.log(`[Browser] ${msg.text()}`);
      }
    });

    // Enable request/response logging
    this.page.on('response', response => {
      if (response.url().includes('/api/')) {
        console.log(`[API] ${response.status()} ${response.url()}`);
      }
    });
  }

  async testLogin() {
    console.log('\n📝 Testing Login...');
    
    await this.page.goto('http://localhost:5173');
    await this.page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    // Fill login form
    await this.page.type('input[type="email"]', 'test@example.com');
    await this.page.type('input[type="password"]', 'password123');
    await this.page.click('button[type="submit"]');
    
    // Wait for dashboard
    await this.page.waitForSelector('[data-testid="dashboard"]', { timeout: 15000 });
    console.log('✅ Login successful');
    
    this.testResults.push({ test: 'Login', status: 'PASS' });
  }

  async testDealCreation() {
    console.log('\n📝 Testing Deal Creation...');
    
    // Click on "Start New Deal" or similar button
    await this.page.click('[data-testid="start-new-deal"]');
    await this.page.waitForSelector('[data-testid="deal-type-selection"]', { timeout: 10000 });
    
    // Select deal type (simple)
    await this.page.click('[data-testid="deal-type-simple"]');
    await this.page.click('[data-testid="continue-button"]');
    
    console.log('✅ Deal creation initiated');
    this.testResults.push({ test: 'Deal Creation', status: 'PASS' });
  }

  async testSocialMediaStep() {
    console.log('\n📝 Testing Social Media Step...');
    
    await this.page.waitForSelector('[data-testid="social-media-step"]', { timeout: 10000 });
    
    // Fill social media form
    await this.page.type('[data-testid="social-media-handles"]', '@testuser');
    await this.page.click('[data-testid="next-button"]');
    
    await this.page.waitForSelector('[data-testid="terms-step"]', { timeout: 10000 });
    console.log('✅ Social Media step completed');
    
    this.testResults.push({ test: 'Social Media Step', status: 'PASS' });
  }

  async testTermsStep() {
    console.log('\n📝 Testing Terms Step...');
    
    // Fill terms form
    await this.page.type('[data-testid="deal-title"]', 'Test Deal');
    await this.page.type('[data-testid="deal-description"]', 'Test deal description');
    await this.page.click('[data-testid="next-button"]');
    
    await this.page.waitForSelector('[data-testid="payor-step"]', { timeout: 10000 });
    console.log('✅ Terms step completed');
    
    this.testResults.push({ test: 'Terms Step', status: 'PASS' });
  }

  async testPayorStep() {
    console.log('\n📝 Testing Payor Step...');
    
    // Fill payor form
    await this.page.select('[data-testid="payor-type"]', 'collective');
    await this.page.type('[data-testid="payor-name"]', 'Test Collective');
    await this.page.type('[data-testid="payor-email"]', 'collective@test.com');
    await this.page.type('[data-testid="payor-phone"]', '555-123-4567');
    await this.page.click('[data-testid="next-button"]');
    
    await this.page.waitForSelector('[data-testid="activities-step"]', { timeout: 10000 });
    console.log('✅ Payor step completed');
    
    this.testResults.push({ test: 'Payor Step', status: 'PASS' });
  }

  async testActivitiesStep() {
    console.log('\n📝 Testing Activities Step (Critical Test)...');
    
    // Select some activities
    await this.page.click('[data-testid="activity-social-media"]');
    await this.page.click('[data-testid="activity-appearance"]');
    
    // Click next and monitor for loading screen
    await this.page.click('[data-testid="next-button"]');
    
    // Wait for either activity form or loading screen
    try {
      // Check if we get stuck on loading
      const loadingSpinner = await this.page.$('[data-testid="loading-spinner"]');
      if (loadingSpinner) {
        console.log('⚠️  Loading spinner detected - monitoring...');
        
        // Wait up to 10 seconds for the loading to resolve
        await this.page.waitForFunction(() => {
          return !document.querySelector('[data-testid="loading-spinner"]');
        }, { timeout: 10000 });
      }
      
      // Check if we reached the activity form
      await this.page.waitForSelector('[data-testid="activity-form"]', { timeout: 15000 });
      console.log('✅ Activities step completed - NO LOADING SCREEN ISSUE!');
      
      this.testResults.push({ test: 'Activities Step (Loading Fix)', status: 'PASS' });
      
    } catch (error) {
      console.log('❌ Still getting stuck on loading screen');
      this.testResults.push({ test: 'Activities Step (Loading Fix)', status: 'FAIL' });
      throw error;
    }
  }

  async testActivityForm() {
    console.log('\n📝 Testing Activity Form...');
    
    // Fill activity form
    await this.page.type('[data-testid="activity-description"]', 'Test activity description');
    await this.page.click('[data-testid="next-button"]');
    
    // Should navigate to next activity or compliance
    await this.page.waitForSelector('[data-testid="compliance-step"], [data-testid="activity-form"]', { timeout: 15000 });
    console.log('✅ Activity form completed');
    
    this.testResults.push({ test: 'Activity Form', status: 'PASS' });
  }

  async generateReport() {
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const total = this.testResults.length;
    
    this.testResults.forEach(result => {
      const status = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${status} ${result.test}`);
    });
    
    console.log(`\nOverall: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      console.log('🎉 All tests passed! The fix is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. The fix may need adjustment.');
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async runAllTests() {
    try {
      await this.init();
      await this.testLogin();
      await this.testDealCreation();
      await this.testSocialMediaStep();
      await this.testTermsStep();
      await this.testPayorStep();
      await this.testActivitiesStep();
      await this.testActivityForm();
      await this.generateReport();
    } catch (error) {
      console.error('❌ Test failed:', error.message);
      await this.generateReport();
    } finally {
      await this.cleanup();
    }
  }
}

// Run the tests
const tester = new DealWizardTester();
tester.runAllTests(); 