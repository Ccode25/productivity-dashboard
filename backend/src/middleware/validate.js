/**
 * Helper validation function for checking todo object attributes.
 */
const validateTodo = (data) => {
  const errors = [];
  
  if (data.title !== undefined) {
    if (!data.title || typeof data.title !== 'string' || data.title.trim() === '') {
      errors.push('Title is required and must be a string.');
    }
  }
  
  if (data.category !== undefined && typeof data.category !== 'string') {
    errors.push('Category must be a string.');
  }
  
  if (data.description !== undefined && typeof data.description !== 'string') {
    errors.push('Description must be a string.');
  }
  
  if (data.repeat !== undefined && !['none', 'daily', 'weekly'].includes(data.repeat)) {
    errors.push('Repeat option is invalid.');
  }
  
  return errors;
};

/**
 * Express middleware to validate todo payloads.
 */
const validateTodoMiddleware = (req, res, next) => {
  const { title, description, category, repeat } = req.body;
  
  const validationErrors = validateTodo({ title, description, category, repeat });
  
  if (validationErrors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: validationErrors });
  }
  
  next();
};

/**
 * Express middleware to validate registration payloads.
 */
const validateRegisterMiddleware = (req, res, next) => {
  const { name, email, password } = req.body;
  
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Full name is required for account registration.' });
  }
  if (!email || !email.trim() || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid email address is required for registration.' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }
  
  next();
};

/**
 * Express middleware to validate email and code for verification.
 */
const validateVerifyEmailMiddleware = (req, res, next) => {
  const { email, code } = req.body;
  
  if (!email || !email.trim() || !email.includes('@')) {
    return res.status(400).json({ error: 'Email address is required.' });
  }
  if (!code || !String(code).trim()) {
    return res.status(400).json({ error: 'Verification code is required.' });
  }
  
  next();
};

/**
 * Express middleware to validate login payloads.
 */
const validateLoginMiddleware = (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || !email.trim() || !email.includes('@')) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Password is required.' });
  }
  
  next();
};

/**
 * Express middleware to validate password reset request payloads.
 */
const validateForgotPasswordMiddleware = (req, res, next) => {
  const { email } = req.body;
  
  if (!email || !email.trim() || !email.includes('@')) {
    return res.status(400).json({ error: 'Email address is required.' });
  }
  
  next();
};

/**
 * Express middleware to validate password reset payloads.
 */
const validateResetPasswordMiddleware = (req, res, next) => {
  const { token, newPassword } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: 'Reset token is required.' });
  }
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Token and new password (min 6 characters) are required.' });
  }
  
  next();
};

module.exports = {
  validateTodoMiddleware,
  validateRegisterMiddleware,
  validateVerifyEmailMiddleware,
  validateLoginMiddleware,
  validateForgotPasswordMiddleware,
  validateResetPasswordMiddleware
};
