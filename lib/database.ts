import Database from 'better-sqlite3';
import path from 'path';

// Initialize SQLite database
const dbPath = path.join(process.cwd(), 'wbs_reports.db');
const db = new Database(dbPath);

// Create tables if they don't exist
export function initDatabase() {
  // Create reports table
  const createReportsTable = `
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Create files table for storing file information
  const createFilesTable = `
    CREATE TABLE IF NOT EXISTS report_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (report_id) REFERENCES reports (id) ON DELETE CASCADE
    )
  `;

  db.exec(createReportsTable);
  db.exec(createFilesTable);
  
  // Add new columns to existing reports table if they don't exist
  try {
    db.exec('ALTER TABLE reports ADD COLUMN status_pengaduan_id INTEGER DEFAULT 1');
  } catch (e) {
    // Column already exists
  }
  
  try {
    db.exec('ALTER TABLE reports ADD COLUMN notes TEXT');
  } catch (e) {
    // Column already exists
  }
  
  try {
    db.exec('ALTER TABLE reports ADD COLUMN kode_aduan TEXT');
  } catch (e) {
    // Column already exists
  }
  
  try {
    db.exec('ALTER TABLE reports ADD COLUMN auditor_id INTEGER');
  } catch (e) {
    // Column already exists
  }
  
  try {
    db.exec('ALTER TABLE reports ADD COLUMN file_rekomendasi TEXT');
  } catch (e) {
    // Column already exists
  }
  
  console.log('Database tables initialized successfully');
}

// Initialize database on import
initDatabase();

export default db;
