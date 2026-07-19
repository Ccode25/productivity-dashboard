const express = require('express');
const cors = require('cors');
const todoRoutes = require('./src/routes/todoRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes (to support local dev environment)
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Register API Routes
app.use('/api/todos', todoRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[ERROR] Uncaught exception:', err.message);
  res.status(500).json({ error: 'Internal Server Error.' });
});

// Start Server locally, export for serverless environments (Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Express server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
