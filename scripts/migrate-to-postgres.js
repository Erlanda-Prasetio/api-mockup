/**
 * Migration script to set up PostgreSQL database for WBS application
 * 
 * This script creates the necessary tables for the Whistle Blowing System
 * Run this after setting up your PostgreSQL database connection
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting PostgreSQL migration for WBS...');
    
    // Create reports table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        kategori_id TEXT NOT NULL,
        deskripsi TEXT NOT NULL,
        tanggal TEXT NOT NULL,
        nama_terduga TEXT NOT NULL,
        nip_terduga TEXT,
        jabatan_terduga TEXT NOT NULL,
        jenis_kelamin TEXT NOT NULL,
        nama TEXT,
        email TEXT,
        telepon TEXT,
        anonim INTEGER NOT NULL DEFAULT 0,
        validasi_pengaduan INTEGER NOT NULL DEFAULT 0,
        recaptcha_verified INTEGER NOT NULL DEFAULT 0,
        status_pengaduan_id INTEGER NOT NULL DEFAULT 1,
        notes TEXT,
        kode_aduan TEXT,
        auditor_id INTEGER,
        file_rekomendasi TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Reports table created successfully');
    
    // Create report_files table
    await client.query(`
      CREATE TABLE IF NOT EXISTS report_files (
        id SERIAL PRIMARY KEY,
        report_id INTEGER NOT NULL,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        mime_type TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (report_id) REFERENCES reports (id) ON DELETE CASCADE
      )
    `);
    
    console.log('✅ Report_files table created successfully');
    
    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_reports_kategori_id ON reports(kategori_id);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_reports_kode_aduan ON reports(kode_aduan);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
    `);
    
    console.log('✅ Indexes created successfully');
    
    // Insert sample data for testing (optional)
    const sampleData = await client.query(`
      SELECT COUNT(*) as count FROM reports
    `);
    
    if (sampleData.rows[0].count == 0) {
      await client.query(`
        INSERT INTO reports (
          kategori_id, deskripsi, tanggal, nama_terduga, jabatan_terduga, 
          jenis_kelamin, anonim, validasi_pengaduan, recaptcha_verified,
          kode_aduan, status_pengaduan_id
        ) VALUES 
        ('korupsi', 'Sample corruption report for testing', '2025-01-01', 'John Doe', 'Sample Position', 'laki-laki', 1, 1, 1, 'TEST001', 1),
        ('gratifikasi', 'Sample gratification report for testing', '2025-01-02', 'Jane Smith', 'Another Position', 'perempuan', 0, 1, 1, 'TEST002', 1),
        ('benturan-kepentingan', 'Sample conflict of interest report', '2025-01-03', 'Bob Johnson', 'Third Position', 'laki-laki', 1, 1, 1, 'TEST003', 2)
      `);
      
      console.log('✅ Sample data inserted successfully');
    } else {
      console.log('ℹ️  Database already contains data, skipping sample data insertion');
    }
    
    console.log('🎉 Migration completed successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Update your .env.local file with your PostgreSQL connection string');
    console.log('2. Test your application with: npm run dev');
    console.log('3. Deploy to Vercel with Vercel Postgres integration');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration
runMigration().catch((error) => {
  console.error('Migration script failed:', error);
  process.exit(1);
});
