# PostgreSQL Database Integration for TextExpander Typing Game

This document provides instructions for setting up and using the PostgreSQL database integration for the TextExpander Typing Game.

## Overview

The application has been updated to use a PostgreSQL database for persistent data storage instead of localStorage. This allows users to access their data across multiple devices and ensures that high scores and user progress are preserved even when clearing browser data.

## Local Development Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL (v12 or higher) installed locally or accessible remotely

### Setup Steps

1. **Clone the repository**:
   ```
   git clone https://github.com/yourusername/textexpander-typing-game.git
   cd textexpander-typing-game
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Create a .env file**:
   Copy the `.env.example` file to `.env` and update the values:
   ```
   cp .env.example .env
   ```
   
   Update the `DATABASE_URL` with your PostgreSQL connection string:
   ```
   DATABASE_URL=postgres://username:password@localhost:5432/textexpander
   ```

4. **Initialize the database**:
   Create a new PostgreSQL database:
   ```
   createdb textexpander
   ```
   
   Run the database initialization script:
   ```
   npm run db:init
   ```
   
   This will create the necessary tables and insert the default abbreviations.

5. **Start the development servers**:
   ```
   npm run dev:full
   ```
   
   This will start both the frontend (Vite) and backend (Express) servers concurrently.

6. **Access the application**:
   Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

## DigitalOcean Deployment

The application is configured to be deployed on DigitalOcean App Platform with a managed PostgreSQL database.

### Deployment Steps

1. **Push your code to GitHub**:
   Make sure your code is in a GitHub repository.

2. **Connect to DigitalOcean App Platform**:
   - Log in to your DigitalOcean account
   - Go to the App Platform section
   - Click "Create App"
   - Select your GitHub repository
   - DigitalOcean will automatically detect the app.yaml configuration file

3. **Review and Deploy**:
   - Review the configuration settings
   - The app.yaml file is configured to create both a web service and a PostgreSQL database
   - Click "Deploy to App Platform"

4. **Monitor Deployment**:
   - DigitalOcean will build and deploy your application
   - You can monitor the progress in the deployment logs

5. **Database Initialization**:
   After the app is deployed, you need to initialize the database:
   
   - Go to the "Console" tab in your app's dashboard
   - Run the database initialization command:
     ```
     npm run db:init
     ```

6. **Access Your Application**:
   - Once deployment is complete, click on the app URL to access your application
   - The database connection will be automatically configured using environment variables

## Architecture

The application now uses a three-tier architecture:

1. **Frontend**: React application that communicates with the backend API
2. **Backend**: Express.js server that handles API requests and database operations
3. **Database**: PostgreSQL database for persistent data storage

### API Endpoints

The backend provides the following API endpoints:

- `GET /api/users/:username` - Get user data by username
- `POST /api/users` - Create or update user data
- `GET /api/leaderboard` - Get leaderboard entries, optionally filtered by level
- `POST /api/leaderboard` - Add a score to the leaderboard

### Fallback Mechanism

The application includes a fallback mechanism that uses localStorage if the API is unavailable. This ensures that the application remains functional even if there are connectivity issues.

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues:

1. Check that your DATABASE_URL is correct in the .env file
2. Ensure that PostgreSQL is running and accessible
3. Check that the database user has the necessary permissions
4. Verify that the database exists and has been initialized with the schema

### API Connection Issues

If the frontend cannot connect to the API:

1. Check that both the frontend and backend servers are running
2. Verify that the API_BASE_URL in the frontend code is correct
3. Check for CORS issues in the browser console
4. Ensure that the backend server is listening on the correct port

## Migration from localStorage

If you have existing data in localStorage that you want to migrate to the database:

1. Log in to the application using your existing username
2. The application will automatically attempt to migrate your data from localStorage to the database
3. If the migration is successful, your data will be available across devices

## Additional Information

For more information about the application, refer to the main README.md file.