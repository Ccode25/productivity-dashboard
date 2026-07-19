const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');
const { validateTodoMiddleware } = require('../middleware/validate');

// GET /api/todos - Get all todos
router.get('/', todoController.getTodos);

// POST /api/todos - Create new todo
router.post('/', validateTodoMiddleware, todoController.createTodo);

// GET /api/todos/history - Get all history logs
router.get('/history', todoController.getHistory);

// DELETE /api/todos/history - Clear all history logs
router.delete('/history', todoController.clearHistory);

// PUT /api/todos/:id - Update todo
router.put('/:id', validateTodoMiddleware, todoController.updateTodo);

// DELETE /api/todos/:id - Delete todo
router.delete('/:id', todoController.deleteTodo);

module.exports = router;
