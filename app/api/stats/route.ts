// import { NextRequest, NextResponse } from 'next/server';
// import db from '@/lib/database';

// export async function GET(request: NextRequest) {
//   try {
//     // Get category counts from the database
//     const getCategoryCounts = db.prepare(`
//       SELECT 
//         kategori_id,
//         COUNT(*) as count
//       FROM reports 
//       WHERE kategori_id IN ('korupsi', 'gratifikasi', 'benturan-kepentingan')
//       GROUP BY kategori_id
//     `);

//     const categoryCounts = await getCategoryCounts.all() as { kategori_id: string; count: number }[];

//     // Initialize stats with zero values
//     const stats = {
//       korupsi: 0,
//       gratifikasi: 0,
//       'benturan-kepentingan': 0
//     };

//     // Update stats with actual counts from database
//     categoryCounts.forEach(({ kategori_id, count }) => {
//       if (kategori_id in stats) {
//         stats[kategori_id as keyof typeof stats] = count;
//       }
//     });

//     // Get total count for additional info
//     const getTotalCount = db.prepare('SELECT COUNT(*) as total FROM reports');
//     const totalResult = await getTotalCount.get();
//     const total = totalResult?.total || 0;

//     return NextResponse.json({
//       success: true,
//       data: {
//         stats,
//         total,
//         timestamp: new Date().toISOString()
//       }
//     });

//   } catch (error) {
//     console.error('Database error:', error);
    
//     return NextResponse.json(
//       {
//         success: false,
//         message: 'Failed to fetch statistics',
//         error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Something went wrong'
//       },
//       { status: 500 }
//     );
//   }
// }if (!process.env.API_INTAN || !process.env.API_USERNAME || !process.env.API_PASSWORD)
import { NextRequest, NextResponse } from 'next/server';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export async function GET(request: NextRequest) {
  try {
    const baseRaw = process.env.API_INTAN || '';
    const base = baseRaw.replace(/\/$/, ''); // trim trailing slash

    // determine auth header
    let authHeader: Record<string, string> = {};
    if (process.env.API_INTAN_TOKEN) {
      authHeader = { Authorization: `Bearer ${process.env.API_INTAN_TOKEN}` };
    } else if (process.env.API_USERNAME && process.env.API_PASSWORD) {
      const credentials = Buffer.from(`${process.env.API_USERNAME}:${process.env.API_PASSWORD}`).toString('base64');
      authHeader = { Authorization: `Basic ${credentials}` };
    }

    // 1) fetch categories
    const kategoriUrl = `${base}/kategori`;
    const kategoriRes = await fetch(kategoriUrl, { method: 'GET', headers: { ...authHeader } });
    if (!kategoriRes.ok) {
      const body = await kategoriRes.text();
      console.error('Failed to fetch categories:', kategoriRes.status, body);
      throw new Error(`Failed to fetch categories: ${kategoriRes.status}`);
    }
    const kategoris = await kategoriRes.json();

    // 2) for each category fetch count and build result
    const results: Array<{ nama: string; jumlah_pengaduan: number }> = [];
    for (const k of kategoris) {
      const id = k.id;
      const nama = k.nama || String(k.nama || id);
      const countUrl = `${base}/pengaduan/count/${id}`;
      try {
        const res = await fetch(countUrl, { method: 'GET', headers: { ...authHeader } });
        if (!res.ok) {
          const txt = await res.text();
          console.warn(`count for ${nama} returned ${res.status}: ${txt}`);
          results.push({ nama, jumlah_pengaduan: 0 });
          continue;
        }
        const data = await res.json();
        // data may be { kategori_id, jumlah_pengaduan }
        const cnt = parseInt(String(data.jumlah_pengaduan || data.count || 0), 10) || 0;
        results.push({ nama, jumlah_pengaduan: cnt });
      } catch (err) {
        console.error('Error fetching count for', nama, err);
        results.push({ nama, jumlah_pengaduan: 0 });
      }
    }

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch statistics', error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Something went wrong' }, { status: 500 });
  }
}