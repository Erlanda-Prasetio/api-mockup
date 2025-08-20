

// Test 1: Get Categories
async function testCategories() {
  try {
    console.log('Testing GET /kategori...');
    const categoryUrl = `${API_BASE_URL}/kategori?token=${API_TOKEN}`;
    console.log('Request URL:', categoryUrl);
    console.log('Request Headers:', {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    });
    
    const response = await fetch(categoryUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Categories Response Status:', response.status);
    console.log('Categories Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('Categories Data:', data);
    } else {
      const errorText = await response.text();
      console.error('Categories Error:', errorText);
    }
  } catch (error) {
    console.error('Categories Fetch Error:', error);
  }
}

// Test 2: Get Report Counts
async function testCounts() {
  try {
    console.log('Testing GET /pengaduans/count...');
    const response = await fetch(`${API_BASE_URL}/pengaduans/count?token=${API_TOKEN}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Counts Response Status:', response.status);
    const data = await response.text();
    console.log('Counts Raw Response:', data);
  } catch (error) {
    console.error('Counts Fetch Error:', error);
  }
}

// Test 3: Submit a Simple Report
async function testSubmitReport() {
  try {
    console.log('Testing POST /pengaduan/store...');
    console.log('API Base URL:', API_BASE_URL);
    
    const testData = {
      nama: 'Test User',
      email: 'test@example.com',
      kategori_id: '1',
      nama_terduga: 'Test Subject',
      jabatan_terduga: 'Test Position',
      deskripsi: 'Test description',
      jenis_kelamin: 'Laki-laki',
      validasi_aduan: '1'
    };

    const response = await fetch(`${API_BASE_URL}/pengaduan/store?token=${API_TOKEN}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(testData),
    });
    
    console.log('Submit Response Status:', response.status);
    const responseText = await response.text();
    console.log('Submit Raw Response:', responseText);
  } catch (error) {
    console.error('Submit Fetch Error:', error);
  }
}

// Run tests
async function runAllTests() {
  console.log('=== INTAN API Tests ===');
  await testCategories();
  console.log('\n=== Next Test ===');
  await testCounts();
  console.log('\n=== Next Test ===');
  await testSubmitReport();
}

runAllTests();
