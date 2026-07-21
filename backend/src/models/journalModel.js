const db = require('../db');

const findAll = async (userId) => {
  const result = await db.query(
    `SELECT id, user_id, project_name, objective, work_performed, progress_summary, issues_encountered, resolution, materials_used, time_spent, lessons_learned, next_action, created_at
     FROM daily_journals
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
};

const create = async (userId, data) => {
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
  const createdAt = new Date().toISOString();

  const result = await db.query(
    `INSERT INTO daily_journals (id, user_id, project_name, objective, work_performed, progress_summary, issues_encountered, resolution, materials_used, time_spent, lessons_learned, next_action, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING *`,
    [
      id, userId, 
      data.project_name || '', 
      data.objective || '', 
      data.work_performed || '', 
      data.progress_summary || '', 
      data.issues_encountered || '', 
      data.resolution || '', 
      data.materials_used || '', 
      data.time_spent || '', 
      data.lessons_learned || '', 
      data.next_action || '', 
      createdAt
    ]
  );
  return result.rows[0];
};

const remove = async (userId, id) => {
  const result = await db.query(
    'DELETE FROM daily_journals WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, userId]
  );
  return result.rows.length > 0;
};

module.exports = {
  findAll,
  create,
  remove
};
