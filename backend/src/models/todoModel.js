const db = require('../db');

/**
 * Add an event log to the history_logs table in PostgreSQL
 */
const addHistoryLog = async (userId, action, todo, details = '') => {
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
  const todoTitle = todo.title;
  const category = todo.category || 'Other';
  const timestamp = new Date().toISOString();
  const logDetails = details || `Task ${action}`;

  await db.query(
    `INSERT INTO history_logs (id, user_id, todo_id, action, todo_title, category, timestamp, details)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [id, userId, todo.id, action, todoTitle, category, timestamp, logDetails]
  );
};

/**
 * Find all todos for user from PostgreSQL
 */
const findAll = async (userId = 'user_alex') => {
  const result = await db.query(
    `SELECT id, user_id as "userId", title, description, category, due_date as "dueDate", repeat, completed, created_at as "createdAt"
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
    `SELECT id, user_id as "userId", title, description, category, due_date as "dueDate", repeat, completed, created_at as "createdAt"
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
    `SELECT id, user_id as "userId", todo_id as "todoId", action, todo_title as "todoTitle", category, timestamp, details
     FROM history_logs
     WHERE user_id = $1
     ORDER BY timestamp DESC`,
    [userId]
  );
  return result.rows;
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
const create = async (userId = 'user_alex', todoData) => {
  const { title, description, category, dueDate, repeat } = todoData;
  const id = Date.now().toString();
  const cleanTitle = title.trim();
  const cleanDesc = (description || '').trim();
  const cleanCat = (category || 'Other').trim();
  const due = dueDate || '';
  const rep = repeat || 'none';
  const createdAt = new Date().toISOString();

  const result = await db.query(
    `INSERT INTO todos (id, user_id, title, description, category, due_date, repeat, completed, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, user_id as "userId", title, description, category, due_date as "dueDate", repeat, completed, created_at as "createdAt"`,
    [id, userId, cleanTitle, cleanDesc, cleanCat, due, rep, false, createdAt]
  );

  const newTodo = result.rows[0];
  await addHistoryLog(userId, 'created', newTodo, `Task created under category ${newTodo.category}`);
  return newTodo;
};

/**
 * Update a todo for user in PostgreSQL
 */
const update = async (userId = 'user_alex', id, todoData) => {
  const existingTodo = await findById(userId, id);
  if (!existingTodo) return null;

  const { title, description, category, dueDate, completed, repeat } = todoData;

  const updatedTitle = title !== undefined ? title.trim() : existingTodo.title;
  const updatedDesc = description !== undefined ? description.trim() : existingTodo.description;
  const updatedCat = category !== undefined ? category.trim() : existingTodo.category;
  const updatedDue = dueDate !== undefined ? dueDate : existingTodo.dueDate;
  const updatedCompleted = completed !== undefined ? Boolean(completed) : existingTodo.completed;
  const updatedRepeat = repeat !== undefined ? repeat : existingTodo.repeat;

  let newRecurringTodo = null;

  if (updatedCompleted && !existingTodo.completed && updatedRepeat && updatedRepeat !== 'none') {
    const baseDate = updatedDue ? new Date(updatedDue) : new Date();
    const nextDate = new Date(baseDate);
    
    if (updatedRepeat === 'daily') {
      nextDate.setDate(nextDate.getDate() + 1);
    } else if (updatedRepeat === 'weekly') {
      nextDate.setDate(nextDate.getDate() + 7);
    }
    
    const nextDateStr = nextDate.toISOString().split('T')[0];
    const newId = (Date.now() + 1).toString();
    const createdAt = new Date().toISOString();

    const recurringRes = await db.query(
      `INSERT INTO todos (id, user_id, title, description, category, due_date, repeat, completed, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, user_id as "userId", title, description, category, due_date as "dueDate", repeat, completed, created_at as "createdAt"`,
      [newId, userId, updatedTitle, updatedDesc, updatedCat, nextDateStr, updatedRepeat, false, createdAt]
    );
    newRecurringTodo = recurringRes.rows[0];
  }

  const result = await db.query(
    `UPDATE todos
     SET title = $1, description = $2, category = $3, due_date = $4, repeat = $5, completed = $6
     WHERE user_id = $7 AND id = $8
     RETURNING id, user_id as "userId", title, description, category, due_date as "dueDate", repeat, completed, created_at as "createdAt"`,
    [updatedTitle, updatedDesc, updatedCat, updatedDue, updatedRepeat, updatedCompleted, userId, id]
  );

  const updatedTodo = result.rows[0];

  if (updatedTodo.completed && !existingTodo.completed) {
    await addHistoryLog(userId, 'completed', updatedTodo, 'Task marked as completed');
  } else if (!updatedTodo.completed && existingTodo.completed) {
    await addHistoryLog(userId, 'reopened', updatedTodo, 'Task reopened');
  } else {
    await addHistoryLog(userId, 'updated', updatedTodo, 'Task details updated');
  }

  if (newRecurringTodo) {
    await addHistoryLog(userId, 'created', newRecurringTodo, `Next recurring occurrence automatically scheduled (Due: ${newRecurringTodo.dueDate})`);
  }

  return {
    updatedTodo,
    createdRecurring: newRecurringTodo
  };
};

/**
 * Delete a todo for user from PostgreSQL
 */
const remove = async (userId = 'user_alex', id) => {
  const existingTodo = await findById(userId, id);
  if (!existingTodo) return false;

  await db.query('DELETE FROM todos WHERE user_id = $1 AND id = $2', [userId, id]);
  await addHistoryLog(userId, 'deleted', existingTodo, 'Task deleted from board');
  return true;
};

module.exports = {
  findAll,
  findById,
  getHistory,
  clearHistory,
  create,
  update,
  remove
};
