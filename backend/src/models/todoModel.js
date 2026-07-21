const db = require('../db');

/**
 * Add an event log to the history_logs table in PostgreSQL
 */
const addHistoryLog = async (userId, action, todo, details = '', changes = []) => {
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
  const todoTitle = todo.title;
  const category = todo.category || 'Other';
  const timestamp = new Date().toISOString();
  const logDetails = details || `Task ${action}`;
  const changesJson = JSON.stringify(changes);
  
  const snapshotJson = (action === 'completed') ? JSON.stringify({
    priority: todo.priority || 'medium',
    status: 'Completed',
    description: todo.description || ''
  }) : null;

  await db.query(
    `INSERT INTO history_logs (id, user_id, todo_id, action, todo_title, category, timestamp, details, changes, snapshot)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [id, userId, todo.id, action, todoTitle, category, timestamp, logDetails, changesJson, snapshotJson]
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
const create = async (userId = 'user_alex', todoData) => {
  const { title, description, category, dueDate, priority, repeat } = todoData;
  const id = Date.now().toString();
  const cleanTitle = title.trim();
  const cleanDesc = (description || '').trim();
  const cleanCat = (category || 'Other').trim();
  const due = dueDate || '';
  const prio = priority || 'medium';
  const rep = repeat || 'none';
  const createdAt = new Date().toISOString();

  const result = await db.query(
    `INSERT INTO todos (id, user_id, title, description, category, due_date, priority, repeat, completed, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id, user_id as "userId", title, description, category, due_date as "dueDate", priority, repeat, completed, created_at as "createdAt"`,
    [id, userId, cleanTitle, cleanDesc, cleanCat, due, prio, rep, false, createdAt]
  );

  const newTodo = result.rows[0];
  const dueInfo = newTodo.dueDate ? `, Due: ${newTodo.dueDate}` : '';
  const prioInfo = `, Priority: ${newTodo.priority || 'medium'}`;
  await addHistoryLog(userId, 'created', newTodo, `Task created under category "${newTodo.category}"${prioInfo}${dueInfo}`);
  return newTodo;
};

/**
 * Update a todo for user in PostgreSQL
 */
const update = async (userId = 'user_alex', id, todoData) => {
  const existingTodo = await findById(userId, id);
  if (!existingTodo) return null;

  const { title, description, category, dueDate, priority, completed, repeat } = todoData;

  const updatedTitle = title !== undefined ? title.trim() : existingTodo.title;
  const updatedDesc = description !== undefined ? description.trim() : existingTodo.description;
  const updatedCat = category !== undefined ? category.trim() : existingTodo.category;
  const updatedDue = dueDate !== undefined ? dueDate : existingTodo.dueDate;
  const updatedPrio = priority !== undefined ? priority : existingTodo.priority;
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
      `INSERT INTO todos (id, user_id, title, description, category, due_date, priority, repeat, completed, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, user_id as "userId", title, description, category, due_date as "dueDate", priority, repeat, completed, created_at as "createdAt"`,
      [newId, userId, updatedTitle, updatedDesc, updatedCat, nextDateStr, updatedPrio, updatedRepeat, false, createdAt]
    );
    newRecurringTodo = recurringRes.rows[0];
  }

  const result = await db.query(
    `UPDATE todos
     SET title = $1, description = $2, category = $3, due_date = $4, priority = $5, repeat = $6, completed = $7
     WHERE user_id = $8 AND id = $9
     RETURNING id, user_id as "userId", title, description, category, due_date as "dueDate", priority, repeat, completed, created_at as "createdAt"`,
    [updatedTitle, updatedDesc, updatedCat, updatedDue, updatedPrio, updatedRepeat, updatedCompleted, userId, id]
  );

  const updatedTodo = result.rows[0];

  const changes = [];
  
  if (updatedTodo.title !== existingTodo.title) {
    changes.push({ field: 'Title', old: existingTodo.title, new: updatedTodo.title });
  }
  if (updatedTodo.description !== existingTodo.description) {
    changes.push({ field: 'Description', old: existingTodo.description, new: updatedTodo.description });
  }
  if (updatedTodo.category !== existingTodo.category) {
    changes.push({ field: 'Category', old: existingTodo.category, new: updatedTodo.category });
  }
  if (updatedTodo.dueDate !== existingTodo.dueDate) {
    changes.push({ field: 'Due Date', old: existingTodo.dueDate, new: updatedTodo.dueDate });
  }
  if (updatedTodo.priority !== existingTodo.priority) {
    changes.push({ field: 'Priority', old: existingTodo.priority, new: updatedTodo.priority });
  }
  if (updatedTodo.repeat !== existingTodo.repeat) {
    changes.push({ field: 'Repeat', old: existingTodo.repeat, new: updatedTodo.repeat });
  }

  if (updatedTodo.completed && !existingTodo.completed) {
    await addHistoryLog(userId, 'completed', updatedTodo, `Task completed`, changes);
  } else if (!updatedTodo.completed && existingTodo.completed) {
    await addHistoryLog(userId, 'reopened', updatedTodo, 'Task reopened', changes);
  } else if (changes.length > 0) {
    await addHistoryLog(userId, 'updated', updatedTodo, `Task details updated`, changes);
  }

  if (newRecurringTodo) {
    await addHistoryLog(userId, 'created', newRecurringTodo, `Next recurring occurrence automatically scheduled (Due: ${newRecurringTodo.dueDate})`, []);
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
  const dueInfo = existingTodo.dueDate ? `, Due: ${existingTodo.dueDate}` : '';
  const prioInfo = `, Priority: ${existingTodo.priority || 'medium'}`;
  await addHistoryLog(userId, 'deleted', existingTodo, `Task deleted from board (Category: ${existingTodo.category}${prioInfo}${dueInfo})`);
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
