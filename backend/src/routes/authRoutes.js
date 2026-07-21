const express = require('express');
const router = express.Router();
const {
  findUserById,
  createUserAccount,
  verifyEmailCode,
  loginWithEmailPassword,
  rotateRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  getDemoUsers,
  requestPasswordReset,
  resetPassword
} = require('../models/userModel');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * POST /api/auth/register
 * 1. Register Account -> Saves user & generates 6-digit Email Verification Code
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Full name is required for account registration.' });
    }
    if (!email || !email.trim() || !email.includes('@')) {
      return res.status(400).json({ error: 'A valid email address is required for registration.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const { user, verificationCode } = await createUserAccount(name, email, password, role);

    return res.status(201).json({
      message: 'Account registered successfully! Please enter your 6-digit verification code.',
      user,
      verificationCode
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/auth/verify-email
 * 2. Verify Email -> Validates 6-digit code and marks account verified
 */
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !email.trim() || !email.includes('@')) {
      return res.status(400).json({ error: 'Email address is required.' });
    }
    if (!code || !String(code).trim()) {
      return res.status(400).json({ error: 'Verification code is required.' });
    }

    const result = await verifyEmailCode(email, code);
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/auth/login
 * 3. Login -> Authenticates credentials & issues Access Token + Refresh Token
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim() || !email.includes('@')) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Password is required.' });
    }

    const result = await loginWithEmailPassword(email, password);

    return res.json(result);
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
});

/**
 * POST /api/auth/refresh
 * 4. Refresh Token Rotation -> Exchanges valid Refresh Token for fresh Access Token + Refresh Token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required.' });
    }

    const result = await rotateRefreshToken(refreshToken);
    return res.json(result);
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
});

/**
 * POST /api/auth/demo
 * Logs in as a pre-configured demo user (Alex, Sarah, David)
 */
router.post('/demo', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Demo user not found.' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return res.json({
      accessToken,
      refreshToken,
      user
    });
  } catch (err) {
    return res.status(500).json({ error: 'Demo login error.' });
  }
});

/**
 * GET /api/auth/demo-users
 * Returns available demo user options
 */
router.get('/demo-users', async (req, res) => {
  try {
    const demoUsers = await getDemoUsers();
    return res.json(demoUsers);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve demo users.' });
  }
});

/**
 * GET /api/auth/me
 * Returns profile of currently authenticated user session
 */
router.get('/me', authMiddleware, (req, res) => {
  return res.json({
    user: req.user
  });
});

// Forgot password: request reset token
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }
    const { token, expiresAt } = await requestPasswordReset(email);
    
    if (!token) {
      console.warn(`[AUTH] Password reset requested for unregistered/unverified email: ${email}`);
      return res.json({
        message: 'If the email address is registered and verified, a reset link/code has been generated.',
        token: null,
        expiresAt: null
      });
    }

    console.log(`[AUTH] 🔑 Password reset token generated for ${email}: ${token}`);
    return res.json({
      message: 'Password reset token generated! Token has been auto-filled below for dev convenience.',
      token,
      expiresAt
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// Reset password using token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required.' });
    }
    const result = await resetPassword(token, newPassword);
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

module.exports = router;
