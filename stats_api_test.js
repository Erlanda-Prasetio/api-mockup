require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
async function testStatsApi() {
  try {
    // Make the stats request with basic auth
    const statsUrl = `${process.env.API_INTAN}/api/pengaduan/count`;
    console.log('Requesting URL:', statsUrl);

    const credentials = Buffer.from(`${process.env.API_USERNAME}:${process.env.API_PASSWORD}`).toString('base64');
    const statsResponse = await fetch(statsUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      }
    });

    if (!statsResponse.ok) {
      throw new Error(`Stats API request failed with status ${statsResponse.status}`);
    }

    const statsData = await statsResponse.json();
    console.log('Stats API Response:', JSON.stringify(statsData, null, 2));

  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      const errorBody = await error.response.text();
      console.error('Error response body:', errorBody);
    }
  }
}

// Check if we have all required environment variables
const requiredEnvVars = ['API_INTAN', 'API_USERNAME', 'API_PASSWORD'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

// Run the test
testStatsApi();
