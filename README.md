# TextExpander Typing Game

A web-based typing speed game that helps you improve your typing skills while unlocking TextExpander abbreviations.

## Features

- **Typing Speed Game**: Practice typing with 10 progressively challenging levels
- **Performance Tracking**: Measure your typing speed (WPM) and accuracy
- **TextExpander Integration**: Unlock abbreviations as you progress through levels
- **Abbreviation Usage**: Use unlocked abbreviations to type faster in subsequent levels
- **Persistent Storage**: Your progress, high scores, and unlocked abbreviations are saved in a PostgreSQL database
- **Leaderboard**: Compare your performance with other players
- **User Profiles**: Track your stats and view your unlocked abbreviations

## Technologies Used

- React 18
- TypeScript
- React Router
- Styled Components
- Vite
- Express.js (Backend server)
- PostgreSQL (Database)

## Architecture

The application uses a three-tier architecture:

1. **Frontend**: React application that provides the user interface
2. **Backend**: Express.js server that handles API requests and database operations
3. **Database**: PostgreSQL database for persistent data storage

This architecture allows for data persistence across devices and sessions, enabling features like the leaderboard and user profiles.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/textexpander-typing-game.git
   cd textexpander-typing-game
   ```

2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn
   ```

3. Start the development server:
   ```
   npm run dev
   ```
   or
   ```
   yarn dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

## How to Play

1. **Login**: Enter a username to start playing
2. **Select a Level**: Choose from available levels on the home screen
3. **Play the Game**: Type the displayed text as quickly and accurately as possible
4. **Unlock Abbreviations**: Complete levels to unlock TextExpander abbreviations
5. **Use Abbreviations**: In subsequent levels, use your unlocked abbreviations to type faster
   - Type the abbreviation (e.g., `;em`) and it will automatically expand
   - Or click on an abbreviation from the list to insert it at the cursor position
6. **Track Progress**: View your stats and unlocked abbreviations in your profile
7. **Compare Scores**: Check the leaderboard to see how you rank against other players

## Game Levels

The game features 10 levels of increasing difficulty:

1. **Beginner**: Simple words and short sentences
2. **Basic Sentences**: Complete sentences with common words
3. **Intermediate**: More complex sentences with varied punctuation
4. **Numbers & Symbols**: Practice typing numbers and special characters
5. **Business Writing**: Professional business communications
6. **Technical Terms**: Technical vocabulary and terms
7. **Code Snippets**: Programming code and syntax
8. **Advanced Paragraphs**: Long paragraphs with complex vocabulary
9. **Creative Writing**: Expressive text with varied punctuation and dialogue
10. **Master Level**: The ultimate typing challenge

Each level has a required WPM (words per minute) target that you need to achieve to unlock the next level.

## TextExpander Abbreviations

As you complete levels, you'll unlock TextExpander abbreviations that can be used to type faster:

- Level 1: `;em` → Email address
- Level 2: `;addr` → Full address
- Level 3: `;sig` → Email signature
- Level 4: `;date` → Current date
- Level 5: `;time` → Current time
- Level 6: `;lorem` → Lorem ipsum text
- Level 7: `;ty` → Thank you message
- Level 8: `;meet` → Meeting request
- Level 9: `;conf` → Confirmation message
- Level 10: `;te` → TextExpander slogan

## Deployment

### Deploying to DigitalOcean App Platform

This project includes configuration for deploying to DigitalOcean App Platform:

1. **Push your code to GitHub**: Make sure your code is in a GitHub repository.

2. **Connect to DigitalOcean App Platform**:
   - Log in to your DigitalOcean account
   - Go to the App Platform section
   - Click "Create App"
   - Select your GitHub repository
   - DigitalOcean will automatically detect the app.yaml configuration file

3. **Review and Deploy**:
   - Review the configuration settings
   - Click "Deploy to App Platform"

4. **Monitor Deployment**:
   - DigitalOcean will build and deploy your application
   - You can monitor the progress in the deployment logs

The deployment configuration is defined in the `.do/app.yaml` file, which specifies:
- Build command: `npm run build`
- Output directory: `dist`
- Environment: Node.js (version 18)
- Routing configuration for SPA behavior
- PostgreSQL database configuration for persistent data storage

### Troubleshooting Deployment Issues

If you encounter build issues on DigitalOcean App Platform:

1. **Check Node.js Version**: The app is configured to use Node.js version 18. If you need a different version, update the `NODE_VERSION` environment variable in the `.do/app.yaml` file.

2. **Build Logs**: Review the build logs in the DigitalOcean App Platform dashboard for specific error messages.

3. **Local Testing**: Before deploying, test the build process locally with `npm run build` to ensure it completes successfully.

4. **Path Issues**: Ensure all asset paths in the application use relative paths (starting with `./`) rather than absolute paths (starting with `/`).

For detailed information about the database setup, configuration, and usage, please refer to the [README.database.md](README.database.md) file.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
