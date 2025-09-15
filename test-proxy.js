// Quick test script to verify proxy server is working
const axios = require('axios');

async function testProxy() {
  try {
    console.log('Testing proxy server...');

    // Test health endpoint
    const healthResponse = await axios.get('http://localhost:3001/health');
    console.log('✅ Health check:', healthResponse.data);

    // Test with a dummy zone ID (should fail but prove proxy is working)
    try {
      const testResponse = await axios.get('http://localhost:3001/api/cloudflare/validate/test-zone-id', {
        params: { apiToken: 'test-token' }
      });
    } catch (error) {
      if (error.response) {
        console.log('✅ Proxy is handling requests (expected 401/403 for test credentials)');
        console.log('   Status:', error.response.status);
        console.log('   Error:', error.response.data.error);
      } else {
        console.log('❌ Proxy connection error:', error.message);
      }
    }

  } catch (error) {
    console.log('❌ Proxy server not accessible:', error.message);
    console.log('Make sure to run: cd api && npm start');
  }
}

testProxy();