import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Read the schema SQL file
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Create a new database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for DigitalOcean managed database
  }
});

// Initialize the database
async function initializeDatabase() {
  const client = await pool.connect();

  try {
    console.log('Initializing database...');

    // Execute the schema SQL
    await client.query(schema);

    console.log('Database initialization completed successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the initialization
initializeDatabase()
  .then(() => {
    console.log('Database setup complete');
    process.exit(0);
  })
  .catch(err => {
    console.error('Database setup failed:', err);
    process.exit(1);
  });
