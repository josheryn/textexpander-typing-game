import { User, LeaderboardEntry } from '../types';

// API base URL - will be different in development vs production
const API_BASE_URL = import.meta.env.PROD 
  ? '/api' // In production, the API is served from the same domain
  : 'http://localhost:3001/api'; // In development, use localhost

// User API

/**
 * Get user data by username
 */
export const getUser = async (username: string): Promise<User | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${username}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null; // User not found
      }
      throw new Error(`API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

/**
 * Save user data
 */
export const saveUser = async (user: User): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error saving user:', error);
    return false;
  }
};

// Leaderboard API

/**
 * Get leaderboard entries, optionally filtered by level
 */
export const getLeaderboard = async (level?: number | 'all'): Promise<LeaderboardEntry[]> => {
  try {
    const url = level && level !== 'all'
      ? `${API_BASE_URL}/leaderboard?level=${level}`
      : `${API_BASE_URL}/leaderboard`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
};

/**
 * Add a score to the leaderboard
 */
export const addLeaderboardScore = async (entry: LeaderboardEntry): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/leaderboard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entry),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error adding leaderboard score:', error);
    return false;
  }
};

/**
 * Get user data from localStorage by username
 * 
 * Fallback to localStorage if API calls fail
 * This helps maintain functionality during development or if there are API issues
 */
export const getUserFromLocalStorage = (username: string): User | null => {
  try {
    const usersData = localStorage.getItem('users');
    if (usersData) {
      const users = JSON.parse(usersData);
      return users[username] || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting user from localStorage:', error);
    return null;
  }
};

/**
 * Save user data to localStorage
 * 
 * Fallback storage mechanism when API calls fail
 */
export const saveUserToLocalStorage = (user: User): boolean => {
  try {
    // Get existing users data or initialize empty object
    let users: Record<string, User> = {};
    const usersData = localStorage.getItem('users');
    if (usersData) {
      users = JSON.parse(usersData);
    }

    // Update the user data
    users[user.username] = user;

    // Save back to localStorage
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', user.username);

    return true;
  } catch (error) {
    console.error('Error saving user to localStorage:', error);
    return false;
  }
};

/**
 * Get leaderboard entries from localStorage, optionally filtered by level
 * 
 * Fallback mechanism when API calls fail
 */
export const getLeaderboardFromLocalStorage = (level?: number | 'all'): LeaderboardEntry[] => {
  try {
    const storedLeaderboard = localStorage.getItem('leaderboard');
    if (!storedLeaderboard) return [];

    const leaderboard: LeaderboardEntry[] = JSON.parse(storedLeaderboard);

    if (level && level !== 'all') {
      return leaderboard
        .filter(entry => entry.level === level)
        .sort((a, b) => b.wpm - a.wpm);
    }

    return [...leaderboard].sort((a, b) => b.wpm - a.wpm);
  } catch (error) {
    console.error('Error getting leaderboard from localStorage:', error);
    return [];
  }
};

/**
 * Add a score to the leaderboard in localStorage
 * 
 * Fallback mechanism when API calls fail
 */
export const addLeaderboardScoreToLocalStorage = (entry: LeaderboardEntry): boolean => {
  try {
    // Get existing leaderboard or create a new one
    const storedLeaderboard = localStorage.getItem('leaderboard');
    let leaderboard = storedLeaderboard ? JSON.parse(storedLeaderboard) : [];

    // Add new entry and sort by WPM (highest first)
    leaderboard = [...leaderboard, entry].sort((a, b) => b.wpm - a.wpm);

    // Keep only top 100 scores
    if (leaderboard.length > 100) {
      leaderboard = leaderboard.slice(0, 100);
    }

    // Save back to localStorage
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

    return true;
  } catch (error) {
    console.error('Error adding leaderboard score to localStorage:', error);
    return false;
  }
};
