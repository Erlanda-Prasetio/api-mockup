import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';

interface UpdateStatusRequest {
  status_pengaduan_id: number;
  notes?: string;
}

// Update report status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = parseInt(params.id);
    const { status_pengaduan_id, notes }: UpdateStatusRequest = await request.json();

    // Validate status_pengaduan_id (1=Proses, 2=Selesai, 3=Ditunda)
    if (![1, 2, 3].includes(status_pengaduan_id)) {
      return NextResponse.json(
        { message: 'Invalid status. Use 1=Proses, 2=Selesai, 3=Ditunda' },
        { status: 400 }
      );
    }

    // Check if report exists
    const checkReport = db.prepare('SELECT id FROM reports WHERE id = ?');
    const existingReport = checkReport.get(reportId);

    if (!existingReport) {
      console.log('❌ Status Update - Contoh Respons Error (404 Not Found):');
      console.log(JSON.stringify({ message: 'Data tidak ditemukan' }, null, 2));
      console.log('=====================================');
      
      return NextResponse.json(
        { message: 'Data tidak ditemukan' },
        { status: 404 }
      );
    }

    // Update report status
    const updateReport = db.prepare(`
      UPDATE reports 
      SET status_pengaduan_id = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    updateReport.run(status_pengaduan_id, notes || null, reportId);

    // Get updated report data
    const getUpdatedReport = db.prepare(`
      SELECT 
        id, 
        CASE WHEN anonim = 1 THEN NULL ELSE nama END as user_id,
        CASE 
          WHEN kategori_id = 'korupsi' THEN 1
          WHEN kategori_id = 'gratifikasi' THEN 2
          WHEN kategori_id = 'benturan-kepentingan' THEN 3
          ELSE 1
        END as kategori_id,
        nama_terduga,
        nip_terduga,
        jabatan_terduga,
        jenis_kelamin,
        deskripsi,
        NULL as bukti,
        validasi_pengaduan as validasi_aduan,
        status_pengaduan_id,
        notes,
        kode_aduan,
        auditor_id,
        created_at,
        updated_at,
        file_rekomendasi
      FROM reports 
      WHERE id = ?
    `);

    const updatedReport = getUpdatedReport.get(reportId) as any;

    // Format response according to the specified format
    const formattedResponse = [{
      id: updatedReport.id,
      user_id: updatedReport.user_id,
      kategori_id: updatedReport.kategori_id,
      nama_terduga: updatedReport.nama_terduga,
      nip_terduga: updatedReport.nip_terduga,
      jabatan_terduga: updatedReport.jabatan_terduga,
      jenis_kelamin: updatedReport.jenis_kelamin,
      deskripsi: updatedReport.deskripsi,
      bukti: updatedReport.bukti,
      validasi_aduan: updatedReport.validasi_aduan,
      status_pengaduan_id: updatedReport.status_pengaduan_id,
      notes: updatedReport.notes,
      kode_aduan: updatedReport.kode_aduan,
      auditor_id: updatedReport.auditor_id,
      created_at: updatedReport.created_at,
      updated_at: updatedReport.updated_at,
      file_rekomendasi: updatedReport.file_rekomendasi
    }];

    console.log('✅ Report Status Update - Contoh Respons Sukses (200 OK):');
    console.log(JSON.stringify(formattedResponse, null, 2));
    console.log('=====================================');

    return NextResponse.json(formattedResponse, { status: 200 });

  } catch (error) {
    console.error('Update status error:', error);
    
    return NextResponse.json(
      {
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Something went wrong'
      },
      { status: 500 }
    );
  }
}

// Delete report
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = parseInt(params.id);

    // Check if report exists
    const checkReport = db.prepare('SELECT id FROM reports WHERE id = ?');
    const existingReport = checkReport.get(reportId);

    if (!existingReport) {
      console.log(' Delete Report - Contoh Respons Error (404 Not Found):');
      console.log(JSON.stringify({ message: 'Data tidak ditemukan' }, null, 2));
      console.log('=====================================');
      
      return NextResponse.json(
        { message: 'Data tidak ditemukan' },
        { status: 404 }
      );
    }

    // Delete report
    const deleteReport = db.prepare('DELETE FROM reports WHERE id = ?');
    deleteReport.run(reportId);

    console.log(' Delete Report - Success (200 OK):');
    console.log(JSON.stringify({ message: 'Data berhasil dihapus' }, null, 2));
    console.log('=====================================');

    return NextResponse.json(
      { message: 'Data berhasil dihapus' },
      { status: 200 }
    );

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
