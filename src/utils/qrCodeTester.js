
import { extractCowIdFromQR } from './qrCodeUtils';

// Test cases for QR code parsing
const testCases = [
  {
    description: 'Direct UUID string',
    input: '44f71bbd-84e3-4e09-b215-10e6ea9f9943',
    expectedOutput: '44f71bbd-84e3-4e09-b215-10e6ea9f9943'
  },
  {
    description: 'JSON object with ID field',
    input: '{"type":"cow","id":"44f71bbd-84e3-4e09-b215-10e6ea9f9943","tagNumber":"JUNE001","name":"JUNE001","breed":"Other"}',
    expectedOutput: '44f71bbd-84e3-4e09-b215-10e6ea9f9943'
  },
  {
    description: 'JSON object with URL and timestamp',
    input: '{"type":"cow","id":"44f71bbd-84e3-4e09-b215-10e6ea9f9943","tagNumber":"JUNE001","name":"JUNE001","breed":"Other","timestamp":"2025-06-01T12:32:32.770Z","url":"https://dairy-farm-management-v1.vercel.app/cow/44f71bbd-84e3-4e09-b215-10e6ea9f9943"}',
    expectedOutput: '44f71bbd-84e3-4e09-b215-10e6ea9f9943'
  },
  {
    description: 'Whitespace around UUID',
    input: '  44f71bbd-84e3-4e09-b215-10e6ea9f9943  ',
    expectedOutput: '  44f71bbd-84e3-4e09-b215-10e6ea9f9943  ' // Should preserve whitespace as cowService will handle it
  },
  {
    description: 'Invalid JSON string',
    input: '{broken json"id":"123"}',
    expectedOutput: '{broken json"id":"123"}' // Should return input unchanged
  },
  {
    description: 'JSON without ID field',
    input: '{"type":"cow","tagNumber":"JUNE001"}',
    expectedOutput: '{"type":"cow","tagNumber":"JUNE001"}' // Should return input unchanged
  }
];

// Run tests
export const testQRCodeParsing = () => {
  console.log('=== TESTING QR CODE PARSING ===');
  
  let passCount = 0;
  let failCount = 0;
  
  testCases.forEach((test, index) => {
    const result = extractCowIdFromQR(test.input);
    const passed = result === test.expectedOutput;
    
    console.log(`Test ${index + 1}: ${test.description}`);
    console.log(`  Input: ${test.input}`);
    console.log(`  Expected: ${test.expectedOutput}`);
    console.log(`  Actual: ${result}`);
    console.log(`  Status: ${passed ? 'PASSED' : 'FAILED'}`);
    
    if (passed) {
      passCount++;
    } else {
      failCount++;
    }
  });
  
  console.log('\n=== TEST SUMMARY ===');
  console.log(`Total tests: ${testCases.length}`);
  console.log(`Passed: ${passCount}`);
  console.log(`Failed: ${failCount}`);
  
  return { total: testCases.length, passed: passCount, failed: failCount };
};

// Auto-run tests if executed directly
if (require.main === module) {
  testQRCodeParsing();
}
