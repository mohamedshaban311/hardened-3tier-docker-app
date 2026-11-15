const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3001;

// Allow CORS for frontend requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Unexpected database client error:', err);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', message: 'Backend is healthy' });
});

// Fetch items seeded by init.sql
app.get('/api/items', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM items ORDER BY id ASC');
    res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});