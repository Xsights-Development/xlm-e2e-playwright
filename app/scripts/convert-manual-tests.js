// app/scripts/convert-manual-tests.js
const fs = require('fs');
const path = require('path');

/**
 * Script để convert manual test cases thành Playwright tests
 * Usage: npm run convert:app
 */

console.log('🚀 Starting conversion of App manual tests...\n');

// Đọc manual test cases
const manualTestsPath = path.join(__dirname, '../test-data/manual-tests.json');

if (!fs.existsSync(manualTestsPath)) {
  console.error('❌ Error: manual-tests.json not found!');
  console.log(`   Expected at: ${manualTestsPath}`);
  process.exit(1);
}

const manualTests = JSON.parse(fs.readFileSync(manualTestsPath, 'utf-8'));

console.log(`📋 Found ${manualTests.testCases.length} test cases to convert\n`);

/**
 * Generate test file content from manual test case
 */
function generateTestFile(testCase) {
  const pageName = testCase.page || 'LoginPage';
  const pageVarName = pageName.charAt(0).toLowerCase() + pageName.slice(1);
  const moduleName = testCase.section.toLowerCase().replace(/\s+/g, '-');
  
  return `// ${testCase.testId}.spec.js
const { test, expect } = require('../../fixtures/app-fixture');

/**
 * TEST SUITE: ${testCase.testSuite}
 * SECTION: ${testCase.section}
 * TEST ID: ${testCase.testId}
 * 
 * Description: ${testCase.description || 'No description'}
 */

test.describe('${testCase.section} - ${testCase.testSuite}', () => {
  
  test.beforeEach(async ({ ${pageVarName} }) => {
    console.log('📝 Setting up test...');
    // Pre-conditions:
${testCase.preconditions.map(p => `    // - ${p}`).join('\n')}
    
    await ${pageVarName}.goto();
  });

  test('${testCase.testId}: ${testCase.description || testCase.testSuite}', async ({ 
    page, 
    ${pageVarName}
  }) => {
    console.log('🧪 Test: ${testCase.testId}');
    
    // TEST DATA
    const testData = ${JSON.stringify(testCase.testData, null, 6).replace(/\n/g, '\n    ')};
    
    // SCENARIOS:
${testCase.scenarios.map((s, i) => `    // Step ${i + 1}: ${s}`).join('\n')}
    
    // TODO: Implement test scenarios here
    // Example implementation:
    // await ${pageVarName}.fillEmail(testData.email);
    // await ${pageVarName}.fillPassword(testData.password);
    // await ${pageVarName}.clickLoginButton();
    
    // EXPECTED RESULTS:
${testCase.expectedResults.map((r, i) => `    // ${i + 1}. ${r}`).join('\n')}
    
    // TODO: Add assertions here
    // Example:
    // await expect(page).toHaveURL(/.*dashboard/);
    // const message = await dashboardPage.getWelcomeMessage();
    // expect(message).toContain('Welcome');
    
    console.log('✅ Test passed: ${testCase.testId}');
  });
});
`;
}

/**
 * Main conversion function
 */
function convertTests() {
  let successCount = 0;
  let errorCount = 0;
  
  manualTests.testCases.forEach((testCase, index) => {
    try {
      const moduleName = testCase.section.toLowerCase().replace(/\s+/g, '-');
      const testContent = generateTestFile(testCase);
      
      // Create output directory
      const outputDir = path.join(__dirname, `../tests/specs/${moduleName}`);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Save test file
      const outputPath = path.join(outputDir, `${testCase.testId}.spec.js`);
      fs.writeFileSync(outputPath, testContent);
      
      console.log(`✅ [${index + 1}/${manualTests.testCases.length}] Generated: ${testCase.testId}.spec.js`);
      successCount++;
      
    } catch (error) {
      console.error(`❌ [${index + 1}/${manualTests.testCases.length}] Failed: ${testCase.testId}`);
      console.error(`   Error: ${error.message}`);
      errorCount++;
    }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Conversion Summary:');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);
  console.log(`   📝 Total: ${manualTests.testCases.length}`);
  console.log('='.repeat(60));
  
  if (errorCount === 0) {
    console.log('\n✨ All tests converted successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Review generated test files');
    console.log('   2. Implement TODO sections');
    console.log('   3. Run tests: npm run test:app');
  } else {
    console.log('\n⚠️  Some tests failed to convert. Please check errors above.');
    process.exit(1);
  }
}

// Run conversion
try {
  convertTests();
} catch (error) {
  console.error('\n❌ Fatal error during conversion:');
  console.error(error);
  process.exit(1);
}