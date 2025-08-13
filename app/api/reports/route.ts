// import { NextRequest, NextResponse } from 'next/server';

// // Basic mappings – adjust IDs to match INTAN categories if different
// const CATEGORY_MAP: Record<string, number> = {
//   korupsi: 1,
//   gratifikasi: 2,
//   maladministrasi: 3,
// };

// function normalizeJenisKelamin(value: unknown): string {
//   const v = String(value ?? '').toLowerCase().trim();
//   if (v === 'l' || v === 'laki-laki' || v === 'laki laki' || v === 'pria' || v === 'male') {
//     return 'Laki-laki';
//   }
//   if (v === 'p' || v === 'perempuan' || v === 'wanita' || v === 'female') {
//     return 'Perempuan';
//   }
//   // Fallback (INTAN will validate); better to send empty than wrong token
//   return '';
// }

// function normalizeKategoriId(value: unknown): string {
//   if (value == null) return '';
//   const v = String(value).trim();
//   if (/^\d+$/.test(v)) return v; // already numeric
//   const mapped = CATEGORY_MAP[v.toLowerCase()];
//   return mapped ? String(mapped) : '';
// }

// // Only allow/forward fields the INTAN API expects
// const ALLOWED_FIELDS = new Set([
//   'nama_terduga',
//   'nip_terduga',
//   'jabatan_terduga',
//   'jenis_kelamin',
//   'kategori_id',
//   'deskripsi',
//   'validasi_aduan',
//   'status_pengaduan_id', // usually set by server; omitted unless present
//   'nama',
//   'email',
//   'telepon',
// ]);

// function normalizePayload(input: Record<string, unknown>) {
//   const out: Record<string, string> = {};

//   // kategori_id mapping (slug or numeric -> numeric string)
//   if ('kategori_id' in input) {
//     out.kategori_id = normalizeKategoriId(input.kategori_id);
//   }

//   // jenis_kelamin normalization
//   if ('jenis_kelamin' in input) {
//     out.jenis_kelamin = normalizeJenisKelamin(input.jenis_kelamin);
//   }

//   // rename validasi_pengaduan -> validasi_aduan
//   if ('validasi_pengaduan' in input && !('validasi_aduan' in input)) {
//     const v = input.validasi_pengaduan;
//     out.validasi_aduan = v == null ? '' : String(v);
//   }
//   if ('validasi_aduan' in input) {
//     out.validasi_aduan = input.validasi_aduan == null ? '' : String(input.validasi_aduan);
//   }

//   // pass-through selected fields
//   ['nama_terduga','nip_terduga','jabatan_terduga','deskripsi','nama','email','telepon'].forEach((k) => {
//     if (k in input) out[k] = input[k] == null ? '' : String(input[k]);
//   });

//   // Finally keep only allowed keys and non-empty strings (except validasi_aduan which may be required)
//   const filtered: Record<string, string> = {};
//   Object.entries(out).forEach(([k, v]) => {
//     if (!ALLOWED_FIELDS.has(k)) return;
//     if (k === 'validasi_aduan') {
//       filtered[k] = v;
//     } else if (v !== '') {
//       filtered[k] = v;
//     }
//   });

//   return filtered;
// }

// export async function POST(req: NextRequest) {
//   try {
//     if (!process.env.API_INTAN) {
//       throw new Error('API_INTAN environment variable is not set');
//     }

//     const apiUrl = process.env.API_INTAN + '/pengaduan/store';

//     const contentType = req.headers.get('content-type') || '';
//     console.log('[reports POST] Incoming Content-Type:', contentType);

//     // We'll build either URLSearchParams (for JSON) or FormData (for forms)
//     let body: URLSearchParams | FormData;
//     let headers: Record<string, string> = {
//       Accept: 'application/json',
//       Authorization: `Bearer ${process.env.API_INTAN_TOKEN || ''}`,
//     };

//     if (contentType.includes('application/json')) {
//       console.log('[reports POST] Using JSON normalization path');
//       // Client sent JSON; normalize then convert to application/x-www-form-urlencoded for INTAN
//       const json = (await req.json()) as Record<string, unknown>;
//       const normalized = normalizePayload(json);
//       console.log('[reports POST] Normalized (JSON)->x-www-form-urlencoded:', normalized);
//       const params = new URLSearchParams();
//       Object.entries(normalized).forEach(([k, v]) => params.append(k, v));
//       body = params;
//       headers['Content-Type'] = 'application/x-www-form-urlencoded';
//     } else if (
//       contentType.includes('multipart/form-data') ||
//       contentType.includes('application/x-www-form-urlencoded')
//     ) {
//       console.log('[reports POST] Using FormData normalization path');
//       // Client sent a form; convert FormData -> plain object, normalize, then send as FormData
//       const incoming = await req.formData();
//       const plain: Record<string, unknown> = {};
//       for (const [key, value] of incoming.entries()) {
//         if (value instanceof File) {
//           // keep files for forwarding below
//           plain[key] = value;
//         } else {
//           plain[key] = value as string;
//         }
//       }
//       const normalized = normalizePayload(plain);
//       console.log('[reports POST] Normalized (Form)->multipart (scalars only):', normalized);

//       const forward = new FormData();
//       // Append normalized scalar fields
//       Object.entries(normalized).forEach(([k, v]) => forward.append(k, v));
//       // Re-append any files with allowed keys (if INTAN expects e.g., 'bukti[]')
//       // If your frontend sends files under 'bukti', they will still be in incoming
//       let fileCount = 0;
//       for (const [key, value] of incoming.entries()) {
//         if (value instanceof File) {
//           // Assuming API expects 'bukti[]'
//           const fieldName = key.startsWith('bukti') ? key : 'bukti[]';
//           forward.append(fieldName, value, value.name);
//           fileCount++;
//         }
//       }
//       console.log(`[reports POST] Attached files: ${fileCount}`);

//       body = forward;
//       // Do NOT set Content-Type; fetch will set proper multipart boundary
//     } else {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             'Unsupported Content-Type. Use application/json, multipart/form-data, or application/x-www-form-urlencoded.',
//         },
//         { status: 400 }
//       );
//     }

//     const res = await fetch(apiUrl, {
//       method: 'POST',
//       headers,
//       body,
//     });

//     if (!res.ok) {
//       const errorText = await res.text();
//       console.error('INTAN API Error:', {
//         endpoint: apiUrl,
//         status: res.status,
//         statusText: res.statusText,
//         body: errorText,
//       });
//       return NextResponse.json(
//         { success: false, message: 'Upstream API error', details: errorText },
//         { status: res.status }
//       );
//     }

//     const data = await res.json();
//     return NextResponse.json(data, { status: res.status });
//   } catch (error) {
//     console.error('API error:', error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: 'Internal server error',
//         error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Something went wrong',
//       },
//       { status: 500 }
//     );
//   }
// }

// export async function GET(request: NextRequest) {
//   try {
//     if (!process.env.API_INTAN) {
//       throw new Error('API_INTAN environment variable is not set');
//     }

//     const { searchParams } = new URL(request.url);
//     const apiUrl = process.env.API_INTAN + '/pengaduan/search';

//     // Forward the search query to INTAN API
//     const res = await fetch(apiUrl + '?' + searchParams.toString(), {
//       headers: {
//         Accept: 'application/json',
//         Authorization: `Bearer ${process.env.API_INTAN_TOKEN || ''}`,
//       },
//     });

//     if (!res.ok) {
//       const errorText = await res.text();
//       console.error('INTAN API Error:', {
//         status: res.status,
//         statusText: res.statusText,
//         body: errorText,
//       });
//       throw new Error(`API request failed: ${res.status} ${res.statusText}`);
//     }

//     const data = await res.json();
//     return NextResponse.json(data, { status: res.status });
//   } catch (error) {
//     console.error('API error:', error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: 'Failed to fetch reports',
//         error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Something went wrong',
//       },
//       { status: 500 }
//     );
//   }
// }
import { NextRequest, NextResponse } from 'next/server';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Basic mappings – adjust IDs to match INTAN categories if different
const CATEGORY_MAP: Record<string, number> = {
  korupsi: 1,
  gratifikasi: 2,
  'benturan-kepentingan': 3,
};

function normalizeJenisKelamin(value: unknown): string {
  const v = String(value ?? '').toLowerCase().trim();
  if (v === 'l' || v === 'laki-laki' || v === 'laki laki' || v === 'pria' || v === 'male') {
    return 'Laki-laki';
  }
  if (v === 'p' || v === 'perempuan' || v === 'wanita' || v === 'female') {
    return 'Perempuan';
  }
  
  return '';
}

function normalizeKategoriId(value: unknown): string {
  console.log('[normalizeKategoriId] Input value:', value, 'Type:', typeof value);
  if (value == null) return '';
  const v = String(value).trim();
  console.log('[normalizeKategoriId] String value:', v);
  if (/^\d+$/.test(v)) {
    console.log('[normalizeKategoriId] Already numeric, returning:', v);
    return v; 
  }
  const mapped = CATEGORY_MAP[v.toLowerCase()];
  console.log('[normalizeKategoriId] Mapped value:', mapped, 'for key:', v.toLowerCase());
  return mapped ? String(mapped) : '';
}


const ALLOWED_FIELDS = new Set([
  'nama_terduga',
  'nip_terduga',
  'jabatan_terduga',
  'jenis_kelamin',
  'kategori_id',
  'deskripsi',
  'validasi_aduan',
  'status_pengaduan_id', 
  'nama',
  'email',
  'telepon',
]);

function normalizePayload(input: Record<string, unknown>) {
  console.log('[normalizePayload] Input:', input);
  const out: Record<string, string> = {};

  // kategori_id mapping (slug or numeric -> numeric string)
  if ('kategori_id' in input) {
    out.kategori_id = normalizeKategoriId(input.kategori_id);
  }

  // jenis_kelamin normalization
  if ('jenis_kelamin' in input) {
    out.jenis_kelamin = normalizeJenisKelamin(input.jenis_kelamin);
  }

  // rename validasi_pengaduan -> validasi_aduan
  if ('validasi_pengaduan' in input && !('validasi_aduan' in input)) {
    const v = input.validasi_pengaduan;
    out.validasi_aduan = v == null ? '' : String(v);
  }
  if ('validasi_aduan' in input) {
    out.validasi_aduan = input.validasi_aduan == null ? '' : String(input.validasi_aduan);
  }

  // pass-through selected fields
  ['nama_terduga','nip_terduga','jabatan_terduga','deskripsi','nama','email','telepon'].forEach((k) => {
    if (k in input) out[k] = input[k] == null ? '' : String(input[k]);
  });

  // keep only allowed keys and non-empty strings (except validasi_aduan which may be required)
  const filtered: Record<string, string> = {};
  Object.entries(out).forEach(([k, v]) => {
    if (!ALLOWED_FIELDS.has(k)) return;
    if (k === 'validasi_aduan') {
      filtered[k] = v;
    } else if (v !== '') {
      filtered[k] = v;
    }
  });

  console.log('[normalizePayload] Filtered output:', filtered);
  return filtered;
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.API_INTAN) {
      throw new Error('API_INTAN environment variable is not set');
    }

    const apiUrl = process.env.API_INTAN + '/pengaduan/store';

    const contentType = req.headers.get('content-type') || '';
    console.log('[reports POST] Incoming Content-Type:', contentType);

   
    let body: URLSearchParams | FormData;
    let headers: Record<string, string> = {
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.API_INTAN_TOKEN || ''}`,
    };

    if (contentType.includes('application/json')) {
      //console.log('[reports POST] Using JSON normalization path');
  
      const json = (await req.json()) as Record<string, unknown>;
      const normalized = normalizePayload(json);
      console.log('[reports POST] Normalized (JSON)->x-www-form-urlencoded:', normalized);
      const params = new URLSearchParams();
      Object.entries(normalized).forEach(([k, v]) => params.append(k, v));
      body = params;
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    } else if (
      contentType.includes('multipart/form-data') ||
      contentType.includes('application/x-www-form-urlencoded')
    ) {
      //console.log('[reports POST] Using FormData normalization path');
      const incoming = await req.formData();
      const plain: Record<string, unknown> = {};
      for (const [key, value] of incoming.entries()) {
        if (value instanceof File) {
          // keep files for forwarding below
          plain[key] = value;
        } else {
          plain[key] = value as string;
        }
      }
      const normalized = normalizePayload(plain);
      //console.log('[reports POST] Normalized (Form)->multipart (scalars only):', normalized);

      const forward = new FormData();
      // Append normalized scalar fields
      Object.entries(normalized).forEach(([k, v]) => forward.append(k, v));
      let fileCount = 0;
      for (const [key, value] of incoming.entries()) {
        if (value instanceof File) {
          // Assuming API expects 'bukti[]'
          const fieldName = key.startsWith('bukti') ? key : 'bukti[]';
          forward.append(fieldName, value, value.name);
          fileCount++;
        }
      }
      console.log(`[reports POST] Attached files: ${fileCount}`);

      body = forward;
      // Do NOT set Content-Type; fetch will set proper multipart boundary
    } else {
      return NextResponse.json(
        {
          success: false,
          message:
            'Unsupported Content-Type. Use application/json, multipart/form-data, or application/x-www-form-urlencoded.',
        },
        { status: 400 }
      );
    }

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('INTAN API Error:', {
        endpoint: apiUrl,
        status: res.status,
        statusText: res.statusText,
        body: errorText,
      });
      return NextResponse.json(
        { success: false, message: 'Upstream API error', details: errorText },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Something went wrong',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!process.env.API_INTAN || !process.env.API_USERNAME || !process.env.API_PASSWORD) {
      throw new Error('API_INTAN environment variable is not set');
    }

    const { searchParams } = new URL(request.url);
    const apiUrl = process.env.API_INTAN + '/pengaduan/search';

    // Forward the search query to INTAN API
    const res = await fetch(apiUrl + '?' + searchParams.toString(), {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${process.env.API_INTAN_TOKEN || ''}`,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('INTAN API Error:', {
        status: res.status,
        statusText: res.statusText,
        body: errorText,
      });
      throw new Error(`API request failed: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch reports',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Something went wrong',
      },
      { status: 500 }
    );
  }
}