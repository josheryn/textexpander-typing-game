import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Disable SSL certificate validation for DigitalOcean managed database
// This must be set before any database connection is attempted
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false // Required for DigitalOcean managed database
  } : false // Disable SSL for local development
});

// Read the schema SQL file
const schemaPath = path.join(__dirname, 'db', 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Initialize database if needed
async function initializeDatabaseIfNeeded() {
  const client = await pool.connect();

  try {
    // Check if the database has been initialized by looking for the users table
    const checkTableResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    const tableExists = checkTableResult.rows[0].exists;

    if (!tableExists) {
      console.log('Database tables not found. Initializing database...');

      // Execute the schema SQL
      await client.query(schema);

      console.log('Database initialization completed successfully');
    } else {
      console.log('Database already initialized');
    }
  } catch (err) {
    console.error('Error checking/initializing database:', err);
  } finally {
    client.release();
  }
}

// Test database connection and initialize if needed
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Connected to PostgreSQL database');
  release();

  // Initialize database after successful connection
  initializeDatabaseIfNeeded();
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

// Database status endpoint
app.get('/api/db-status', async (req, res) => {
  try {
    // Test database connection
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();

    // Check if tables exist
    const tablesResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    const tableExists = tablesResult.rows[0].exists;

    res.json({
      status: 'connected',
      timestamp: result.rows[0].now,
      tablesInitialized: tableExists,
      databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing'
    });
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message,
      databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
