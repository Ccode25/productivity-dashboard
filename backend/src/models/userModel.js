const db = require('../db');

/**
 * Finds user by ID from PostgreSQL
 */
const findById = async (id) => {
  const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
};

/**
 * Finds user by Email from PostgreSQL
 */
const findByEmail = async (email) => {
  const cleanEmail = email.trim().toLowerCase();
  const result = await db.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [cleanEmail]);
  return result.rows[0] || null;
};

/**
 * Finds user by Refresh Token
 */
const findByRefreshToken = async (refreshToken) => {
  const result = await db.query('SELECT * FROM users WHERE refresh_token = $1', [refreshToken]);
  return result.rows[0] || null;
};

/**
 * Finds user by Reset Token
 */
const findByResetToken = async (resetToken) => {
  const result = await db.query('SELECT * FROM users WHERE reset_token = $1', [resetToken]);
  return result.rows[0] || null;
};

/**
 * Creates a brand new user account in PostgreSQL
 */
const createUser = async (userData) => {
  const { id, name, email, passwordHash, role, avatar, verificationCode, provider } = userData;
  
  const result = await db.query(
    `INSERT INTO users (id, name, email, password_hash, role, avatar, is_email_verified, verification_code, refresh_token, google_id, provider, reset_token, reset_token_expires)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
    [id, name, email, passwordHash, role, avatar, false, verificationCode, null, null, provider, null, null]
  );
  
  return result.rows[0];
};

/**
 * Updates a user to be email verified
 */
const updateEmailVerification = async (id) => {
  await db.query('UPDATE users SET is_email_verified = TRUE, verification_code = NULL WHERE id = $1', [id]);
};

/**
 * Updates a user's refresh token
 */
const updateRefreshToken = async (id, refreshToken) => {
  await db.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [refreshToken, id]);
};

/**
 * Updates a user's password reset token and expiry
 */
const updateResetToken = async (email, resetToken, expiresAt) => {
  await db.query(
    'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3',
    [resetToken, expiresAt, email]
  );
};

/**
 * Resets password and clears reset token fields
 */
const updatePasswordAndClearResetToken = async (resetToken, passwordHash) => {
  await db.query(
    'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE reset_token = $2',
    [passwordHash, resetToken]
  );
};

/**
 * List all preset demo users from PostgreSQL
 */
const getDemoUsers = async () => {
  const result = await db.query("SELECT id, name, email, role, avatar, is_email_verified, created_at FROM users WHERE provider = 'demo'");
  return result.rows;
};

module.exports = {
  findById,
  findByEmail,
  findByRefreshToken,
  findByResetToken,
  createUser,
  updateEmailVerification,
  updateRefreshToken,
  updateResetToken,
  updatePasswordAndClearResetToken,
  getDemoUsers
};
