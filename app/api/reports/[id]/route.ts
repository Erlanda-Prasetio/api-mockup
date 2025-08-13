// import { NextRequest, NextResponse } from 'next/server';
// import db from '@/lib/database';

// interface UpdateStatusRequest {
//   status_pengaduan_id: number;
//   notes?: string;
// }

// // Update report status
// export async function PATCH(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const reportId = parseInt(params.id);
//     const { status_pengaduan_id, notes }: UpdateStatusRequest = await request.json();

//     // Validate status_pengaduan_id (1=Proses, 2=Selesai, 3=Ditunda)
//     if (![1, 2, 3].includes(status_pengaduan_id)) {
//       return NextResponse.json(
//         { message: 'Invalid status. Use 1=Proses, 2=Selesai, 3=Ditunda' },
//         { status: 400 }
//       );
//     }

//     // Check if report exists
//     const checkReport = db.prepare('SELECT id FROM reports WHERE id = $1');
//     const existingReport = await checkReport.get([reportId]);

//     if (!existingReport) {
//       console.log('❌ Status Update - Contoh Respons Error (404 Not Found):');
//       console.log(JSON.stringify({ message: 'Data tidak ditemukan' }, null, 2));
//       console.log('=====================================');
      
//       return NextResponse.json(
//         { message: 'Data tidak ditemukan' },
//         { status: 404 }
//       );
//     }

//     // Update report status
//     const updateReport = db.prepare(`
//       UPDATE reports 
//       SET status_pengaduan_id = $1, notes = $2, updated_at = CURRENT_TIMESTAMP
//       WHERE id = $3
//     `);

//     await updateReport.run([status_pengaduan_id, notes || null, reportId]);

//     // Get updated report data
//     const getUpdatedReport = db.prepare(`
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
//       WHERE id = $1
//     `);

//     const updatedReport = await getUpdatedReport.get([reportId]) as any;

//     // Format response according to the specified format
//     const formattedResponse = [{
//       id: updatedReport.id,
//       user_id: updatedReport.user_id,
//       kategori_id: updatedReport.kategori_id,
//       nama_terduga: updatedReport.nama_terduga,
//       nip_terduga: updatedReport.nip_terduga,
//       jabatan_terduga: updatedReport.jabatan_terduga,
//       jenis_kelamin: updatedReport.jenis_kelamin,
//       deskripsi: updatedReport.deskripsi,
//       bukti: updatedReport.bukti,
//       validasi_aduan: updatedReport.validasi_aduan,
//       status_pengaduan_id: updatedReport.status_pengaduan_id,
//       notes: updatedReport.notes,
//       kode_aduan: updatedReport.kode_aduan,
//       auditor_id: updatedReport.auditor_id,
//       created_at: updatedReport.created_at,
//       updated_at: updatedReport.updated_at,
//       file_rekomendasi: updatedReport.file_rekomendasi
//     }];

//     console.log('✅ Report Status Update - Contoh Respons Sukses (200 OK):');
//     console.log(JSON.stringify(formattedResponse, null, 2));
//     console.log('=====================================');

//     return NextResponse.json(formattedResponse, { status: 200 });

//   } catch (error) {
//     console.error('Update status error:', error);
    
//     return NextResponse.json(
//       {
//         message: 'Internal server error',
//         error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Something went wrong'
//       },
//       { status: 500 }
//     );
//   }
// }

// // Delete report
// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const reportId = parseInt(params.id);

//     // Check if report exists
//     const checkReport = db.prepare('SELECT id FROM reports WHERE id = $1');
//     const existingReport = await checkReport.get([reportId]);

//     if (!existingReport) {
//       console.log(' Delete Report - Contoh Respons Error (404 Not Found):');
//       console.log(JSON.stringify({ message: 'Data tidak ditemukan' }, null, 2));
//       console.log('=====================================');
      
//       return NextResponse.json(
//         { message: 'Data tidak ditemukan' },
//         { status: 404 }
//       );
//     }

//     // Delete report
//     const deleteReport = db.prepare('DELETE FROM reports WHERE id = $1');
//     await deleteReport.run([reportId]);

//     console.log(' Delete Report - Success (200 OK):');
//     console.log(JSON.stringify({ message: 'Data berhasil dihapus' }, null, 2));
//     console.log('=====================================');

//     return NextResponse.json(
//       { message: 'Data berhasil dihapus' },
//       { status: 200 }
//     );

//   } catch (error) {
//     console.error('Delete report error:', error);
    
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

interface UpdateStatusRequest {
  status_pengaduan_id: number;
  notes?: string;
}

// GET report details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!process.env.API_INTAN || !process.env.API_USERNAME || !process.env.API_PASSWORD) {
      throw new Error('API_INTAN, API_USERNAME, and API_PASSWORD environment variables must be set');
    }

    const reportId = params.id;

    // Get report details from official API
    const apiUrl = process.env.API_INTAN + `/pengaduan/${reportId}`;
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.API_INTAN_TOKEN || ''}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('INTAN API Error:', {
        endpoint: apiUrl,
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });

      if (response.status === 404) {
        return NextResponse.json(
          { message: 'Data tidak ditemukan' },
          { status: 404 }
        );
      }
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Get report error:', error);
    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Something went wrong'
      },
      { status: 500 }
    );
  }
}

// UPDATE report status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = parseInt(params.id);
    const { status_pengaduan_id, notes }: UpdateStatusRequest = await request.json();

    // Validate status values (1=Proses, 2=Selesai, 3=Ditunda)
    if (![1, 2, 3].includes(status_pengaduan_id)) {
      return NextResponse.json({
        message: 'Invalid status. Use 1=Proses, 2=Selesai, 3=Ditunda'
      }, { status: 400 });
    }

    // NOTE: The official API documentation doesn't show an update endpoint
    // You may need to ask the company if there's an update endpoint available
    // For now, returning not implemented status

    console.log('❌ Status Update - API endpoint not available');
    console.log('Requested update:', JSON.stringify({
      report_id: reportId,
      status_pengaduan_id,
      notes
    }, null, 2));
    console.log('=====================================');

    // Temporary response until update endpoint is available
    return NextResponse.json({
      message: 'Update functionality not available - official API does not provide update endpoint',
      requested_update: {
        report_id: reportId,
        status_pengaduan_id,
        notes
      }
    }, { status: 501 }); // 501 = Not Implemented

  } catch (error) {
    console.error('Update report error:', error);
    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Something went wrong'
      },
      { status: 500 }
    );
  }
}

// DELETE report
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = parseInt(params.id);

    // NOTE: The official API documentation doesn't show a delete endpoint
    // You may need to ask the company if there's a delete endpoint available

    console.log('❌ Delete Report - API endpoint not available');
    console.log('Requested deletion for report ID:', reportId);
    console.log('=====================================');

    return NextResponse.json({
      message: 'Delete functionality not available - official API does not provide delete endpoint',
      requested_deletion: {
        report_id: reportId
      }
    }, { status: 501 }); // 501 = Not Implemented

  } catch (error) {
    console.error('Delete report error:', error);
    return NextResponse.json(
      {
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Something went wrong'
      },
      { status: 500 }
    );
  }
}