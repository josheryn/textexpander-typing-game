import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { User } from '../types';
import { gameLevels, unlockAbbreviationsForLevel } from '../data/gameData';
import DatabaseStatus from '../components/DatabaseStatus';
import { saveUser, saveUserToLocalStorage } from '../services/api';

interface HomeProps {
  user: User;
  setUser?: React.Dispatch<React.SetStateAction<User | null>>;
}

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const WelcomeSection = styled.div`
  background-color: var(--card-background);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  color: var(--primary-color);
  margin-bottom: 1rem;
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 1.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const StatCard = styled.div`
  flex: 1;
  background-color: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: var(--light-text-color);
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const SectionTitle = styled.h2`
  margin-bottom: 1.5rem;
  color: var(--text-color);
  font-weight: 500;
`;

const LevelsSection = styled.div`
  margin-top: 1rem;
`;

const LevelsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const LevelCard = styled.div<{ isUnlocked: boolean }>`
  background-color: var(--card-background);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  opacity: ${props => props.isUnlocked ? 1 : 0.7};
  position: relative;
  overflow: hidden;

  ${props => !props.isUnlocked && `
    &::after {
      content: 'Locked';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      font-weight: 500;
    }
  `}
`;

const LevelTitle = styled.h3`
  color: var(--primary-color);
  margin-bottom: 0.5rem;
`;

const LevelDescription = styled.p`
  color: var(--light-text-color);
  font-size: 0.9rem;
  margin-bottom: 1rem;
  flex-grow: 1;
`;

const LevelRequirement = styled.div`
  font-size: 0.8rem;
  color: var(--text-color);
  margin-bottom: 1rem;
`;

const HighWPM = styled.div`
  font-size: 0.9rem;
  color: var(--primary-color);
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const WPMBadge = styled.span`
  background-color: var(--primary-color);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 700;
`;

const PlayButton = styled(Link)<{ isUnlocked: boolean }>`
  padding: 0.75rem;
  background-color: ${props => props.isUnlocked ? 'var(--primary-color)' : 'var(--border-color)'};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: ${props => props.isUnlocked ? 'pointer' : 'not-allowed'};
  transition: background-color 0.2s;
  text-align: center;
  pointer-events: ${props => props.isUnlocked ? 'auto' : 'none'};

  &:hover {
    background-color: ${props => props.isUnlocked ? '#3a76d8' : 'var(--border-color)'};
    text-decoration: none;
  }
`;

const AbbreviationsSection = styled.div`
  margin-top: 2rem;
`;

const AbbreviationsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
`;

const AbbreviationCard = styled.div`
  background-color: var(--card-background);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
`;

const AbbreviationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const AbbreviationTitle = styled.h4`
  color: var(--primary-color);
  margin: 0;
`;

const AbbreviationShortcut = styled.code`
  background-color: #f0f0f0;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: var(--monospace-font);
  font-size: 0.9rem;
`;

const AbbreviationDescription = styled.p`
  color: var(--light-text-color);
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

const NoAbbreviations = styled.p`
  color: var(--light-text-color);
  font-style: italic;
`;

const Home: React.FC<HomeProps> = ({ user, setUser }) => {
  const [highestWPM, setHighestWPM] = useState(0);
  const [averageAccuracy, setAverageAccuracy] = useState(0);

  // Ensure all abbreviations up to the user's level are unlocked when the component mounts
  useEffect(() => {
    if (user && setUser) {
      // Get all abbreviations that should be unlocked based on user's level
      const updatedUnlockedAbbreviations = unlockAbbreviationsForLevel(
        user.level,
        user.unlockedAbbreviations
      );

      // Only update if there are new abbreviations to unlock
      if (updatedUnlockedAbbreviations.length > user.unlockedAbbreviations.length) {
        console.log(`Home: Unlocking abbreviations for level ${user.level}. Before: ${user.unlockedAbbreviations.length}, After: ${updatedUnlockedAbbreviations.length}`);

        // Create updated user object
        const updatedUser = {
          ...user,
          unlockedAbbreviations: updatedUnlockedAbbreviations
        };

        // Update user state
        setUser(updatedUser);

        // Save to database
        saveUser(updatedUser)
          .then(success => {
            if (success) {
              console.log('Home: User abbreviations updated successfully');
            } else {
              console.warn('Home: Failed to save updated abbreviations to database, falling back to localStorage');
              saveUserToLocalStorage(updatedUser);
            }
          })
          .catch(error => {
            console.error('Home: Error saving updated abbreviations to database:', error);
            saveUserToLocalStorage(updatedUser);
          });
      }
    }
  }, [user, setUser]);

  // Log user data when Home component is rendered
  console.log('Home component rendered with user:', { 
    username: user.username, 
    level: user.level, 
    highScores: user.highScores.length,
    unlockedAbbreviations: user.unlockedAbbreviations.length
  });

  // Log the user level specifically for debugging
  console.log('User level in Home component:', user.level, 'Type:', typeof user.level);

  // Auto-redirect functionality has been removed as per user request
  // This allows users to see all levels on the home screen without being automatically directed to a specific level

  useEffect(() => {
    // Calculate highest WPM from user's high scores
    if (user.highScores && user.highScores.length > 0) {
      const maxWPM = Math.max(...user.highScores.map(score => score.wpm));
      setHighestWPM(maxWPM);

      // Calculate average accuracy
      // Filter out scores with invalid accuracy values
      const validScores = user.highScores.filter(score => 
        typeof score.accuracy === 'number' && !isNaN(score.accuracy)
      );

      // Log accuracy values for debugging
      console.log('Accuracy values:', user.highScores.map(score => ({
        accuracy: score.accuracy,
        type: typeof score.accuracy,
        isValid: typeof score.accuracy === 'number' && !isNaN(score.accuracy)
      })));
      console.log('Valid scores for accuracy calculation:', validScores.length);

      if (validScores.length > 0) {
        const totalAccuracy = validScores.reduce((sum, score) => sum + score.accuracy, 0);
        const calculatedAverage = Math.round(totalAccuracy / validScores.length);
        console.log('Calculated average accuracy:', calculatedAverage, 'from total:', totalAccuracy);
        setAverageAccuracy(calculatedAverage);
      } else {
        console.log('No valid scores for accuracy calculation, setting to 0');
        setAverageAccuracy(0);
      }
    } else {
      // Set default values when there are no high scores
      setHighestWPM(0);
      setAverageAccuracy(0);
    }
  }, [user.highScores]);

  // Filter unlocked abbreviations
  const unlockedAbbreviations = user.unlockedAbbreviations;

  // Log unlocked abbreviations for debugging
  console.log('Unlocked abbreviations in Home component:', { 
    count: unlockedAbbreviations.length,
    abbreviations: unlockedAbbreviations.map(abbr => abbr.abbreviation)
  });

  return (
    <HomeContainer>
      <WelcomeSection>
        <Title>Welcome back, {user.username}!</Title>
        <p>Continue your typing journey and unlock more abbreviations as you progress.</p>

        <StatsContainer>
          <StatCard>
            <StatValue>{user.level}</StatValue>
            <StatLabel>Current Level</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{highestWPM}</StatValue>
            <StatLabel>Highest WPM</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{averageAccuracy}%</StatValue>
            <StatLabel>Average Accuracy</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{unlockedAbbreviations.length}</StatValue>
            <StatLabel>Abbreviations Unlocked</StatLabel>
          </StatCard>
        </StatsContainer>

        {/* Display database connection status */}
        <DatabaseStatus />
      </WelcomeSection>

      <LevelsSection>
        <SectionTitle>Game Levels</SectionTitle>
        <LevelsGrid>
          {gameLevels.map((level) => {
            // Convert both values to numbers to ensure proper comparison
            const userLevelNum = Number(user.level);
            const levelIdNum = Number(level.id);

            // Find the maximum level in the user's high scores
            const maxCompletedLevel = user.highScores.length > 0 
              ? Math.max(...user.highScores.map(score => score.level))
              : 0;

            // A level is unlocked if:
            // 1. The user's level is greater than or equal to the level ID (original logic)
            // 2. OR the user has completed the previous level (has a score for it)
            // 3. OR the user has a score for this level (already completed it)
            // 4. OR the user has a score for a higher level (implying this level should be accessible)
            const hasScoreForThisLevel = user.highScores.some(score => score.level === levelIdNum);
            const hasScoreForHigherLevel = user.highScores.some(score => score.level > levelIdNum);

            const isUnlocked = userLevelNum >= levelIdNum || 
                              (maxCompletedLevel >= levelIdNum - 1) ||
                              hasScoreForThisLevel ||
                              hasScoreForHigherLevel;

            // Check if the level has been completed (has a score)
            const levelScores = user.highScores.filter(score => score.level === levelIdNum);
            const isCompleted = levelScores.length > 0;

            // Find the highest WPM for this level if it has been completed
            const highestLevelWPM = isCompleted 
              ? Math.max(...levelScores.map(score => score.wpm))
              : 0;

            // Log which levels are unlocked with detailed type information
            console.log(`Level ${level.id} unlocked status:`, { 
              levelId: level.id,
              levelIdType: typeof level.id,
              levelIdNum,
              userLevel: user.level,
              userLevelType: typeof user.level,
              userLevelNum,
              maxCompletedLevel,
              isUnlocked,
              isCompleted,
              highestLevelWPM,
              hasScoreForThisLevel,
              hasScoreForHigherLevel,
              comparison: `${userLevelNum} >= ${levelIdNum} || ${maxCompletedLevel} >= ${levelIdNum - 1} || hasScoreForThisLevel || hasScoreForHigherLevel`
            });

            return (
              <LevelCard key={level.id} isUnlocked={isUnlocked}>
                <LevelTitle>Level {level.id}: {level.name}</LevelTitle>
                <LevelDescription>{level.description}</LevelDescription>
                <LevelRequirement>Required: {level.requiredWPM} WPM</LevelRequirement>
                {isCompleted && (
                  <HighWPM>
                    Your Best: <WPMBadge>{highestLevelWPM} WPM</WPMBadge>
                  </HighWPM>
                )}
                <PlayButton 
                  to={`/game/${level.id}`} 
                  isUnlocked={isUnlocked}
                >
                  {isUnlocked ? 'Play Level' : 'Locked'}
                </PlayButton>
              </LevelCard>
            );
          })}
        </LevelsGrid>
      </LevelsSection>

      <AbbreviationsSection>
        <SectionTitle>Your Unlocked Abbreviations</SectionTitle>
        {unlockedAbbreviations.length > 0 ? (
          <AbbreviationsList>
            {unlockedAbbreviations.map((abbr) => (
              <AbbreviationCard key={abbr.id}>
                <AbbreviationHeader>
                  <AbbreviationTitle>{abbr.expansion}</AbbreviationTitle>
                  <AbbreviationShortcut>{abbr.abbreviation}</AbbreviationShortcut>
                </AbbreviationHeader>
                <AbbreviationDescription>{abbr.description}</AbbreviationDescription>
              </AbbreviationCard>
            ))}
          </AbbreviationsList>
        ) : (
          <NoAbbreviations>
            You haven't unlocked any abbreviations yet. Complete levels to unlock them!
          </NoAbbreviations>
        )}
      </AbbreviationsSection>
    </HomeContainer>
  );
};

export default Home;
