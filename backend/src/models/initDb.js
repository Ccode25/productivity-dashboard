const db = require('../db');

/**
 * Initializes PostgreSQL database tables if they do not exist
 */
async function initDb() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        role TEXT,
        avatar TEXT,
        is_email_verified BOOLEAN DEFAULT FALSE,
        verification_code VARCHAR(10),
        refresh_token TEXT,
        google_id TEXT,
        provider TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS todos (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        category VARCHAR(100) DEFAULT 'Other',
        due_date VARCHAR(50),
        repeat VARCHAR(50) DEFAULT 'none',
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS history_logs (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        todo_id VARCHAR(255),
        action VARCHAR(100) NOT NULL,
        todo_title TEXT NOT NULL,
        category VARCHAR(100),
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        details TEXT
      );
    `);
    console.log('[DATABASE] 🛠️ Database schema & table structures initialized.');
  } catch (err) {
    console.warn('[DATABASE] Schema initialization notice:', err.message);
  }
}

module.exports = initDb;
