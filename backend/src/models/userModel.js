const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'antigravity_todo_jwt_secret_key_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'antigravity_todo_refresh_secret_key_2026';

/**
 * Generates short-lived Access Token (15 minutes) for API authorization
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      tokenType: 'access',
      jti: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
};

/**
 * Generates long-lived Refresh Token (7 days) for token rotation
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      tokenType: 'refresh',
      jti: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * Finds user by ID from PostgreSQL
 */
const findUserById = async (id) => {
  const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
  if (!result.rows[0]) return null;
  const { password_hash, refresh_token, ...safeUser } = result.rows[0];
  return safeUser;
};

/**
 * Finds user by Email from PostgreSQL
 */
const findUserByEmail = async (email) => {
  const cleanEmail = email.trim().toLowerCase();
  const result = await db.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [cleanEmail]);
  return result.rows[0] || null;
};

/**
 * Creates a brand new user account in PostgreSQL with 6-digit Email Verification Code
 */
const createUserAccount = async (name, email, password, role) => {
  const cleanEmail = email.trim().toLowerCase();
  
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const existing = await findUserByEmail(cleanEmail);
  if (existing) {
    throw new Error('An account with this email address already exists.');
  }

  const id = `user_reg_${Date.now()}`;
  const userRole = role && role.trim() ? role.trim() : 'Project Member';
  const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanEmail}`;
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Generate random 6-digit verification code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  const result = await db.query(
    `INSERT INTO users (id, name, email, password_hash, role, avatar, is_email_verified, verification_code, refresh_token, google_id, provider, reset_token, reset_token_expires)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id, name, email, role, avatar, is_email_verified, verification_code, created_at, reset_token, reset_token_expires`,
    [id, name.trim(), cleanEmail, passwordHash, userRole, avatar, false, verificationCode, null, null, 'register', null, null]
  );

  const user = result.rows[0];
  const { password_hash, ...safeUser } = user;

  return {
    user: safeUser,
    verificationCode
  };
};

/**
 * Verifies 6-digit Email Verification Code
 */
const verifyEmailCode = async (email, code) => {
  const cleanEmail = email.trim().toLowerCase();
  const user = await findUserByEmail(cleanEmail);

  if (!user) {
    throw new Error('User account not found.');
  }

  if (user.is_email_verified) {
    return { message: 'Email is already verified. You can log in directly.', user };
  }

  if (String(user.verification_code).trim() !== String(code).trim()) {
    throw new Error('Invalid verification code. Please check your code and try again.');
  }

  // Update account as verified
  await db.query('UPDATE users SET is_email_verified = TRUE, verification_code = NULL WHERE id = $1', [user.id]);
  user.is_email_verified = true;

  const { password_hash, refresh_token, ...safeUser } = user;
  return { message: 'Email successfully verified! You can now log in.', user: safeUser };
};

/**
 * Authenticates email + password user via bcrypt and issues Access Token + Refresh Token
 */
const loginWithEmailPassword = async (email, password) => {
  const cleanEmail = email.trim().toLowerCase();
  const user = await findUserByEmail(cleanEmail);

  if (!user) {
    throw new Error('Invalid email address or password.');
  }

  if (user.password_hash) {
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error('Invalid email address or password.');
    }
  }

  // Ensure account email is verified
  if (!user.is_email_verified) {
    throw new Error(`Email address not verified yet. Verification code is: ${user.verification_code || '123456'}`);
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Save refresh token in database
  await db.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [refreshToken, user.id]);

  const { password_hash, refresh_token: rToken, ...safeUser } = user;

  return {
    accessToken,
    refreshToken,
    user: safeUser
  };
};

/**
 * Rotates Refresh Token to issue a fresh Access Token + Refresh Token pair
 */
const rotateRefreshToken = async (refreshTokenInput) => {
  if (!refreshTokenInput) {
    throw new Error('Refresh token is required.');
  }

  let decoded = null;
  try {
    decoded = jwt.verify(refreshTokenInput, JWT_REFRESH_SECRET);
  } catch (err) {
    throw new Error('Invalid or expired refresh token. Please log in again.');
  }

  // Find user by refresh token in DB
  const result = await db.query('SELECT * FROM users WHERE refresh_token = $1', [refreshTokenInput]);
  const user = result.rows[0];

  if (!user || user.id !== decoded.id) {
    throw new Error('Refresh token revoked or invalid.');
  }

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  // Update DB with rotated refresh token
  await db.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [newRefreshToken, user.id]);

  const { password_hash, refresh_token: rToken, ...safeUser } = user;

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user: safeUser
  };
};

/**
 * Verifies short-lived Access Token
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

/**
 * List all preset demo users from PostgreSQL
 */
const getDemoUsers = async () => {
  const result = await db.query("SELECT id, name, email, role, avatar, is_email_verified, created_at FROM users WHERE provider = 'demo'");
  return result.rows;
};

  // Password reset functions
  const crypto = require('crypto');

  /**
   * Initiates password reset: generates token, stores it with expiry, returns token info.
   */
  const requestPasswordReset = async (email) => {
    const cleanEmail = email.trim().toLowerCase();
    const user = await findUserByEmail(cleanEmail);
    if (!user) {
      // To prevent enumeration, we still act as if email was sent.
      return { token: null, expiresAt: null };
    }
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await db.query(
      'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3',
      [token, expiresAt.toISOString(), cleanEmail]
    );
    return { token, expiresAt: expiresAt.toISOString() };
  };

  /**
   * Resets password using a valid token.
   */
  const resetPassword = async (token, newPassword) => {
    if (!token) {
      throw new Error('Reset token is required.');
    }
    const result = await db.query(
      'SELECT * FROM users WHERE reset_token = $1',
      [token]
    );
    const user = result.rows[0];
    if (!user) {
      throw new Error('Invalid or expired reset token.');
    }
    const now = new Date();
    console.log('[DEBUG AUTH] Reset Token Validation:', {
      token,
      storedExpiryRaw: user.reset_token_expires,
      parsedExpiry: user.reset_token_expires ? new Date(user.reset_token_expires).toISOString() : null,
      nowISO: now.toISOString(),
      isExpired: user.reset_token_expires ? (new Date(user.reset_token_expires) < now) : true
    });
    if (!user.reset_token_expires || new Date(user.reset_token_expires) < now) {
      throw new Error('Reset token has expired.');
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE reset_token = $2',
      [passwordHash, token]
    );
    return { message: 'Password has been reset successfully.' };
  };

  module.exports = {
  findUserById,
  findUserByEmail,
  createUserAccount,
  verifyEmailCode,
  loginWithEmailPassword,
  rotateRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  getDemoUsers,
  requestPasswordReset,
  resetPassword
};
