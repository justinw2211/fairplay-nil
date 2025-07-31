#!/usr/bin/env node

const { chromium } = require('playwright');
const { spawn } = require('child_process');

async function debugWithPlaywright() {
  console.log('🚀 Starting FairPlay NIL debugging with Playwright...');
  
  // Start the development server
  const devServer = spawn('npm', ['run', 'dev'], {
    cwd: process.cwd(),
    stdio: 'pipe'
  });
  
  console.log('📡 Starting development server...');
  
  // Wait for server to start
  await new Promise(resolve => {
    devServer.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Local:') || output.includes('localhost:5173')) {
        console.log('✅ Development server started');
        resolve();
      }
    });
    
    // Timeout after 30 seconds
    setTimeout(() => {
      console.log('⏰ Server startup timeout');
      resolve();
    }, 30000);
  });
  
  // Launch browser for debugging
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: 'debug-videos/' },
    recordHar: { path: 'debug-network.har' }
  });
  
  const page = await context.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Console Error:', msg.text());
    } else if (msg.type() === 'warning') {
      console.log('⚠️ Console Warning:', msg.text());
    }
  });
  
  // Enable network error logging
  page.on('pageerror', error => {
    console.log('💥 Page Error:', error.message);
  });
  
  // Enable request failure logging
  page.on('requestfailed', request => {
    console.log('🌐 Request Failed:', request.url(), request.failure().errorText);
  });
  
  console.log('🔍 Navigating to application...');
  
  try {
    await page.goto('http://localhost:5173');
    
    console.log('✅ Application loaded successfully');
    console.log('📊 Page title:', await page.title());
    
    // Check for critical errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Wait a bit to catch any delayed errors
    await page.waitForTimeout(3000);
    
    if (errors.length > 0) {
      console.log('🚨 Critical errors detected:');
      errors.forEach(error => console.log('  -', error));
    } else {
      console.log('✅ No critical errors detected');
    }
    
    // Test key functionality
    console.log('🧪 Testing key functionality...');
    
    // Test navigation
    const navLinks = await page.locator('nav a').count();
    console.log(`📱 Found ${navLinks} navigation links`);
    
    // Test forms
    const forms = await page.locator('form').count();
    console.log(`📝 Found ${forms} forms`);
    
    // Test buttons
    const buttons = await page.locator('button').count();
    console.log(`🔘 Found ${buttons} buttons`);
    
    console.log('\n🎯 Debug session ready!');
    console.log('📹 Video recording: debug-videos/');
    console.log('🌐 Network log: debug-network.har');
    console.log('🔧 DevTools are open for manual debugging');
    console.log('\nPress Ctrl+C to stop debugging session');
    
    // Keep the session open for manual debugging
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Debug session failed:', error.message);
  } finally {
    await browser.close();
    devServer.kill();
    console.log('👋 Debug session ended');
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down debug session...');
  process.exit(0);
});

debugWithPlaywright().catch(console.error); 