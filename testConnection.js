const pool = require('./models/db');

async function testConnection() {
  try {
    const [rows] = await pool.query('SELECT 1');
    console.log('✅ MySQL Connected!');
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  }
}

testConnection();
