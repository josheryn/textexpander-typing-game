import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

const HeaderContainer = styled.header`
  background-color: var(--card-background);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem 2rem;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
  display: flex;
  align-items: center;

  a {
    color: inherit;
    text-decoration: none;
    display: flex;
    align-items: center;
  }

  img {
    height: 60px;
  }

  span {
    margin-left: 10px;
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 1.5rem;
  align-items: center;
`;

const NavLink = styled(Link)`
  color: var(--text-color);
  font-weight: 500;

  &:hover {
    color: var(--primary-color);
    text-decoration: none;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserName = styled.span`
  font-weight: 500;
`;

const LogoutButton = styled.button`
  background: none;
  color: var(--text-color);
  padding: 0.25rem 0.5rem;

  &:hover {
    background-color: #f0f0f0;
    color: var(--error-color);
  }
`;

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo>
          <Link to="/">
            <img src="/images/textexpander-logo.png" alt="TextExpander" />
            <span>Typing Game</span>
          </Link>
        </Logo>
        <Nav>
          {user ? (
            <>
              <NavLink to="/">Home</NavLink>
              <NavLink to="/leaderboard">Leaderboard</NavLink>
              <NavLink to="/profile">Profile</NavLink>
              <UserInfo>
                <UserName>Hi, {user.username}</UserName>
                <LogoutButton onClick={onLogout}>Logout</LogoutButton>
              </UserInfo>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/leaderboard">Leaderboard</NavLink>
            </>
          )}
        </Nav>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;
