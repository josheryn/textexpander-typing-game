import { useState } from 'react';
import styled from 'styled-components';

interface LoginProps {
  onLogin: (username: string) => void;
}

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  max-width: 500px;
  margin: 2rem auto;
  background-color: var(--card-background);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  color: var(--primary-color);
  margin-bottom: 1.5rem;
  text-align: center;
`;

const Description = styled.p`
  text-align: center;
  margin-bottom: 2rem;
  color: var(--light-text-color);
`;

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    border-color: var(--primary-color);
    outline: none;
  }
`;

const Button = styled.button`
  padding: 0.75rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 1rem;
  
  &:hover {
    background-color: #3a76d8;
  }
  
  &:disabled {
    background-color: var(--border-color);
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: var(--error-color);
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    
    // Username validation - only allow alphanumeric characters and underscores
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return;
    }
    
    // Clear any previous errors
    setError('');
    
    // Call the onLogin function passed from the parent component
    onLogin(username);
  };
  
  return (
    <LoginContainer>
      <Title>Welcome to TextExpander Typing Game</Title>
      <Description>
        Improve your typing speed, track your progress, and unlock TextExpander abbreviations
        as you level up through the game.
      </Description>
      
      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            autoFocus
          />
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </InputGroup>
        
        <Button type="submit" disabled={!username.trim()}>
          Start Typing
        </Button>
      </Form>
    </LoginContainer>
  );
};

export default Login;