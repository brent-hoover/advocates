#!/usr/bin/env node
/**
 * Comprehensive test runner for Solace advocate service
 * Runs API tests in node environment and UI tests in jsdom environment
 */

console.log('🧪 Running all tests for Solace advocate service');
console.log('=================================================');

const { spawnSync } = require('child_process');

// Run API tests with node environment
console.log('\n📡 Running API tests in node environment...');
const apiTestResult = spawnSync('npx', ['vitest', 'run', './src/__tests__/api/'], {
  stdio: 'inherit'
});

// Run UI tests with jsdom environment
console.log('\n🖥️  Running UI tests in jsdom environment...');
const uiTestResult = spawnSync('npx', ['vitest', 'run', './src/__tests__/ui/', '--environment', 'jsdom'], {
  stdio: 'inherit'
});

// Check results
const apiSuccess = apiTestResult.status === 0;
const uiSuccess = uiTestResult.status === 0;

console.log('\n=================================================');
console.log(`📡 API Tests: ${apiSuccess ? '✅ Passed' : '❌ Failed'}`);
console.log(`🖥️  UI Tests: ${uiSuccess ? '✅ Passed' : '❌ Failed'}`);
console.log('=================================================');

// Exit with appropriate code
if (apiSuccess && uiSuccess) {
  console.log('🎉 All tests passed! 🎉');
  process.exit(0);
} else {
  console.error('❌ Some tests failed');
  process.exit(1);
}