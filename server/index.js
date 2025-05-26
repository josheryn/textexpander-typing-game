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
    console.log('Getting user data for username:', username);
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    console.log('User data from database:', result.rows[0]);

    // Log the user level specifically for debugging
    if (result.rows.length > 0) {
      console.log('User level from database:', result.rows[0].level);
    }

    if (result.rows.length === 0) {
      console.log('User not found in database');
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's high scores
    const scoresResult = await pool.query(
      'SELECT * FROM scores WHERE username = $1 ORDER BY wpm DESC LIMIT 10', 
      [username]
    );

    // Log the scores for debugging
    console.log(`Retrieved ${scoresResult.rows.length} scores for user ${username}`);
    if (scoresResult.rows.length > 0) {
      console.log('Sample score data:', {
        firstScore: scoresResult.rows[0],
        accuracyValues: scoresResult.rows.map(score => score.accuracy)
      });
    }

    // Get user's unlocked abbreviations
    const abbrevResult = await pool.query(
      'SELECT a.* FROM abbreviations a JOIN user_abbreviations ua ON a.id = ua.abbreviation_id WHERE ua.username = $1',
      [username]
    );

    console.log(`Retrieved ${abbrevResult.rows.length} unlocked abbreviations for user ${username}`);

    // Get all abbreviations that should be unlocked based on user's level
    const allAbbreviationsResult = await pool.query(
      'SELECT * FROM abbreviations WHERE unlocked_at <= $1',
      [result.rows[0].level]
    );

    console.log(`Found ${allAbbreviationsResult.rows.length} abbreviations that should be unlocked for level ${result.rows[0].level}`);

    // Combine explicitly unlocked abbreviations with those that should be unlocked based on level
    const unlockedAbbreviationIds = new Set(abbrevResult.rows.map(row => row.id));
    const combinedAbbreviations = [...abbrevResult.rows];

    for (const abbr of allAbbreviationsResult.rows) {
      if (!unlockedAbbreviationIds.has(abbr.id)) {
        combinedAbbreviations.push(abbr);

        // Also add to the user_abbreviations table for persistence
        try {
          await pool.query(
            'INSERT INTO user_abbreviations (username, abbreviation_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [username, abbr.id]
          );
        } catch (err) {
          console.error(`Error adding abbreviation ${abbr.id} to user_abbreviations:`, err);
          // Continue with the next abbreviation even if this one fails
        }
      }
    }

    console.log(`Combined total of ${combinedAbbreviations.length} unlocked abbreviations for user ${username}`);

    // Get user's last unlocked abbreviation
    const lastAbbrevResult = await pool.query(
      'SELECT a.* FROM abbreviations a WHERE a.id = $1',
      [result.rows[0].last_unlocked_abbreviation_id]
    );

    // Log the first score's accuracy value and type for debugging
    if (scoresResult.rows.length > 0) {
      console.log('First score accuracy value and type:', {
        value: scoresResult.rows[0].accuracy,
        type: typeof scoresResult.rows[0].accuracy
      });
    }

    const user = {
      username: result.rows[0].username,
      level: Number(result.rows[0].level), // Ensure level is a number
      highScores: scoresResult.rows.map(score => ({
        level: score.level,
        wpm: score.wpm,
        accuracy: Number(score.accuracy), // Convert accuracy to number
        date: score.date,
        abbreviationsUsed: score.abbreviations_used
      })),
      unlockedAbbreviations: combinedAbbreviations.map(abbr => ({
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

    console.log('Sending user data to client:', { 
      username: user.username, 
      level: user.level, 
      highScores: user.highScores.length,
      unlockedAbbreviations: user.unlockedAbbreviations.length
    });
    res.json(user);
  } catch (err) {
    console.error('Error retrieving user data from database:', err);
    console.error('Error details:', { username: req.params.username });
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or update user
app.post('/api/users', async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const { username, level, highScores, unlockedAbbreviations, lastUnlockedAbbreviation } = req.body;
    // Ensure level is a number
    const numericLevel = Number(level);
    console.log('Saving user data to database:', { 
      username, 
      level, 
      numericLevel,
      unlockedAbbreviations: unlockedAbbreviations?.length || 0 
    });

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
        [username, numericLevel, lastUnlockedAbbreviationId]
      );
    } else {
      // Update existing user
      await client.query(
        'UPDATE users SET level = $1, last_unlocked_abbreviation_id = $2 WHERE username = $3',
        [numericLevel, lastUnlockedAbbreviationId, username]
      );

      // Clear existing relationships to rebuild them
      await client.query('DELETE FROM user_abbreviations WHERE username = $1', [username]);
    }

    // Add unlocked abbreviations
    // Always process unlockedAbbreviations, even if it's an empty array
    // This ensures the database state matches the client state
    if (unlockedAbbreviations) {
      console.log(`Processing ${unlockedAbbreviations.length} unlocked abbreviations for user ${username}`);
      for (const abbr of unlockedAbbreviations) {
        await client.query(
          'INSERT INTO user_abbreviations (username, abbreviation_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [username, abbr.id]
        );
      }
    } else {
      console.log(`No unlockedAbbreviations provided for user ${username}`);
    }

    // We don't add high scores here anymore
    // Scores should only be added when completing a game level through the /api/leaderboard endpoint

    await client.query('COMMIT');
    console.log('User data saved successfully to database for user:', username);
    res.status(201).json({ message: 'User data saved successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error saving user data to database:', err);
    console.error('Error details:', { 
      username, 
      level, 
      highScores: highScores?.length || 0,
      unlockedAbbreviations: unlockedAbbreviations?.length || 0
    });
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const { level } = req.query;

    // Use the actual ID field from the scores table
    let query = `
      SELECT 
        s.id, 
        s.username, 
        s.level, 
        s.wpm, 
        s.accuracy, 
        s.date, 
        s.abbreviations_used AS "abbreviationsUsed"
      FROM scores s
    `;
    const params = [];

    if (level && level !== 'all') {
      query += ' WHERE s.level = $1';
      params.push(level);
    }

    query += ' ORDER BY s.wpm DESC LIMIT 100';

    const result = await pool.query(query, params);

    // Convert accuracy to number for each row
    const formattedRows = result.rows.map(row => ({
      ...row,
      accuracy: Number(row.accuracy)
    }));

    res.json(formattedRows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add score to leaderboard
app.post('/api/leaderboard', async (req, res) => {
  try {
    const { username, level, wpm, accuracy, date, abbreviationsUsed } = req.body;

    // Check if this exact score already exists in the database
    const existingScore = await pool.query(
      'SELECT id FROM scores WHERE username = $1 AND level = $2 AND wpm = $3 AND accuracy = $4 AND date = $5',
      [username, level, wpm, accuracy, date]
    );

    // Only insert if the score doesn't already exist
    if (existingScore.rows.length === 0) {
      await pool.query(
        'INSERT INTO scores (username, level, wpm, accuracy, date, abbreviations_used) VALUES ($1, $2, $3, $4, $5, $6)',
        [username, level, wpm, accuracy, date, abbreviationsUsed || 0]
      );
      res.status(201).json({ message: 'Score added to leaderboard' });
    } else {
      // Score already exists, return success but indicate it was a duplicate
      res.status(200).json({ message: 'Score already exists in leaderboard' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

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
