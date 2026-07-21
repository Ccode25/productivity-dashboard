const db = require('../db');

/**
 * Add an event log to the history_logs table in PostgreSQL
 */
const addHistoryLog = async (id, userId, todoId, action, todoTitle, category, timestamp, logDetails, changesJson, snapshotJson) => {
  await db.query(
    `INSERT INTO history_logs (id, user_id, todo_id, action, todo_title, category, timestamp, details, changes, snapshot)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [id, userId, todoId, action, todoTitle, category, timestamp, logDetails, changesJson, snapshotJson]
  );
};

/**
 * Find all todos for user from PostgreSQL
 */
const findAll = async (userId = 'user_alex') => {
  const result = await db.query(
    `SELECT id, user_id as "userId", title, description, category, due_date as "dueDate", priority, repeat, completed, created_at as "createdAt"
     FROM todos
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
};

/**
 * Find a todo by ID for user from PostgreSQL
 */
const findById = async (userId = 'user_alex', id) => {
  const result = await db.query(
    `SELECT id, user_id as "userId", title, description, category, due_date as "dueDate", priority, repeat, completed, created_at as "createdAt"
     FROM todos
     WHERE user_id = $1 AND id = $2`,
    [userId, id]
  );
  return result.rows[0] || null;
};

/**
 * Get history logs for user from PostgreSQL
 */
const getHistory = async (userId = 'user_alex') => {
  const result = await db.query(
    `SELECT id, user_id as "userId", todo_id as "todoId", action, todo_title as "todoTitle", category, timestamp, details, changes, snapshot
     FROM history_logs
     WHERE user_id = $1
     ORDER BY timestamp DESC`,
    [userId]
  );
  
  // Parse changes if they come back as a string from the DB or mock DB
  return result.rows.map(row => ({
    ...row,
    changes: typeof row.changes === 'string' ? JSON.parse(row.changes) : (row.changes || []),
    snapshot: typeof row.snapshot === 'string' ? JSON.parse(row.snapshot) : (row.snapshot || null)
  }));
};

/**
 * Clear history logs for user from PostgreSQL
 */
const clearHistory = async (userId = 'user_alex') => {
  await db.query('DELETE FROM history_logs WHERE user_id = $1', [userId]);
  return true;
};

/**
 * Create a new todo for user in PostgreSQL
 */
const create = async (todoData) => {
  const { id, userId, title, description, category, dueDate, priority, repeat, completed, createdAt } = todoData;
  const result = await db.query(
    `INSERT INTO todos (id, user_id, title, description, category, due_date, priority, repeat, completed, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id, user_id as "userId", title, description, category, due_date as "dueDate", priority, repeat, completed, created_at as "createdAt"`,
    [id, userId, title, description, category, dueDate, priority, repeat, completed, createdAt]
  );
  return result.rows[0];
};

/**
 * Update a todo for user in PostgreSQL
 */
const update = async (userId, id, todoData) => {
  const { title, description, category, dueDate, priority, repeat, completed } = todoData;

  const result = await db.query(
    `UPDATE todos
     SET title = $1, description = $2, category = $3, due_date = $4, priority = $5, repeat = $6, completed = $7
     WHERE user_id = $8 AND id = $9
     RETURNING id, user_id as "userId", title, description, category, due_date as "dueDate", priority, repeat, completed, created_at as "createdAt"`,
    [title, description, category, dueDate, priority, repeat, completed, userId, id]
  );

  return result.rows[0];
};

/**
 * Delete a todo for user from PostgreSQL
 */
const remove = async (userId = 'user_alex', id) => {
  await db.query('DELETE FROM todos WHERE user_id = $1 AND id = $2', [userId, id]);
};

module.exports = {
  addHistoryLog,
  findAll,
  findById,
  getHistory,
  clearHistory,
  create,
  update,
  remove
};
