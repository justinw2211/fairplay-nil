#!/usr/bin/env node

const http = require('http');

async function testServer(url, name) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      console.log(`✅ ${name} is running (${res.statusCode})`);
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${name} is not running: ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log(`❌ ${name} timeout`);
      req.destroy();
      resolve(false);
    });
  });
}

async function runTests() {
  console.log('🧪 Testing Server Status...\n');
  
  const backendRunning = await testServer('http://localhost:8000/health', 'Backend Server');
  const frontendRunning = await testServer('http://localhost:5173', 'Frontend Server');
  
  console.log('\n📊 Summary:');
  if (backendRunning && frontendRunning) {
    console.log('🎉 Both servers are running! Ready to test the fix.');
    console.log('\n📝 Next Steps:');
    console.log('1. Open http://localhost:5173 in your browser');
    console.log('2. Follow the manual test guide in test-deal-wizard-fix-manual.md');
    console.log('3. Monitor console logs for the fix verification');
  } else {
    console.log('⚠️  Some servers are not running. Please start them first.');
  }
}

runTests(); 