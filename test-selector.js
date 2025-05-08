// test-selector.js
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get all test files
function getAllTestFiles() {
  const apiTestsDir = path.join(__dirname, 'src', '__tests__', 'api');
  const uiTestsDir = path.join(__dirname, 'src', '__tests__', 'ui');
  
  const apiTestFiles = fs.existsSync(apiTestsDir) 
    ? fs.readdirSync(apiTestsDir, { recursive: true })
      .filter(file => file.endsWith('.api.test.ts') || file.endsWith('.api.test.tsx'))
      .map(file => path.join(apiTestsDir, file))
    : [];
  
  const uiTestFiles = fs.existsSync(uiTestsDir)
    ? fs.readdirSync(uiTestsDir, { recursive: true })
      .filter(file => file.endsWith('.ui.test.ts') || file.endsWith('.ui.test.tsx'))
      .map(file => path.join(uiTestsDir, file))
    : [];
  
  return {
    apiTestFiles,
    uiTestFiles
  };
}

function runTests() {
  const { apiTestFiles, uiTestFiles } = getAllTestFiles();
  
  console.log('Running API tests in Node environment...');
  if (apiTestFiles.length > 0) {
    const apiResult = spawnSync('npx', ['vitest', 'run', ...apiTestFiles], {
      stdio: 'inherit'
    });
    
    if (apiResult.status !== 0) {
      console.error('API tests failed');
      process.exit(apiResult.status);
    }
  } else {
    console.log('No API tests found');
  }
  
  console.log('\nRunning UI tests in jsdom environment...');
  if (uiTestFiles.length > 0) {
    const uiResult = spawnSync('npx', ['vitest', 'run', '--environment', 'jsdom', ...uiTestFiles], {
      stdio: 'inherit'
    });
    
    if (uiResult.status !== 0) {
      console.error('UI tests failed');
      process.exit(uiResult.status);
    }
  } else {
    console.log('No UI tests found');
  }
  
  console.log('\nAll tests passed!');
}

runTests();