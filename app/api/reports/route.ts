import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';

// Define the expected form data structure
interface ReportFormData {
  kategori_id: string;
  deskripsi: string;
  tanggal: string;
  nama_terduga: string;
  nip_terduga?: string;
  jabatan_terduga: string;
  jenis_kelamin: string;
  nama?: string;
  email?: string;
  telepon?: string;
  anonim: number;
  validasi_pengaduan: number;
  captchaVerified: boolean;
}

// Validation function
function validateFormData(data: any): { isValid: boolean; errors: { [key: string]: string[] } } {
  const errors: { [key: string]: string[] } = {};

  // Required fields validation
  if (!data.kategori_id || typeof data.kategori_id !== 'string') {
    errors.kategori_id = ['The kategori id field is required.'];
  } else if (!['korupsi', 'gratifikasi', 'benturan-kepentingan'].includes(data.kategori_id)) {
    errors.kategori_id = ['The selected kategori id is invalid.'];
  }

  if (!data.deskripsi || typeof data.deskripsi !== 'string' || data.deskripsi.trim().length < 10) {
    errors.deskripsi = ['The deskripsi field must be at least 10 characters.'];
  }

  if (!data.tanggal || typeof data.tanggal !== 'string') {
    errors.tanggal = ['The tanggal field is required.'];
  }

  if (!data.nama_terduga || typeof data.nama_terduga !== 'string') {
    errors.nama_terduga = ['The nama terduga field is required.'];
  }

  if (!data.jabatan_terduga || typeof data.jabatan_terduga !== 'string') {
    errors.jabatan_terduga = ['The jabatan terduga field is required.'];
  }

  if (!data.jenis_kelamin || typeof data.jenis_kelamin !== 'string') {
    errors.jenis_kelamin = ['The jenis kelamin field is required.'];
  } else if (!['laki-laki', 'perempuan'].includes(data.jenis_kelamin)) {
    errors.jenis_kelamin = ['The selected jenis kelamin is invalid.'];
  }

  // Validate anonim flag and related fields
  if (typeof data.anonim !== 'number' || (data.anonim !== 0 && data.anonim !== 1)) {
    errors.anonim = ['The anonim field must be 0 or 1.'];
  }

  // If not anonymous, validate required reporter information
  if (data.anonim === 0) {
    if (!data.nama || typeof data.nama !== 'string') {
      errors.nama = ['The nama field is required when not reporting anonymously.'];
    }

    if (!data.email || typeof data.email !== 'string' || !isValidEmail(data.email)) {
      errors.email = ['The email field must be a valid email address.'];
    }
  }

  // Validate validation checkbox
  if (typeof data.validasi_pengaduan !== 'number' || (data.validasi_pengaduan !== 0 && data.validasi_pengaduan !== 1)) {
    errors.validasi_pengaduan = ['The validasi pengaduan field must be checked.'];
  }

  if (data.validasi_pengaduan !== 1) {
    errors.validasi_pengaduan = ['You must accept the data validation statement.'];
  }

  // Validate captcha verification
  if (!data.captchaVerified) {
    errors.captchaVerified = ['Security verification is required.'];
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Email validation helper
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const formData: ReportFormData = await request.json();

    // Log the incoming form data for debugging
    console.log('formData:', JSON.stringify(formData, null, 2));
    console.log('=====================================');

    // Validate form data
    const validation = validateFormData(formData);
    
    if (!validation.isValid) {
      console.log(' Validasi Gagal:', validation.errors);
      return NextResponse.json(
        validation.errors,
        { status: 422 } // Unprocessable Content
      );
    }

    // Prepare data for database insertion
    const reportData = {
      kategori_id: formData.kategori_id,
      deskripsi: formData.deskripsi.trim(),
      tanggal: formData.tanggal,
      nama_terduga: formData.nama_terduga,
      nip_terduga: formData.nip_terduga || null,
      jabatan_terduga: formData.jabatan_terduga,
      jenis_kelamin: formData.jenis_kelamin,
      nama: formData.anonim === 1 ? null : formData.nama,
      email: formData.anonim === 1 ? null : formData.email,
      telepon: formData.anonim === 1 ? null : (formData.telepon || null),
      anonim: formData.anonim,
      validasi_pengaduan: formData.validasi_pengaduan,
      recaptcha_verified: formData.captchaVerified ? 1 : 0
    };

    console.log(' Prepared data for database:', JSON.stringify(reportData, null, 2));

    // Insert into database
    const insertReport = db.prepare(`
      INSERT INTO reports (
        kategori_id, deskripsi, tanggal, nama_terduga, nip_terduga, 
        jabatan_terduga, jenis_kelamin, nama, email, telepon, 
        anonim, validasi_pengaduan, recaptcha_verified, kode_aduan
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14
      ) RETURNING id
    `);

    // Generate a simple ticket number based on the timestamp
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const tempId = Date.now(); // Use timestamp for unique ID
    const kodeAduan = `${timestamp}${String(tempId).slice(-5)}`; // Last 5 digits of timestamp

    // Add kode_aduan to reportData
    const reportDataWithKode = {
      ...reportData,
      kode_aduan: kodeAduan
    };

    const result = await insertReport.run([
      reportDataWithKode.kategori_id,
      reportDataWithKode.deskripsi,
      reportDataWithKode.tanggal,
      reportDataWithKode.nama_terduga,
      reportDataWithKode.nip_terduga,
      reportDataWithKode.jabatan_terduga,
      reportDataWithKode.jenis_kelamin,
      reportDataWithKode.nama,
      reportDataWithKode.email,
      reportDataWithKode.telepon,
      reportDataWithKode.anonim,
      reportDataWithKode.validasi_pengaduan,
      reportDataWithKode.recaptcha_verified,
      reportDataWithKode.kode_aduan
    ]);

    console.log('Laporan berhasil disimpan ke database!');
    console.log(' Report ID:', result.lastInsertRowid);
    console.log(' Kode Aduan:', kodeAduan);
    console.log(' Timestamp:', new Date().toISOString());
    console.log('=====================================');

    // Prepare response data matching the expected format
    const responseData = {
      id: result.lastInsertRowid,
      nama_terduga: formData.nama_terduga,
      nip_terduga: formData.nip_terduga || null,
      jabatan_terduga: formData.jabatan_terduga,
      jenis_kelamin: formData.jenis_kelamin,
      kategori_id: formData.kategori_id === 'korupsi' ? 1 : formData.kategori_id === 'gratifikasi' ? 2 : 3,
      deskripsi: formData.deskripsi.trim(),
      validasi_aduan: formData.validasi_pengaduan,
      status_pengaduan_id: 1, // Default status: received/pending
      kode_aduan: kodeAduan,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      bukti: [] // TODO: Will be populated when file upload is implemented
    };

    return NextResponse.json(
      {
        message: "Aduan berhasil disimpan",
        data: responseData
      },
      // { status: 200 } // OK
    );

  } catch (error) {
    console.error('Database error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Something went wrong'
      },
      { status: 500 } // Internal Server Error
    );
  }
}

// Optional: GET method to retrieve reports (for admin/testing purposes)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const getReports = db.prepare(`
      SELECT 
        id, kategori_id, deskripsi, tanggal, nama_terduga, nip_terduga,
        jabatan_terduga, jenis_kelamin, 
        CASE WHEN anonim = 1 THEN 'Anonymous' ELSE nama END as reporter_name,
        CASE WHEN anonim = 1 THEN 'Anonymous' ELSE email END as reporter_email,
        anonim, validasi_pengaduan, recaptcha_verified, status_pengaduan_id,
        kode_aduan, created_at
      FROM reports 
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2
    `);

    const reports = await getReports.all([limit, offset]);
    
    const countQuery = db.prepare('SELECT COUNT(*) as total FROM reports');
    const countResult = await countQuery.get();
    const total = countResult?.total || 0;

    return NextResponse.json({
      success: true,
      data: {
        reports,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      }
    });

  } catch (error) {
    console.error('Database error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch reports',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Something went wrong'
      },
      { status: 500 }
    );
  }
}
