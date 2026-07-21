const db = require('../db');

/**
 * Define the schema organized by table domain.
 * This structure prepares us for future lightweight migration tracking
 * without requiring a heavy third-party library yet.
 */
const schema = {
  users: [
    `CREATE TABLE IF NOT EXISTS users (
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
      reset_token TEXT,
      reset_token_expires TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP WITH TIME ZONE`
  ],
  todos: [
    `CREATE TABLE IF NOT EXISTS todos (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category VARCHAR(100) DEFAULT 'Other',
      due_date VARCHAR(50),
      priority VARCHAR(50) DEFAULT 'medium',
      repeat VARCHAR(50) DEFAULT 'none',
      completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )`,
    `ALTER TABLE todos ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'medium'`
  ],
  history_logs: [
    `CREATE TABLE IF NOT EXISTS history_logs (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      todo_id VARCHAR(255),
      action VARCHAR(100) NOT NULL,
      todo_title TEXT NOT NULL,
      category VARCHAR(100),
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      details TEXT,
      changes TEXT,
      snapshot TEXT
    )`,
    `ALTER TABLE history_logs ADD COLUMN IF NOT EXISTS changes TEXT`,
    `ALTER TABLE history_logs ADD COLUMN IF NOT EXISTS snapshot TEXT`
  ],
  daily_journals: [
    `CREATE TABLE IF NOT EXISTS daily_journals (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      project_name TEXT,
      objective TEXT,
      work_performed TEXT,
      progress_summary TEXT,
      issues_encountered TEXT,
      resolution TEXT,
      materials_used TEXT,
      time_spent TEXT,
      lessons_learned TEXT,
      next_action TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )`
  ],
  task_comments: [
    `CREATE TABLE IF NOT EXISTS task_comments (
      id VARCHAR(255) PRIMARY KEY,
      task_id VARCHAR(255) NOT NULL,
      user_id VARCHAR(255) NOT NULL,
      comment_text TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )`
  ]
};

/**
 * Initializes PostgreSQL database tables if they do not exist
 */
async function initDb() {
  try {
    for (const [tableName, queries] of Object.entries(schema)) {
      for (const query of queries) {
        await db.query(query);
      }
    }
    
    console.log('[DATABASE] 🛠️ Database schema & table structures initialized.');
  } catch (err) {
    console.warn('[DATABASE] Schema initialization notice:', err.message);
  }
}

module.exports = initDb;
