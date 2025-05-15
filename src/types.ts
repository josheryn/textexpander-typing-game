// User related types
export interface User {
  username: string;
  level: number;
  highScores: GameScore[];
  unlockedAbbreviations: Abbreviation[];
  lastUnlockedAbbreviation?: Abbreviation | null;
}

// Game related types
export interface GameScore {
  level: number;
  wpm: number; // Words per minute
  accuracy: number; // Percentage
  date: string;
  abbreviationsUsed: number;
}

export interface GameLevel {
  id: number;
  name: string;
  description: string;
  text: string;
  requiredWPM: number;
  unlockableAbbreviation?: Abbreviation;
}

// TextExpander related types
export interface Abbreviation {
  id: string;
  abbreviation: string;
  expansion: string;
  description: string;
  unlockedAt: number; // Level at which this abbreviation is unlocked
}

// Leaderboard types
export interface LeaderboardEntry {
  username: string;
  wpm: number;
  accuracy: number;
  level: number;
  date: string;
}
