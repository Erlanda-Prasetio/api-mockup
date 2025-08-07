require('dotenv').config();
const fetch = require('node-fetch');

async function testStatsApi() {
  try {
    // First, get the authentication token
    const loginUrl = `${process.env.API_INTAN}/auth/login`;
    const loginResponse = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: process.env.API_USERNAME,
        password: process.env.API_PASSWORD
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed with status ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    console.log('Login successful');
    
    // Get the token from the login response
    const token = loginData.token || loginData.data?.token;
    
    if (!token) {
      throw new Error('No token received from login');
    }

    // Now try to get the stats with the token
    const statsUrl = `${process.env.API_INTAN}/pengaduan/count`;
    const statsResponse = await fetch(statsUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
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
