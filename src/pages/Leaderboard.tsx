import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { LeaderboardEntry } from '../types';

const LeaderboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Title = styled.h1`
  color: var(--primary-color);
  margin-bottom: 1rem;
`;

const LeaderboardCard = styled.div`
  background-color: var(--card-background);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  overflow: hidden;
`;

const LeaderboardTable = styled.table`
  width: 100%;
  border-collapse: collapse;
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

const RankCell = styled.td`
  font-weight: 700;
  color: var(--primary-color);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--light-text-color);
  font-style: italic;
`;

const FilterControls = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: white;
  min-width: 150px;
`;

const Leaderboard: React.FC = () => {
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<LeaderboardEntry[]>([]);
  const [levelFilter, setLevelFilter] = useState<number | 'all'>('all');
  
  useEffect(() => {
    // Load leaderboard data from localStorage
    const storedLeaderboard = localStorage.getItem('leaderboard');
    if (storedLeaderboard) {
      setLeaderboardEntries(JSON.parse(storedLeaderboard));
    } else {
      // If no leaderboard exists yet, create an empty one
      setLeaderboardEntries([]);
      localStorage.setItem('leaderboard', JSON.stringify([]));
    }
  }, []);
  
  useEffect(() => {
    // Apply filters
    if (levelFilter === 'all') {
      setFilteredEntries([...leaderboardEntries].sort((a, b) => b.wpm - a.wpm));
    } else {
      setFilteredEntries(
        [...leaderboardEntries]
          .filter(entry => entry.level === levelFilter)
          .sort((a, b) => b.wpm - a.wpm)
      );
    }
  }, [leaderboardEntries, levelFilter]);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  return (
    <LeaderboardContainer>
      <div>
        <Title>Leaderboard</Title>
        <p>See how you stack up against other players!</p>
      </div>
      
      <LeaderboardCard>
        <FilterControls>
          <div>
            <label htmlFor="level-filter">Filter by Level: </label>
            <Select 
              id="level-filter"
              value={levelFilter.toString()}
              onChange={(e) => setLevelFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            >
              <option value="all">All Levels</option>
              {Array.from({ length: 10 }, (_, i) => i + 1).map(level => (
                <option key={level} value={level}>Level {level}</option>
              ))}
            </Select>
          </div>
        </FilterControls>
        
        {filteredEntries.length > 0 ? (
          <LeaderboardTable>
            <TableHeader>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Level</th>
                <th>WPM</th>
                <th>Accuracy</th>
                <th>Date</th>
              </tr>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry, index) => (
                <tr key={`${entry.username}-${entry.date}-${index}`}>
                  <RankCell>{index + 1}</RankCell>
                  <td>{entry.username}</td>
                  <td>Level {entry.level}</td>
                  <td>{entry.wpm}</td>
                  <td>{entry.accuracy}%</td>
                  <td>{formatDate(entry.date)}</td>
                </tr>
              ))}
            </TableBody>
          </LeaderboardTable>
        ) : (
          <EmptyState>
            No scores recorded yet. Be the first to set a high score!
          </EmptyState>
        )}
      </LeaderboardCard>
    </LeaderboardContainer>
  );
};

export default Leaderboard;