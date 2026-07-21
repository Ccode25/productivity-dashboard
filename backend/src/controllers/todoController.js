const todoModel = require('../models/todoModel');
const todoService = require('../services/todoService');

/**
 * GET /api/todos
 * Get all todos for current user
 */
const getTodos = async (req, res) => {
  try {
    const todos = await todoModel.findAll(req.userId);
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve todos.' });
  }
};

/**
 * POST /api/todos
 * Create new todo for current user
 */
const createTodo = async (req, res) => {
  try {
    const { title, description, category, dueDate, priority, repeat } = req.body;
    
    // Validation is now fully handled by validateTodoMiddleware

    const newTodo = await todoService.createTodo(req.userId, {
      title,
      description,
      category,
      dueDate,
      priority,
      repeat
    });

    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create todo.' });
  }
};

/**
 * PUT /api/todos/:id
 * Update todo for current user
 */
const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, dueDate, priority, completed, repeat } = req.body;

    const existingTodo = await todoModel.findById(req.userId, id);
    if (!existingTodo) {
      return res.status(404).json({ error: `Todo with ID ${id} not found.` });
    }

    const result = await todoService.updateTodo(req.userId, id, {
      title,
      description,
      category,
      dueDate,
      priority,
      completed,
      repeat
    });

    if (!result) {
      return res.status(404).json({ error: `Todo with ID ${id} not found.` });
    }

    const { updatedTodo, createdRecurring } = result;

    if (createdRecurring) {
      res.json({
        ...updatedTodo,
        _createdRecurring: createdRecurring
      });
    } else {
      res.json(updatedTodo);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update todo.' });
  }
};

/**
 * DELETE /api/todos/:id
 * Delete todo for current user
 */
const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingTodo = await todoModel.findById(req.userId, id);
    if (!existingTodo) {
      return res.status(404).json({ error: `Todo with ID ${id} not found.` });
    }

    const success = await todoService.deleteTodo(req.userId, id);
    if (!success) {
      return res.status(404).json({ error: `Todo with ID ${id} not found.` });
    }

    res.json({ message: 'Todo deleted successfully.', id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete todo.' });
  }
};

/**
 * GET /api/todos/history
 * Get all history logs for current user
 */
const getHistory = async (req, res) => {
  try {
    const logs = await todoModel.getHistory(req.userId);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve history logs.' });
  }
};

/**
 * DELETE /api/todos/history
 * Clear all history logs for current user
 */
const clearHistory = async (req, res) => {
  try {
    await todoModel.clearHistory(req.userId);
    res.json({ message: 'History logs cleared successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear history logs.' });
  }
};

module.exports = {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  getHistory,
  clearHistory
};
