import { Pool, PoolClient } from 'pg';

// PostgreSQL connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Database connection wrapper
class DatabaseWrapper {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  // Execute a query with parameters
  async query(text: string, params?: any[]) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  // Prepare a statement (for compatibility with sqlite3 syntax)
  prepare(sql: string) {
    return {
      get: async (params?: any[]) => {
        const result = await this.query(sql, params);
        return result.rows[0] || null;
      },
      all: async (params?: any[]) => {
        const result = await this.query(sql, params);
        return result.rows;
      },
      run: async (params?: any[]) => {
        const result = await this.query(sql, params);
        return {
          changes: result.rowCount || 0,
          lastInsertRowid: result.rows[0]?.id || null
        };
      }
    };
  }

  // Execute multiple statements
  async exec(sql: string) {
    const statements = sql.split(';').filter(stmt => stmt.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        await this.query(statement);
      }
    }
  }
}

// Create database wrapper instance
const db = new DatabaseWrapper(pool);

// Create tables if they don't exist
export async function initDatabase() {
  try {
    // Create reports table
    const createReportsTable = `
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
    `;

    // Create files table for storing file information
    const createFilesTable = `
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
    `;

    await db.exec(createReportsTable);
    await db.exec(createFilesTable);
    
    console.log('PostgreSQL database tables initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Initialize database on import (for development)
if (process.env.NODE_ENV !== 'production') {
  initDatabase().catch(console.error);
}

export default db;
