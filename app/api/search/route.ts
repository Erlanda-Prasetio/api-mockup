// import { NextRequest, NextResponse } from 'next/server';
// import db from '@/lib/database';

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const kodeAduan = searchParams.get('kode_aduan');

//     // Validate required parameter
//     if (!kodeAduan) {
//       const errorResponse = { kode_aduan: ['The kode aduan field is required.'] };
      
//       console.log('Respons Error (422 Unprocessable Content):');
//       console.log(JSON.stringify(errorResponse, null, 2));
//       console.log('=====================================');
      
//       return NextResponse.json(errorResponse, { status: 422 });
//     }

//     // Search for report by kode_aduan
//     const searchReport = db.prepare(`
//       SELECT 
//         id, 
//         CASE WHEN anonim = 1 THEN NULL ELSE nama END as user_id,
//         CASE 
//           WHEN kategori_id = 'korupsi' THEN 1
//           WHEN kategori_id = 'gratifikasi' THEN 2
//           WHEN kategori_id = 'benturan-kepentingan' THEN 3
//           ELSE 1
//         END as kategori_id,
//         nama_terduga,
//         nip_terduga,
//         jabatan_terduga,
//         jenis_kelamin,
//         deskripsi,
//         NULL as bukti,
//         validasi_pengaduan as validasi_aduan,
//         status_pengaduan_id,
//         notes,
//         kode_aduan,
//         auditor_id,
//         created_at,
//         updated_at,
//         file_rekomendasi
//       FROM reports 
//       WHERE kode_aduan = $1
//     `);

//     const report = await searchReport.get([kodeAduan]) as any;

//     if (!report) {
//       console.log(' Respons Error (404 Not Found):');
//       console.log(JSON.stringify({ message: 'Data tidak ditemukan' }, null, 2));
//       console.log('=====================================');
      
//       return NextResponse.json(
//         { message: 'Data tidak ditemukan' },
//         { status: 404 }
//       );
//     }

//     // Format response according to the specified format
//     const formattedResponse = [{
//       id: report.id,
//       user_id: report.user_id,
//       kategori_id: report.kategori_id,
//       nama_terduga: report.nama_terduga,
//       nip_terduga: report.nip_terduga,
//       jabatan_terduga: report.jabatan_terduga,
//       jenis_kelamin: report.jenis_kelamin,
//       deskripsi: report.deskripsi,
//       bukti: report.bukti,
//       validasi_aduan: report.validasi_aduan,
//       status_pengaduan_id: report.status_pengaduan_id,
//       notes: report.notes,
//       kode_aduan: report.kode_aduan,
//       auditor_id: report.auditor_id,
//       created_at: report.created_at,
//       updated_at: report.updated_at,
//       file_rekomendasi: report.file_rekomendasi
//     }];

//     console.log('Respons Sukses (200 OK):');
//     console.log(JSON.stringify(formattedResponse, null, 2));
//     console.log('=====================================');

//     return NextResponse.json(formattedResponse, { status: 200 });

//   } catch (error) {
//     console.error('Search report error:', error);
    
//     return NextResponse.json(
//       {
//         message: 'Internal server error',
//         error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Something went wrong'
//       },
//       { status: 500 }
//     );
//   }
// }
import { NextRequest, NextResponse } from 'next/server';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kodeAduan = searchParams.get('kode_aduan');

    // Validate required parameter
    if (!kodeAduan) {
      const errorResponse = { kode_aduan: ['The kode aduan field is required.'] };
      
      console.log('Response Error (422 Unprocessable Content):');
      console.log(JSON.stringify(errorResponse, null, 2));
      console.log('==========================================');
      
      return NextResponse.json(errorResponse, { status: 422 });
    }

    // Build upstream URL
    const apiBase = (process.env.API_INTAN || '').replace(/\/$/, '');
    if (!apiBase) {
      console.error('Missing API_INTAN env for upstream API');
      return NextResponse.json({ error: 'Upstream API not configured' }, { status: 500 });
    }

    const apiUrl = `${apiBase}/pengaduan/search`;

    // Choose auth header: Bearer token preferred, fallback to Basic auth
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (process.env.API_INTAN_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.API_INTAN_TOKEN}`;
    } else if (process.env.API_USERNAME && process.env.API_PASSWORD) {
      const creds = Buffer.from(`${process.env.API_USERNAME}:${process.env.API_PASSWORD}`).toString('base64');
      headers['Authorization'] = `Basic ${creds}`;
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ kode_aduan: kodeAduan }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { message: 'Report not found' },
          { status: 404 }
        );
      }
      throw new Error(`API request failed with status ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';
    const text = await response.text();

    if (response.ok) {
      if (contentType.includes('application/json')) {
        try {
          const json = JSON.parse(text);
          return NextResponse.json(json, { status: 200 });
        } catch (err) {
          console.error('Failed to parse JSON from upstream:', err);
          return NextResponse.json({ error: 'Invalid JSON from upstream' }, { status: 502 });
        }
      }

      // Upstream returned non-JSON (likely an auth/login HTML); forward a helpful error
      console.error('Upstream returned non-JSON response for search');
      return NextResponse.json({ error: 'Upstream returned non-JSON response', bodyPreview: text.slice(0, 800) }, { status: 502 });
    }

    // Not OK
    if (response.status === 404) {
      return NextResponse.json({ message: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({ error: `Upstream error ${response.status}`, bodyPreview: text.slice(0, 800) }, { status: 502 });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}