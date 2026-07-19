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
  
  // Only validate attributes if they are present in the request body (handles both partial PUT and complete POST)
  const validationErrors = validateTodo({ title, description, category, repeat });
  
  if (validationErrors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: validationErrors });
  }
  
  next();
};

module.exports = {
  validateTodoMiddleware
};
