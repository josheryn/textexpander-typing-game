import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { User, GameLevel, Abbreviation } from '../types';
import { gameLevels, abbreviations } from '../data/gameData';

interface HomeProps {
  user: User;
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

const Home: React.FC<HomeProps> = ({ user }) => {
  const [highestWPM, setHighestWPM] = useState(0);
  const [averageAccuracy, setAverageAccuracy] = useState(0);
  
  useEffect(() => {
    // Calculate highest WPM from user's high scores
    if (user.highScores.length > 0) {
      const maxWPM = Math.max(...user.highScores.map(score => score.wpm));
      setHighestWPM(maxWPM);
      
      // Calculate average accuracy
      const totalAccuracy = user.highScores.reduce((sum, score) => sum + score.accuracy, 0);
      setAverageAccuracy(Math.round(totalAccuracy / user.highScores.length));
    }
  }, [user.highScores]);
  
  // Filter unlocked abbreviations
  const unlockedAbbreviations = user.unlockedAbbreviations;
  
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
      </WelcomeSection>
      
      <LevelsSection>
        <SectionTitle>Game Levels</SectionTitle>
        <LevelsGrid>
          {gameLevels.map((level) => {
            const isUnlocked = user.level >= level.id;
            
            return (
              <LevelCard key={level.id} isUnlocked={isUnlocked}>
                <LevelTitle>Level {level.id}: {level.name}</LevelTitle>
                <LevelDescription>{level.description}</LevelDescription>
                <LevelRequirement>Required: {level.requiredWPM} WPM</LevelRequirement>
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