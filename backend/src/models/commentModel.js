const db = require('../db');

const findAllByTask = async (taskId) => {
  const result = await db.query(
    `SELECT id, task_id, user_id, comment_text, created_at
     FROM task_comments
     WHERE task_id = $1
     ORDER BY created_at ASC`,
    [taskId]
  );
  return result.rows;
};

const create = async (userId, data) => {
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
  const createdAt = new Date().toISOString();

  const result = await db.query(
    `INSERT INTO task_comments (id, task_id, user_id, comment_text, created_at)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [id, data.task_id, userId, data.comment_text, createdAt]
  );
  return result.rows[0];
};

module.exports = {
  findAllByTask,
  create
};
