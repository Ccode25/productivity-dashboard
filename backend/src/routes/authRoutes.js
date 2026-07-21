const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const userModel = require('../models/userModel');
const authMiddleware = require('../middleware/authMiddleware');
const {
  validateRegisterMiddleware,
  validateVerifyEmailMiddleware,
  validateLoginMiddleware,
  validateForgotPasswordMiddleware,
  validateResetPasswordMiddleware
} = require('../middleware/validate');

/**
 * POST /api/auth/register
 * 1. Register Account -> Saves user & generates 6-digit Email Verification Code
 */
router.post('/register', validateRegisterMiddleware, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const { user, verificationCode } = await authService.registerUser(name, email, password, role);

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
router.post('/verify-email', validateVerifyEmailMiddleware, async (req, res) => {
  try {
    const { email, code } = req.body;
    const result = await authService.verifyEmailCode(email, code);
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/auth/login
 * 3. Login -> Authenticates credentials & issues Access Token + Refresh Token
 */
router.post('/login', validateLoginMiddleware, async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginWithEmailPassword(email, password);
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
    const result = await authService.rotateRefreshToken(refreshToken);
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
    const result = await authService.loginDemoUser(userId);
    return res.json(result);
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
    const demoUsers = await userModel.getDemoUsers();
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
router.post('/forgot-password', validateForgotPasswordMiddleware, async (req, res) => {
  try {
    const { email } = req.body;
    const { token, expiresAt } = await authService.requestPasswordReset(email);
    
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
router.post('/reset-password', validateResetPasswordMiddleware, async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const result = await authService.resetPassword(token, newPassword);
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

module.exports = router;
