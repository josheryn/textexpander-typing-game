import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { User, GameScore, Abbreviation, LeaderboardEntry, GameLevel } from '../types';
import { getLevelById, getAbbreviationsForLevel, getLevelWithUnlockedAbbreviation, unlockAbbreviationsForLevel } from '../data/gameData';
import { addLeaderboardScore, addLeaderboardScoreToLocalStorage, saveUser, saveUserToLocalStorage } from '../services/api';

interface GameProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const LevelTitle = styled.h1`
  color: var(--primary-color);
  margin: 0;
`;

const GameStats = styled.div`
  display: flex;
  gap: 1.5rem;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: var(--light-text-color);
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const GameCard = styled.div`
  background-color: var(--card-background);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
`;

const TextDisplay = styled.div`
  font-family: var(--monospace-font);
  font-size: 1.2rem;
  line-height: 1.8;
  margin-bottom: 2rem;
  white-space: pre-wrap;
  position: relative;
`;

const TextToType = styled.div`
  position: relative;
`;

const TypedText = styled.span<{ isCorrect: boolean }>`
  position: relative;
  color: ${props => props.isCorrect ? 'var(--success-color)' : 'var(--error-color)'};
  background-color: ${props => props.isCorrect ? 'rgba(106, 168, 79, 0.1)' : 'rgba(204, 0, 0, 0.1)'};
`;

const CurrentCursor = styled.span`
  position: relative;
  &::after {
    content: '';
    position: absolute;
    height: 1.2rem;
    width: 2px;
    background-color: var(--primary-color);
    animation: blink 1s step-end infinite;
  }

  @keyframes blink {
    from, to { opacity: 1; }
    50% { opacity: 0; }
  }
`;

const RemainingText = styled.span`
  color: var(--light-text-color);
`;

const InputArea = styled.textarea`
  width: 100%;
  height: 150px;
  padding: 1rem;
  font-family: var(--monospace-font);
  font-size: 1.2rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  resize: none;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const GameControls = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
`;

const PrimaryButton = styled(Button)`
  background-color: var(--primary-color);
  color: white;

  &:hover {
    background-color: #3a76d8;
  }
`;

const SecondaryButton = styled(Button)`
  background-color: transparent;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);

  &:hover {
    background-color: rgba(74, 134, 232, 0.1);
  }
`;

const ResultsCard = styled.div`
  background-color: var(--card-background);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  text-align: center;
`;

const ResultTitle = styled.h2`
  color: var(--primary-color);
  margin-bottom: 1rem;
`;

const ResultStats = styled.div`
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin: 2rem 0;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
  }
`;

const ResultButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
`;

const AntiCheatDialog = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: rgba(204, 0, 0, 0.1);
  border-radius: 8px;
  border: 1px solid var(--error-color);
`;

const AntiCheatTitle = styled.h3`
  color: var(--error-color);
  margin-bottom: 1rem;
`;

const AntiCheatInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  font-family: var(--monospace-font);
  font-size: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  margin-bottom: 1rem;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const UnlockedAbbreviation = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: rgba(106, 168, 79, 0.1);
  border-radius: 8px;
  border: 1px solid var(--success-color);
`;

const AbbreviationTitle = styled.h3`
  color: var(--success-color);
  margin-bottom: 1rem;
`;

const AbbreviationDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const AbbreviationShortcut = styled.code`
  background-color: white;
  padding: 0.5rem;
  border-radius: 4px;
  font-family: var(--monospace-font);
  font-size: 1rem;
  border: 1px solid var(--border-color);
`;

const AbbreviationExpansion = styled.div`
  background-color: white;
  padding: 0.5rem;
  border-radius: 4px;
  font-family: var(--monospace-font);
  font-size: 0.9rem;
  border: 1px solid var(--border-color);
  white-space: pre-wrap;
`;

const AbbreviationsSection = styled.div`
  margin-top: 2rem;
`;

const AbbreviationsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const AbbreviationCard = styled.div`
  background-color: var(--card-background);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const Game: React.FC<GameProps> = ({ user, setUser }) => {
  const { level: levelId } = useParams<{ level: string }>();
  const navigate = useNavigate();

  const [level, setLevel] = useState<GameLevel | undefined>(getLevelById(Number(levelId)));
  const [lastUnlockedAbbreviation, setLastUnlockedAbbreviation] = useState<Abbreviation | null>(user.lastUnlockedAbbreviation || null);

  // Update level when levelId changes
  useEffect(() => {
    const newLevel = getLevelById(Number(levelId));

    // Always use the modified level text with expansion text incorporated
    if (newLevel) {
      // Modify the level text to include a reference to the abbreviation for this level
      const modifiedLevel = getLevelWithUnlockedAbbreviation(newLevel, lastUnlockedAbbreviation);
      setLevel(modifiedLevel);
    } else {
      setLevel(newLevel);
    }
  }, [levelId, lastUnlockedAbbreviation]);

  // Debug log to track level changes
  useEffect(() => {
    console.log('Current levelId:', levelId);
    console.log('Current level:', level);
  }, [levelId, level]);

  const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [typedText, setTypedText] = useState('');
  const [errors, setErrors] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [unlockedAbbreviation, setUnlockedAbbreviation] = useState<Abbreviation | null>(null);
  const [availableAbbreviations, setAvailableAbbreviations] = useState<Abbreviation[]>([]);
  const [abbreviationsUsed, setAbbreviationsUsed] = useState(0);
  const [needsAntiCheatVerification, setNeedsAntiCheatVerification] = useState(false);
  const [antiCheatVerificationText, setAntiCheatVerificationText] = useState('');
  const [pendingScore, setPendingScore] = useState<{
    updatedUser: User;
    leaderboardEntry: LeaderboardEntry;
  } | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize the game when levelId changes
  useEffect(() => {
    const currentLevel = getLevelById(Number(levelId));

    if (!currentLevel) {
      // If level doesn't exist, redirect to home
      navigate('/');
      return;
    }

    // Only reset game state if we're not in the 'finished' state
    // This prevents resetting to 'ready' after completing a level
    if (gameState !== 'finished') {
      setGameState('ready');
      setTypedText('');
      setErrors(0);
      setWpm(0);
      setAccuracy(100);
      setUnlockedAbbreviation(null);
      setAbbreviationsUsed(0);
    }

    // Ensure all abbreviations up to this level are unlocked
    const updatedUnlockedAbbreviations = unlockAbbreviationsForLevel(
      Number(levelId),
      user.unlockedAbbreviations
    );

    // Only update if there are new abbreviations to unlock
    if (updatedUnlockedAbbreviations.length > user.unlockedAbbreviations.length) {
      console.log(`Unlocking abbreviations for level ${levelId}. Before: ${user.unlockedAbbreviations.length}, After: ${updatedUnlockedAbbreviations.length}`);

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
            console.log('User abbreviations updated successfully');
          } else {
            console.warn('Failed to save updated abbreviations to database, falling back to localStorage');
            saveUserToLocalStorage(updatedUser);
          }
        })
        .catch(error => {
          console.error('Error saving updated abbreviations to database:', error);
          saveUserToLocalStorage(updatedUser);
        });
    }
  }, [levelId, navigate, user, setUser]);

  // Update available abbreviations when user level or levelId changes
  useEffect(() => {
    // Use the maximum of user.level and current levelId to ensure all abbreviations are available
    const currentLevelId = Number(levelId);
    const effectiveLevel = Math.max(user.level, currentLevelId);

    // Get abbreviations for the effective level
    const abbrs = getAbbreviationsForLevel(effectiveLevel);

    // Remove duplicates by creating a Map with abbreviation ID as key
    const uniqueAbbrs = Array.from(
      new Map(abbrs.map(abbr => [abbr.id, abbr])).values()
    );

    console.log(`Setting available abbreviations. User level: ${user.level}, Current level: ${currentLevelId}, Effective level: ${effectiveLevel}, Abbreviations count: ${uniqueAbbrs.length} (before deduplication: ${abbrs.length})`);

    setAvailableAbbreviations(uniqueAbbrs);
  }, [user.level, levelId]);

  // Add keyboard event listener to start game on key press when in 'ready' state
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'ready' && e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        // Start the game first
        startGame();

        // Then set the first character in the next tick
        setTimeout(() => {
          // Set the typed text directly
          setTypedText(e.key);

          // Update the input field value
          if (inputRef.current) {
            inputRef.current.value = e.key;
          }

          // Count errors for the first character
          const targetText = level?.text || '';
          let errorCount = 0;
          if (e.key !== targetText[0]) {
            errorCount = 1;
          }
          setErrors(errorCount);
        }, 0);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState, level]);

  // Start the game
  const startGame = () => {
    setGameState('playing');
    setStartTime(Date.now());
    setTypedText('');
    setErrors(0);

    // Focus the input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (gameState !== 'playing') return;

    const currentInput = e.target.value;
    setTypedText(currentInput);

    // Check for abbreviation usage
    const lastWord = currentInput.split(' ').pop() || '';

    // Check for exact match or match with a double quote in front
    const matchingAbbreviation = availableAbbreviations.find(abbr => 
      lastWord === abbr.abbreviation || lastWord.endsWith('"' + abbr.abbreviation)
    );

    if (matchingAbbreviation) {
      // Check if the abbreviation has a double quote in front
      const hasQuote = lastWord.endsWith('"' + matchingAbbreviation.abbreviation);

      // Calculate the length to remove (abbreviation length + quote if present)
      const lengthToRemove = hasQuote 
        ? matchingAbbreviation.abbreviation.length + 1 // +1 for the quote
        : matchingAbbreviation.abbreviation.length;

      // Replace the abbreviation with its expansion, preserving the quote if needed
      const withoutAbbr = currentInput.slice(0, currentInput.length - lengthToRemove);
      const newText = hasQuote 
        ? withoutAbbr + '"' + matchingAbbreviation.expansion // Keep the quote
        : withoutAbbr + matchingAbbreviation.expansion;

      setTypedText(newText);
      setAbbreviationsUsed(prev => prev + 1);

      // Set cursor position after the expansion
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.value = newText;
          inputRef.current.selectionStart = newText.length;
          inputRef.current.selectionEnd = newText.length;
        }
      }, 0);
    }

    // Count errors
    let errorCount = 0;
    // Use the level state that has been modified by getLevelWithUnlockedAbbreviation
    const targetText = level?.text || '';

    for (let i = 0; i < currentInput.length; i++) {
      if (i >= targetText.length || currentInput[i] !== targetText[i]) {
        errorCount++;
      }
    }

    setErrors(errorCount);

    // Check if the game is complete
    if (currentInput.length >= targetText.length) {
      finishGame();
    }
  };

  // Finish the game
  const finishGame = () => {
    // Use the level state that has been modified by getLevelWithUnlockedAbbreviation
    if (gameState !== 'playing' || !level) return;

    const endTimeStamp = Date.now();
    setGameState('finished');

    // Calculate results
    const timeInMinutes = (endTimeStamp - (startTime || 0)) / 60000;
    const charactersTyped = typedText.length;
    const wordsTyped = charactersTyped / 5; // Standard: 5 characters = 1 word
    const calculatedWpm = Math.round(wordsTyped / timeInMinutes);
    const calculatedAccuracy = Math.round(((charactersTyped - errors) / charactersTyped) * 100);

    setWpm(calculatedWpm);
    setAccuracy(calculatedAccuracy);

    // Create a new score
    const newScore: GameScore = {
      level: Number(levelId),
      wpm: calculatedWpm,
      accuracy: calculatedAccuracy,
      date: new Date().toISOString(),
      abbreviationsUsed
    };

    // Add to high scores and sort by WPM (highest first)
    const updatedHighScores = [...user.highScores, newScore]
      .sort((a, b) => b.wpm - a.wpm);

    // Keep only top 10 scores
    const topScores = updatedHighScores.slice(0, 10);

    // Create a single updated user object with all changes
    let updatedUser = {
      ...user,
      highScores: topScores
    };

    // Check if the user passed the level
    const passed = level ? calculatedWpm >= level.requiredWPM : false;

    if (passed) {
      // Find the maximum level in the user's high scores
      const maxCompletedLevel = updatedUser.highScores.length > 0 
        ? Math.max(...updatedUser.highScores.map(score => score.level))
        : 0;

      // Level up the user to the maximum of:
      // 1. Their current level
      // 2. The completed level + 1
      // 3. The maximum completed level + 1
      const newLevel = Math.max(
        user.level, 
        Number(levelId) + 1,
        maxCompletedLevel + 1
      );
      updatedUser.level = newLevel;

      // Get the next level's ID
      const nextLevelId = Number(levelId) + 1;

      // Get the next level
      const nextLevel = getLevelById(nextLevelId);

      // Check if there's an abbreviation to unlock in the current level
      const currentAbbrevToUnlock = level ? level.unlockableAbbreviation : undefined;

      // Check if there's an abbreviation to unlock in the next level (to display to the user)
      const nextAbbrevToUnlock = nextLevel ? nextLevel.unlockableAbbreviation : undefined;

      if (currentAbbrevToUnlock && !user.unlockedAbbreviations.some(a => a.id === currentAbbrevToUnlock.id)) {
        // Display the next level's abbreviation as unlocked
        // If there's no next level (e.g., user completed level 10), don't show any abbreviation as unlocked
        setUnlockedAbbreviation(nextAbbrevToUnlock || null);

        // Store the current level's abbreviation as the last unlocked abbreviation to use in the next level
        setLastUnlockedAbbreviation(currentAbbrevToUnlock);

        // Add the current level's abbreviation to user's unlocked list and store it as the last unlocked abbreviation
        updatedUser.unlockedAbbreviations = [...user.unlockedAbbreviations, currentAbbrevToUnlock];
        updatedUser.lastUnlockedAbbreviation = currentAbbrevToUnlock;
      }

      // We no longer automatically progress to the next level
      // Instead, the user will click the "Next Level" button on the score summary screen
    }

    // Create leaderboard entry
    const leaderboardEntry: LeaderboardEntry = {
      id: 0, // Temporary ID, will be replaced by the server
      username: user.username,
      level: Number(levelId),
      wpm: calculatedWpm,
      accuracy: calculatedAccuracy,
      date: new Date().toISOString(),
      abbreviationsUsed
    };

    // Check if the score is suspiciously high (> 200 WPM)
    if (calculatedWpm > 200) {
      // Store the score data for later verification
      setPendingScore({
        updatedUser,
        leaderboardEntry
      });

      // Set the anti-cheat verification flag
      setNeedsAntiCheatVerification(true);

      // Reset the verification text
      setAntiCheatVerificationText('');

      // Update the user state but don't save to database yet
      setUser(updatedUser);
    } else {
      // Score is not suspiciously high, save it immediately

      // Set the user with all updates in a single operation
      console.log('Updating user after completing level:', { 
        username: updatedUser.username, 
        oldLevel: user.level, 
        newLevel: updatedUser.level,
        passed
      });
      setUser(updatedUser);

      // Explicitly save user data to database to ensure level persistence
      saveUser(updatedUser)
        .then(success => {
          if (success) {
            console.log('User level and unlocked abbreviations saved successfully to database');
          } else {
            console.warn('Failed to save user level to database, falling back to localStorage');
            saveUserToLocalStorage(updatedUser);
          }
        })
        .catch(error => {
          console.error('Error saving user level to database:', error);
          saveUserToLocalStorage(updatedUser);
        });

      // Try to save to API first, then fall back to localStorage if needed
      addLeaderboardScore(leaderboardEntry)
        .then(success => {
          if (!success) {
            console.warn('Failed to save score to API leaderboard, falling back to localStorage');
            // Fall back to localStorage
            addLeaderboardScoreToLocalStorage(leaderboardEntry);
          }
        })
        .catch(error => {
          console.error('Error saving score to API leaderboard:', error);
          // Fall back to localStorage
          addLeaderboardScoreToLocalStorage(leaderboardEntry);
        });
    }
  };

  // Restart the game
  const restartGame = () => {
    setGameState('ready');
    setTypedText('');
    setErrors(0);
    setWpm(0);
    setAccuracy(100);
    setUnlockedAbbreviation(null);
    setAbbreviationsUsed(0);
    setNeedsAntiCheatVerification(false);
    setAntiCheatVerificationText('');
    setPendingScore(null);

    // Don't reset lastUnlockedAbbreviation here, as we want to keep it for the next level
  };

  // Handle anti-cheat verification
  const handleVerification = () => {
    // Check if the verification text matches exactly "I did not cheat"
    if (antiCheatVerificationText.trim() === "I did not cheat") {
      // Verification successful, save the score
      if (pendingScore) {
        const { updatedUser, leaderboardEntry } = pendingScore;

        // Log the verification success
        console.log('Anti-cheat verification successful, saving score:', { 
          username: updatedUser.username, 
          wpm: leaderboardEntry.wpm
        });

        // Save user data to database
        saveUser(updatedUser)
          .then(success => {
            if (success) {
              console.log('User level and unlocked abbreviations saved successfully to database');
            } else {
              console.warn('Failed to save user level to database, falling back to localStorage');
              saveUserToLocalStorage(updatedUser);
            }
          })
          .catch(error => {
            console.error('Error saving user level to database:', error);
            saveUserToLocalStorage(updatedUser);
          });

        // Save score to leaderboard
        addLeaderboardScore(leaderboardEntry)
          .then(success => {
            if (!success) {
              console.warn('Failed to save score to API leaderboard, falling back to localStorage');
              // Fall back to localStorage
              addLeaderboardScoreToLocalStorage(leaderboardEntry);
            }
          })
          .catch(error => {
            console.error('Error saving score to API leaderboard:', error);
            // Fall back to localStorage
            addLeaderboardScoreToLocalStorage(leaderboardEntry);
          });

        // Reset verification state
        setNeedsAntiCheatVerification(false);
        setPendingScore(null);
      }
    } else {
      // Verification failed, show an alert
      alert("Verification failed. Please type exactly: I did not cheat");
    }
  };

  // Navigate to the next level
  const goToNextLevel = () => {
    // Use the levelId parameter to determine the next level
    const nextLevelId = Number(levelId) + 1;

    // Get the next level before navigation
    const nextLevel = getLevelById(nextLevelId);

    // Reset game state to ready before navigation
    setGameState('ready');

    // Navigate to the next level
    navigate(`/game/${nextLevelId}`);

    // Update the level state directly
    if (nextLevel) {
      const modifiedLevel = getLevelWithUnlockedAbbreviation(nextLevel, lastUnlockedAbbreviation);
      setLevel(modifiedLevel);
    }
  };

  // Insert abbreviation into the text
  const insertAbbreviation = (abbr: Abbreviation) => {
    if (gameState !== 'playing' || !inputRef.current) return;

    const cursorPos = inputRef.current.selectionStart || 0;
    const textBefore = typedText.substring(0, cursorPos);
    const textAfter = typedText.substring(cursorPos);

    const newText = textBefore + abbr.expansion + textAfter;
    setTypedText(newText);
    setAbbreviationsUsed(prev => prev + 1);

    // Set cursor position after the expansion
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.value = newText;
        inputRef.current.selectionStart = cursorPos + abbr.expansion.length;
        inputRef.current.selectionEnd = cursorPos + abbr.expansion.length;
        inputRef.current.focus();
      }
    }, 0);
  };

  // Render the text with highlighting for typed characters
  const renderText = useCallback(() => {
    // Use the level state that has been modified by getLevelWithUnlockedAbbreviation
    if (!level) return null;

    const targetText = level.text;

    return (
      <TextToType>
        {typedText.split('').map((char, index) => (
          <TypedText key={index} isCorrect={index < targetText.length && char === targetText[index]}>
            {char}
          </TypedText>
        ))}
        <CurrentCursor />
        <RemainingText>
          {targetText.slice(typedText.length)}
        </RemainingText>
      </TextToType>
    );
  }, [level, typedText]);

  // Use the level state that has been modified by getLevelWithUnlockedAbbreviation
  if (!level) {
    return <div>Level not found</div>;
  }

  return (
    <GameContainer>
      <GameHeader>
        <LevelTitle>Level {level.id}: {level.name}</LevelTitle>
        <GameStats>
          {gameState === 'playing' && (
            <>
              <StatItem>
                <StatValue>{errors}</StatValue>
                <StatLabel>Errors</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{Math.max(0, 100 - Math.round((errors / Math.max(1, typedText.length)) * 100))}%</StatValue>
                <StatLabel>Accuracy</StatLabel>
              </StatItem>
            </>
          )}
        </GameStats>
      </GameHeader>

      {gameState === 'ready' && (
        <GameCard>
          <h2>Ready to start Level {level.id}?</h2>
          <p>Required WPM: {level.requiredWPM}</p>
          <p>You'll be typing the following text:</p>
          <TextDisplay>{level.text}</TextDisplay>

          {availableAbbreviations.length > 0 && (
            <AbbreviationsSection>
              <h3>Available Abbreviations</h3>
              <p>Use these abbreviations to speed up your typing</p>
              <AbbreviationsList>
                {availableAbbreviations.map(abbr => (
                  <AbbreviationCard key={abbr.id}>
                    <strong>{abbr.abbreviation}</strong> → {abbr.expansion.length > 30 ? abbr.expansion.substring(0, 30) + '...' : abbr.expansion}
                  </AbbreviationCard>
                ))}
              </AbbreviationsList>
            </AbbreviationsSection>
          )}

          <PrimaryButton onClick={startGame} style={{ marginTop: '2rem' }}>Start Typing</PrimaryButton>
        </GameCard>
      )}

      {gameState === 'playing' && (
        <>
          <GameCard>
            <TextDisplay>
              {renderText()}
            </TextDisplay>
            <InputArea 
              ref={inputRef}
              value={typedText}
              onChange={handleInputChange}
              placeholder="Start typing here..."
              autoFocus
            />
            <GameControls>
              <SecondaryButton onClick={restartGame}>Restart</SecondaryButton>
            </GameControls>
          </GameCard>

          {availableAbbreviations.length > 0 && (
            <AbbreviationsSection>
              <h3>Available Abbreviations</h3>
              <p>Click to insert or type the abbreviation directly</p>
              <AbbreviationsList>
                {availableAbbreviations.map(abbr => (
                  <AbbreviationCard key={abbr.id} onClick={() => insertAbbreviation(abbr)}>
                    <strong>{abbr.abbreviation}</strong> → {abbr.expansion.length > 30 ? abbr.expansion.substring(0, 30) + '...' : abbr.expansion}
                  </AbbreviationCard>
                ))}
              </AbbreviationsList>
            </AbbreviationsSection>
          )}
        </>
      )}

      {gameState === 'finished' && (
        <ResultsCard>
          <ResultTitle>
            {wpm >= level.requiredWPM 
              ? 'Great job! Level completed!' 
              : 'Almost there! Keep practicing.'}
          </ResultTitle>

          <p>
            {wpm >= level.requiredWPM 
              ? `You've successfully completed Level ${level.id}!` 
              : `You need ${level.requiredWPM} WPM to pass this level. Try again!`}
          </p>

          <ResultStats>
            <StatItem>
              <StatValue>{wpm}</StatValue>
              <StatLabel>Words Per Minute</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{accuracy}%</StatValue>
              <StatLabel>Accuracy</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{abbreviationsUsed}</StatValue>
              <StatLabel>Abbreviations Used</StatLabel>
            </StatItem>
          </ResultStats>

          {needsAntiCheatVerification && (
            <AntiCheatDialog>
              <AntiCheatTitle>Verification Required</AntiCheatTitle>
              <p>Your typing speed is exceptionally high. To verify this score, please type the following text exactly:</p>
              <p style={{ fontWeight: 'bold', margin: '1rem 0' }}>I did not cheat</p>
              <AntiCheatInput
                type="text"
                value={antiCheatVerificationText}
                onChange={(e) => setAntiCheatVerificationText(e.target.value)}
                placeholder="Type the verification text here..."
                autoFocus
              />
              <PrimaryButton onClick={handleVerification}>Confirm</PrimaryButton>
            </AntiCheatDialog>
          )}

          {unlockedAbbreviation && (
            <UnlockedAbbreviation>
              <AbbreviationTitle>New Abbreviation Unlocked!</AbbreviationTitle>
              <AbbreviationDetails>
                <AbbreviationShortcut>{unlockedAbbreviation.abbreviation}</AbbreviationShortcut>
                <AbbreviationExpansion>{unlockedAbbreviation.expansion}</AbbreviationExpansion>
              </AbbreviationDetails>
              <p>{unlockedAbbreviation.description}</p>
            </UnlockedAbbreviation>
          )}

          <ResultButtons>
            <PrimaryButton onClick={restartGame}>Try Again</PrimaryButton>
            {wpm >= level.requiredWPM && level.id < 10 && !needsAntiCheatVerification && (
              <PrimaryButton onClick={goToNextLevel}>Next Level</PrimaryButton>
            )}
            <SecondaryButton onClick={() => navigate('/')}>Back to Home</SecondaryButton>
          </ResultButtons>
        </ResultsCard>
      )}
    </GameContainer>
  );
};

export default Game;
