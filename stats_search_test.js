require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function testSearchApi() {
  try {
    const token = process.env.API_INTAN_TOKEN;
    const base = process.env.API_INTAN.replace(/\/$/, '');

    const url = `${base}/pengaduan/search`;
    console.log('POSTing to', url);

    // Try the user's kode in a few likely payload shapes
    const kode = '20250815ZGWHG';
    const payloads = [
      { kode_aduan: kode },
      { q: kode },
      { search: kode },
      { kode: kode },
      { nomor: kode },
    ];

    for (const p of payloads) {
      try {
        console.log('\nTrying payload:', JSON.stringify(p));
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(p),
          redirect: 'follow'
        });

        console.log('Status:', res.status);
        console.log('Headers:', JSON.stringify(Object.fromEntries(res.headers.entries())));
        const text = await res.text();

        // Try to parse JSON
        try {
          const json = JSON.parse(text);
          console.log('JSON response:', JSON.stringify(json, null, 2));
        } catch (e) {
          console.log('Non-JSON response (first 800 chars):', text.slice(0, 800));
        }
      } catch (err) {
        console.error('Request error:', err.message);
      }
    }
  } catch (err) {
    console.error('Setup error:', err.message);
  }
}

// Run
const requiredEnv = ['API_INTAN', 'API_INTAN_TOKEN'];
const missing = requiredEnv.filter(v => !process.env[v]);
if (missing.length) {
  console.error('Missing env:', missing.join(', '));
  process.exit(1);
}

testSearchApi();
