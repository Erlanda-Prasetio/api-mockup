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

export async function GET(request: NextRequest) {
  try {
    // Get category counts from the official API
    const apiUrl = process.env.API_INTAN || process.env.API_USERNAME || process.env.API_PASSWORD + '/pengaduan/count';
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const categoryCountsData = await response.json();
    
    // Initialize stats with zero values (keeping your existing structure)
    const stats = {
      korupsi: 0,
      gratifikasi: 0,
      'benturan-kepentingan': 0
    };

    // Map the API response to your existing stats format
    // The API response structure may vary, so we handle multiple possible formats
    let categoryCounts: { kategori_id: string; count: number }[] = [];
    
    if (Array.isArray(categoryCountsData)) {
      categoryCounts = categoryCountsData;
    } else if (categoryCountsData.data && Array.isArray(categoryCountsData.data)) {
      categoryCounts = categoryCountsData.data;
    } else if (categoryCountsData.counts && Array.isArray(categoryCountsData.counts)) {
      categoryCounts = categoryCountsData.counts;
    }

    // Update stats with actual counts from API response
    categoryCounts.forEach(({ kategori_id, count }) => {
      // Handle both numeric IDs and string names
      const id = String(kategori_id).toLowerCase();
      
      if (id === '1' || id === 'korupsi') {
        stats.korupsi = count;
      } else if (id === '2' || id === 'gratifikasi') {
        stats.gratifikasi = count;
      } else if (id === '3' || id === 'benturan-kepentingan' || id === 'maladministrasi') {
        stats['benturan-kepentingan'] = count;
      }
    });

    // Calculate total count
    const total = stats.korupsi + stats.gratifikasi + stats['benturan-kepentingan'];

    return NextResponse.json({
      success: true,
      data: {
        stats,
        total,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Stats API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch statistics',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Something went wrong'
      },
      { status: 500 }
    );
  }
}