/**
 * Test script to verify Supabase PostgreSQL connection
 * Run this to make sure your connection string is working
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  console.log('🧪 Testing Supabase PostgreSQL connection...');
  
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found in .env.local');
    console.log('Please add your Supabase connection string to .env.local:');
    console.log('DATABASE_URL=postgresql://postgres:your_password@db.your_project_ref.supabase.co:5432/postgres');
    return;
  }
  
  console.log('🔗 Connection string found:', connectionString.replace(/:[^:@]*@/, ':****@'));
  
  // Parse connection string to check components
  try {
    const url = new URL(connectionString);
    console.log('🔍 Connection details:');
    console.log('   Host:', url.hostname);
    console.log('   Port:', url.port);
    console.log('   Database:', url.pathname.substring(1));
    console.log('   Username:', url.username);
  } catch (e) {
    console.error('❌ Invalid connection string format');
    return;
  }
  
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000, // 10 seconds
    idleTimeoutMillis: 30000,
    max: 1 // Use only 1 connection for testing
  });
  
  try {
    console.log('⏳ Attempting to connect...');
    const client = await pool.connect();
    console.log('✅ Successfully connected to Supabase!');
    
    // Test basic query
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('⏰ Database time:', result.rows[0].current_time);
    console.log('🐘 PostgreSQL version:', result.rows[0].pg_version.split(' ')[0]);
    
    // Check if tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('reports', 'report_files')
    `);
    
    const existingTables = tablesResult.rows.map(row => row.table_name);
    
    if (existingTables.length === 0) {
      console.log('📋 No WBS tables found. Run migration next:');
      console.log('   npm run migrate');
    } else {
      console.log('📊 Found tables:', existingTables.join(', '));
      
      // Count records
      const reportCount = await client.query('SELECT COUNT(*) as count FROM reports');
      console.log(`📈 Reports in database: ${reportCount.rows[0].count}`);
    }
    
    client.release();
    console.log('🎉 Connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Full error:', error);
    
    if (error.message.includes('password authentication failed')) {
      console.log('💡 Tip: Check your password in the connection string');
      console.log('💡 Go to Supabase Dashboard > Settings > Database > Reset database password');
    } else if (error.message.includes('does not exist')) {
      console.log('💡 Tip: Verify your project reference in the connection string');
    } else if (error.message.includes('timeout') || error.message.includes('ENOTFOUND')) {
      console.log('💡 Tip: Check your network connection and firewall settings');
      console.log('💡 Try using the pooler connection string instead of direct connection');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Tip: The database might be paused. Check your Supabase dashboard');
    }
  } finally {
    await pool.end();
  }
}

testConnection().catch(console.error);
