// admin/scripts/convert-manual-tests.js
// Tương tự như app/scripts/convert-manual-tests.js
// Chỉ khác là đường dẫn và page names

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting conversion of Admin manual tests...\n');

const manualTestsPath = path.join(__dirname, '../test-data/manual-tests.json');

if (!fs.existsSync(manualTestsPath)) {
  console.error('❌ Error: manual-tests.json not found!');
  console.log(`   Expected at: ${manualTestsPath}`);
  process.exit(1);
}

const manualTests = JSON.parse(fs.readFileSync(manualTestsPath, 'utf-8'));

console.log(`📋 Found ${manualTests.testCases.length} admin test cases to convert\n`);

function generateTestFile(testCase) {
  const pageName = testCase.page || 'AdminLoginPage';
  const pageVarName = pageName.charAt(0).toLowerCase() + pageName.slice(1);
  const moduleName = testCase.section.toLowerCase().replace(/\s+/g, '-');
  
  return `// ${testCase.testId}.spec.js
const { test, expect } = require('../../fixtures/admin-fixture');

/**
 * TEST SUITE: ${testCase.testSuite}
 * SECTION: ${testCase.section}
 * TEST ID: ${testCase.testId}
 * 
 * Description: ${testCase.description || 'No description'}
 */

test.describe('${testCase.section} - ${testCase.testSuite} @admin', () => {
  
  test.beforeEach(async ({ ${pageVarName} }) => {
    console.log('📝 Setting up admin test...');
    // Pre-conditions:
${testCase.preconditions.map(p => `    // - ${p}`).join('\n')}
    
    await ${pageVarName}.goto();
  });

  test('${testCase.testId}: ${testCase.description || testCase.testSuite}', async ({ 
    page, 
    ${pageVarName}
  }) => {
    console.log('🧪 Admin Test: ${testCase.testId}');
    
    // TEST DATA
    const testData = ${JSON.stringify(testCase.testData, null, 6).replace(/\n/g, '\n    ')};
    
    // SCENARIOS:
${testCase.scenarios.map((s, i) => `    // Step ${i + 1}: ${s}`).join('\n')}
    
    // TODO: Implement test scenarios here
    
    // EXPECTED RESULTS:
${testCase.expectedResults.map((r, i) => `    // ${i + 1}. ${r}`).join('\n')}
    
    // TODO: Add assertions here
    
    console.log('✅ Admin test passed: ${testCase.testId}');
  });
});
`;
}

function convertTests() {
  let successCount = 0;
  let errorCount = 0;
  
  manualTests.testCases.forEach((testCase, index) => {
    try {
      const moduleName = testCase.section.toLowerCase().replace(/\s+/g, '-');
      const testContent = generateTestFile(testCase);
      
      const outputDir = path.join(__dirname, `../tests/specs/${moduleName}`);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
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
  console.log('📊 Admin Conversion Summary:');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);
  console.log(`   📝 Total: ${manualTests.testCases.length}`);
  console.log('='.repeat(60));
  
  if (errorCount === 0) {
    console.log('\n✨ All admin tests converted successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Review generated test files');
    console.log('   2. Implement TODO sections');
    console.log('   3. Run tests: npm run test:admin');
  } else {
    console.log('\n⚠️  Some tests failed to convert. Please check errors above.');
    process.exit(1);
  }
}

try {
  convertTests();
} catch (error) {
  console.error('\n❌ Fatal error during conversion:');
  console.error(error);
  process.exit(1);
}