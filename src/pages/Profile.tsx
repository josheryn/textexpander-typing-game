import { useMemo } from 'react';
import styled from 'styled-components';
import { User, GameScore } from '../types';

interface ProfileProps {
  user: User;
}

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Title = styled.h1`
  color: var(--primary-color);
  margin-bottom: 1rem;
`;

const ProfileCard = styled.div`
  background-color: var(--card-background);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const UserAvatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 500;
`;

const UserDetails = styled.div`
  flex: 1;
`;

const Username = styled.h2`
  margin-bottom: 0.5rem;
`;

const UserLevel = styled.div`
  font-size: 1.1rem;
  color: var(--light-text-color);
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
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

const SectionTitle = styled.h3`
  margin: 2rem 0 1rem;
  color: var(--text-color);
  font-weight: 500;
`;

const ScoresTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
`;

const TableHeader = styled.thead`
  background-color: #f5f5f5;

  th {
    padding: 1rem;
    text-align: left;
    font-weight: 500;
    color: var(--text-color);
    border-bottom: 1px solid var(--border-color);
  }
`;

const TableBody = styled.tbody`
  tr:nth-child(even) {
    background-color: #f9f9f9;
  }

  tr:hover {
    background-color: rgba(74, 134, 232, 0.05);
  }

  td {
    padding: 1rem;
    border-bottom: 1px solid var(--border-color);
  }
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

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const highestWPM = useMemo(() => {
    if (user.highScores.length > 0) {
      return Math.max(...user.highScores.map(score => score.wpm));
    }
    return 0;
  }, [user.highScores]);

  const averageAccuracy = useMemo(() => {
    if (user.highScores.length > 0) {
      const totalAccuracy = user.highScores.reduce((sum, score) => sum + score.accuracy, 0);
      return Math.round(totalAccuracy / user.highScores.length);
    }
    return 0;
  }, [user.highScores]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get user's initial for avatar
  const userInitial = user.username.charAt(0).toUpperCase();

  // Sort high scores by WPM (highest first)
  const sortedScores = [...user.highScores].sort((a, b) => b.wpm - a.wpm);

  return (
    <ProfileContainer>
      <Title>Your Profile</Title>

      <ProfileCard>
        <UserInfo>
          <UserAvatar>{userInitial}</UserAvatar>
          <UserDetails>
            <Username>{user.username}</Username>
            <UserLevel>Level {user.level}</UserLevel>
          </UserDetails>
        </UserInfo>

        <StatsContainer>
          <StatCard>
            <StatValue>{highestWPM}</StatValue>
            <StatLabel>Highest WPM</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{averageAccuracy}%</StatValue>
            <StatLabel>Average Accuracy</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{user.highScores.length}</StatValue>
            <StatLabel>Games Completed</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{user.unlockedAbbreviations.length}</StatValue>
            <StatLabel>Abbreviations Unlocked</StatLabel>
          </StatCard>
        </StatsContainer>

        <SectionTitle>Your High Scores</SectionTitle>
        {sortedScores.length > 0 ? (
          <ScoresTable>
            <TableHeader>
              <tr>
                <th>Level</th>
                <th>WPM</th>
                <th>Accuracy</th>
                <th>Abbreviations Used</th>
                <th>Date</th>
              </tr>
            </TableHeader>
            <TableBody>
              {sortedScores.map((score: GameScore, index: number) => (
                <tr key={`score-${index}`}>
                  <td>Level {score.level}</td>
                  <td>{score.wpm}</td>
                  <td>{score.accuracy}%</td>
                  <td>{score.abbreviationsUsed}</td>
                  <td>{formatDate(score.date)}</td>
                </tr>
              ))}
            </TableBody>
          </ScoresTable>
        ) : (
          <p>You haven't completed any games yet. Start playing to record your scores!</p>
        )}

        <SectionTitle>Your Unlocked Abbreviations</SectionTitle>
        {user.unlockedAbbreviations.length > 0 ? (
          <AbbreviationsList>
            {user.unlockedAbbreviations.map((abbr) => (
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
      </ProfileCard>
    </ProfileContainer>
  );
};

export default Profile;
