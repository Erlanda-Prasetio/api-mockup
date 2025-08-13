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

    // Search for report by kode_aduan using official API
    const apiUrl =  process.env.API_INTAN || process.env.API_USERNAME || process.env.API_PASSWORD + '/pengaduan/search';
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.API_INTAN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        kode_aduan: kodeAduan
      }),
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

    const data = await response.json();
    
    if (!data) {
      return NextResponse.json(
        { message: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}