const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for DigitalOcean managed database
  }
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Connected to PostgreSQL database');
  release();
});

// API Routes

// Get user by username
app.get('/api/users/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's high scores
    const scoresResult = await pool.query(
      'SELECT * FROM scores WHERE username = $1 ORDER BY wpm DESC LIMIT 10', 
      [username]
    );

    // Get user's unlocked abbreviations
    const abbrevResult = await pool.query(
      'SELECT a.* FROM abbreviations a JOIN user_abbreviations ua ON a.id = ua.abbreviation_id WHERE ua.username = $1',
      [username]
    );

    // Get user's last unlocked abbreviation
    const lastAbbrevResult = await pool.query(
      'SELECT a.* FROM abbreviations a WHERE a.id = $1',
      [result.rows[0].last_unlocked_abbreviation_id]
    );

    const user = {
      username: result.rows[0].username,
      level: result.rows[0].level,
      highScores: scoresResult.rows.map(score => ({
        level: score.level,
        wpm: score.wpm,
        accuracy: score.accuracy,
        date: score.date,
        abbreviationsUsed: score.abbreviations_used
      })),
      unlockedAbbreviations: abbrevResult.rows.map(abbr => ({
        id: abbr.id,
        abbreviation: abbr.abbreviation,
        expansion: abbr.expansion,
        description: abbr.description,
        unlockedAt: abbr.unlocked_at
      })),
      lastUnlockedAbbreviation: lastAbbrevResult.rows.length > 0 ? {
        id: lastAbbrevResult.rows[0].id,
        abbreviation: lastAbbrevResult.rows[0].abbreviation,
        expansion: lastAbbrevResult.rows[0].expansion,
        description: lastAbbrevResult.rows[0].description,
        unlockedAt: lastAbbrevResult.rows[0].unlocked_at
      } : null
    };

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or update user
app.post('/api/users', async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const { username, level, highScores, unlockedAbbreviations, lastUnlockedAbbreviation } = req.body;

    // Check if user exists
    const userExists = await client.query('SELECT * FROM users WHERE username = $1', [username]);

    let lastUnlockedAbbreviationId = null;
    if (lastUnlockedAbbreviation) {
      lastUnlockedAbbreviationId = lastUnlockedAbbreviation.id;
    }

    if (userExists.rows.length === 0) {
      // Create new user
      await client.query(
        'INSERT INTO users (username, level, last_unlocked_abbreviation_id) VALUES ($1, $2, $3)',
        [username, level, lastUnlockedAbbreviationId]
      );
    } else {
      // Update existing user
      await client.query(
        'UPDATE users SET level = $1, last_unlocked_abbreviation_id = $2 WHERE username = $3',
        [level, lastUnlockedAbbreviationId, username]
      );

      // Clear existing relationships to rebuild them
      await client.query('DELETE FROM user_abbreviations WHERE username = $1', [username]);
    }

    // Add unlocked abbreviations
    if (unlockedAbbreviations && unlockedAbbreviations.length > 0) {
      for (const abbr of unlockedAbbreviations) {
        await client.query(
          'INSERT INTO user_abbreviations (username, abbreviation_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [username, abbr.id]
        );
      }
    }

    // Add high scores
    if (highScores && highScores.length > 0) {
      for (const score of highScores) {
        await client.query(
          'INSERT INTO scores (username, level, wpm, accuracy, date, abbreviations_used) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING',
          [username, score.level, score.wpm, score.accuracy, score.date, score.abbreviationsUsed]
        );
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'User data saved successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const { level } = req.query;

    let query = 'SELECT username, level, wpm, accuracy, date, abbreviations_used AS "abbreviationsUsed" FROM scores';
    const params = [];

    if (level && level !== 'all') {
      query += ' WHERE level = $1';
      params.push(level);
    }

    query += ' ORDER BY wpm DESC LIMIT 100';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add score to leaderboard
app.post('/api/leaderboard', async (req, res) => {
  try {
    const { username, level, wpm, accuracy, date, abbreviationsUsed } = req.body;

    await pool.query(
      'INSERT INTO scores (username, level, wpm, accuracy, date, abbreviations_used) VALUES ($1, $2, $3, $4, $5, $6)',
      [username, level, wpm, accuracy, date, abbreviationsUsed || 0]
    );

    res.status(201).json({ message: 'Score added to leaderboard' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
