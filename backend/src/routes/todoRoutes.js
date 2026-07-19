const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');
const { validateTodoMiddleware } = require('../middleware/validate');

// GET /api/todos - Get all todos
router.get('/', todoController.getTodos);

// POST /api/todos - Create new todo
router.post('/', validateTodoMiddleware, todoController.createTodo);

// PUT /api/todos/:id - Update todo
router.put('/:id', validateTodoMiddleware, todoController.updateTodo);

// DELETE /api/todos/:id - Delete todo
router.delete('/:id', todoController.deleteTodo);

module.exports = router;
