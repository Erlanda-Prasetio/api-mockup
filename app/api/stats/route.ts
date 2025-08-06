import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Get category counts from the database
    const getCategoryCounts = db.prepare(`
      SELECT 
        kategori_id,
        COUNT(*) as count
      FROM reports 
      WHERE kategori_id IN ('korupsi', 'gratifikasi', 'benturan-kepentingan')
      GROUP BY kategori_id
    `);

    const categoryCounts = getCategoryCounts.all() as { kategori_id: string; count: number }[];

    // Initialize stats with zero values
    const stats = {
      korupsi: 0,
      gratifikasi: 0,
      'benturan-kepentingan': 0
    };

    // Update stats with actual counts from database
    categoryCounts.forEach(({ kategori_id, count }) => {
      if (kategori_id in stats) {
        stats[kategori_id as keyof typeof stats] = count;
      }
    });

    // Get total count for additional info
    const getTotalCount = db.prepare('SELECT COUNT(*) as total FROM reports');
    const { total } = getTotalCount.get() as { total: number };

    return NextResponse.json({
      success: true,
      data: {
        stats,
        total,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Database error:', error);
    
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
