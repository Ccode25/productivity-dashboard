require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/authRoutes');
const todoRoutes = require('./src/routes/todoRoutes');
const authMiddleware = require('./src/middleware/authMiddleware');
const initDb = require('./src/models/initDb');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database Tables
initDb();

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Auth Routes (Public)
app.use('/api/auth', authRoutes);

// Protected Todo Routes
app.use('/api/todos', authMiddleware, todoRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[ERROR] Uncaught exception:', err.message);
  res.status(500).json({ error: 'Internal Server Error.' });
});

// Start Server locally, export for serverless environments
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Express server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
