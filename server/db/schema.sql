-- Database schema for TextExpander Typing Game

-- Users table
CREATE TABLE IF NOT EXISTS users (
  username VARCHAR(50) PRIMARY KEY,
  level INTEGER NOT NULL DEFAULT 1,
  last_unlocked_abbreviation_id VARCHAR(50) NULL
);

-- Abbreviations table
CREATE TABLE IF NOT EXISTS abbreviations (
  id VARCHAR(50) PRIMARY KEY,
  abbreviation VARCHAR(20) NOT NULL,
  expansion TEXT NOT NULL,
  description TEXT NOT NULL,
  unlocked_at INTEGER NOT NULL
);

-- User-Abbreviation relationship table
CREATE TABLE IF NOT EXISTS user_abbreviations (
  username VARCHAR(50) NOT NULL,
  abbreviation_id VARCHAR(50) NOT NULL,
  PRIMARY KEY (username, abbreviation_id),
  FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE,
  FOREIGN KEY (abbreviation_id) REFERENCES abbreviations(id) ON DELETE CASCADE
);

-- Scores table
CREATE TABLE IF NOT EXISTS scores (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  level INTEGER NOT NULL,
  wpm INTEGER NOT NULL,
  accuracy NUMERIC(5,2) NOT NULL,
  date TIMESTAMP NOT NULL,
  abbreviations_used INTEGER DEFAULT 0,
  FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);

-- Create index for faster leaderboard queries
CREATE INDEX IF NOT EXISTS idx_scores_wpm ON scores(wpm DESC);
CREATE INDEX IF NOT EXISTS idx_scores_level ON scores(level);
CREATE INDEX IF NOT EXISTS idx_scores_username ON scores(username);

-- Insert default abbreviations
INSERT INTO abbreviations (id, abbreviation, expansion, description, unlocked_at)
VALUES 
  ('em', ';em', 'user@example.com', 'Email address', 1),
  ('addr', ';addr', '123 Main St, Anytown, CA 12345', 'Full address', 2),
  ('sig', ';sig', 'Best regards,\nYour Name\nCompany Inc.', 'Email signature', 3),
  ('date', ';date', 'January 1, 2023', 'Current date', 4),
  ('time', ';time', '12:00 PM', 'Current time', 5),
  ('lorem', ';lorem', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', 'Lorem ipsum text', 6),
  ('ty', ';ty', 'Thank you for your message. I appreciate your prompt response.', 'Thank you message', 7),
  ('meet', ';meet', 'Would you be available for a meeting on Monday at 2 PM?', 'Meeting request', 8),
  ('conf', ';conf', 'I confirm receipt of your message and will process your request shortly.', 'Confirmation message', 9),
  ('te', ';te', 'Type more with less effort using TextExpander!', 'TextExpander slogan', 10)
ON CONFLICT (id) DO NOTHING;