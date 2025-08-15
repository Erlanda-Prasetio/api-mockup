require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function testStatsApi() {
  try {
    const token = process.env.API_INTAN_TOKEN;

  // normalize base url (avoid double '/api' if API_INTAN contains '/api')
  const base = process.env.API_INTAN.replace(/\/$/, '');

  // 1) Fetch categories
  const kategoriUrl = `${base}/kategori`;
    console.log('Fetching categories:', kategoriUrl);
    const kategoriRes = await fetch(kategoriUrl, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!kategoriRes.ok) {
      const t = await kategoriRes.text();
      throw new Error(`Failed to fetch categories ${kategoriRes.status}: ${t}`);
    }
    const kategoris = await kategoriRes.json();
    console.log(`Found ${kategoris.length} categories`);

    // 2) For each category, fetch count
    for (const k of kategoris) {
      const id = k.id;
  const countUrl = `${base}/pengaduan/count/${id}`;
      try {
        const res = await fetch(countUrl, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const text = await res.text();
        if (!res.ok) {
          console.log(`Category ${id} (${k.nama}) -> status ${res.status} body: ${text}`);
          continue;
        }
        const data = JSON.parse(text);
        console.log(`Category ${id} (${k.nama}) -> ${JSON.stringify(data)}`);
      } catch (err) {
        console.error('Error fetching count for', id, err.message);
      }
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Check if we have all required environment variables
const requiredEnvVars = ['API_INTAN', 'API_INTAN_TOKEN'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

// Run the test
testStatsApi();
