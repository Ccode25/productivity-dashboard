const todoModel = require('../models/todoModel');

/**
 * GET /api/todos
 * Get all todos
 */
const getTodos = async (req, res) => {
  try {
    const todos = await todoModel.findAll();
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve todos.' });
  }
};

/**
 * POST /api/todos
 * Create new todo
 */
const createTodo = async (req, res) => {
  try {
    const { title, description, category, dueDate, repeat } = req.body;
    
    // Title is required for creation
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Validation failed', details: ['Title is required and must be a string.'] });
    }

    const newTodo = await todoModel.create({
      title,
      description,
      category,
      dueDate,
      repeat
    });

    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create todo.' });
  }
};

/**
 * PUT /api/todos/:id
 * Update todo (and trigger repeat task clone if toggled to complete)
 */
const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, dueDate, completed, repeat } = req.body;

    const existingTodo = await todoModel.findById(id);
    if (!existingTodo) {
      return res.status(404).json({ error: `Todo with ID ${id} not found.` });
    }

    const result = await todoModel.update(id, {
      title,
      description,
      category,
      dueDate,
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
 * Delete todo
 */
const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingTodo = await todoModel.findById(id);
    if (!existingTodo) {
      return res.status(404).json({ error: `Todo with ID ${id} not found.` });
    }

    const success = await todoModel.remove(id);
    if (!success) {
      return res.status(404).json({ error: `Todo with ID ${id} not found.` });
    }

    res.json({ message: 'Todo deleted successfully.', id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete todo.' });
  }
};

module.exports = {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo
};
