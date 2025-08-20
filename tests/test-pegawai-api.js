

async function testPegawaiAPI() {
  try {
    console.log('Testing GET /pegawai...');
    const basicAuth = Buffer.from(`${API_USERNAME}:${API_PASSWORD}`).toString('base64');
    const response = await fetch(`${API_BASE_URL}/pegawai`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Accept': 'application/json',
      },
    });
    
    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('Data:', data);
    } else {
      const errorText = await response.text();
      console.error('Error:', errorText);
    }
  } catch (error) {
    console.error('Fetch Error:', error);
  }
}

testPegawaiAPI();
