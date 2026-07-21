const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userModel = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'antigravity_todo_jwt_secret_key_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'antigravity_todo_refresh_secret_key_2026';

/**
 * Removes sensitive fields before returning user to client
 */
const sanitizeUser = (user) => {
  const { password_hash, refresh_token, reset_token, reset_token_expires, ...safeUser } = user;
  return safeUser;
};

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
 * Creates a brand new user account with 6-digit Email Verification Code
 */
const registerUser = async (name, email, password, role) => {
  const cleanEmail = email.trim().toLowerCase();
  
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const existing = await userModel.findByEmail(cleanEmail);
  if (existing) {
    throw new Error('An account with this email address already exists.');
  }

  const id = `user_reg_${Date.now()}`;
  const userRole = role && role.trim() ? role.trim() : 'Project Member';
  const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanEmail}`;
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Generate random 6-digit verification code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  const user = await userModel.createUser({
    id,
    name: name.trim(),
    email: cleanEmail,
    passwordHash,
    role: userRole,
    avatar,
    verificationCode,
    provider: 'register'
  });

  return {
    user: sanitizeUser(user),
    verificationCode
  };
};

/**
 * Verifies 6-digit Email Verification Code
 */
const verifyEmailCode = async (email, code) => {
  const cleanEmail = email.trim().toLowerCase();
  const user = await userModel.findByEmail(cleanEmail);

  if (!user) {
    throw new Error('User account not found.');
  }

  if (user.is_email_verified) {
    return { message: 'Email is already verified. You can log in directly.', user: sanitizeUser(user) };
  }

  if (String(user.verification_code).trim() !== String(code).trim()) {
    throw new Error('Invalid verification code. Please check your code and try again.');
  }

  // Update account as verified
  await userModel.updateEmailVerification(user.id);
  user.is_email_verified = true;

  return { message: 'Email successfully verified! You can now log in.', user: sanitizeUser(user) };
};

/**
 * Authenticates email + password user via bcrypt and issues Tokens
 */
const loginWithEmailPassword = async (email, password) => {
  const cleanEmail = email.trim().toLowerCase();
  const user = await userModel.findByEmail(cleanEmail);

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

  await userModel.updateRefreshToken(user.id, refreshToken);

  return {
    accessToken,
    refreshToken,
    user: sanitizeUser(user)
  };
};

/**
 * Logs in as a pre-configured demo user
 */
const loginDemoUser = async (userId) => {
  const user = await userModel.findById(userId);

  if (!user) {
    throw new Error('Demo user not found.');
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    accessToken,
    refreshToken,
    user: sanitizeUser(user)
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

  const user = await userModel.findByRefreshToken(refreshTokenInput);

  if (!user || user.id !== decoded.id) {
    throw new Error('Refresh token revoked or invalid.');
  }

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  await userModel.updateRefreshToken(user.id, newRefreshToken);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user: sanitizeUser(user)
  };
};

/**
 * Initiates password reset: generates token, stores it with expiry, returns token info.
 */
const requestPasswordReset = async (email) => {
  const cleanEmail = email.trim().toLowerCase();
  const user = await userModel.findByEmail(cleanEmail);
  if (!user) {
    // To prevent enumeration, we still act as if email was sent.
    return { token: null, expiresAt: null };
  }
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  
  await userModel.updateResetToken(cleanEmail, token, expiresAt.toISOString());
  
  return { token, expiresAt: expiresAt.toISOString() };
};

/**
 * Resets password using a valid token.
 */
const resetPassword = async (token, newPassword) => {
  if (!token) {
    throw new Error('Reset token is required.');
  }
  
  const user = await userModel.findByResetToken(token);
  if (!user) {
    throw new Error('Invalid or expired reset token.');
  }
  
  const now = new Date();
  if (!user.reset_token_expires || new Date(user.reset_token_expires) < now) {
    throw new Error('Reset token has expired.');
  }
  
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await userModel.updatePasswordAndClearResetToken(token, passwordHash);
  
  return { message: 'Password has been reset successfully.' };
};

/**
 * Fetches user profile by id safely
 */
const getUserProfile = async (id) => {
  const user = await userModel.findById(id);
  if (!user) return null;
  return sanitizeUser(user);
};

module.exports = {
  registerUser,
  verifyEmailCode,
  loginWithEmailPassword,
  loginDemoUser,
  rotateRefreshToken,
  requestPasswordReset,
  resetPassword,
  verifyAccessToken,
  getUserProfile
};
