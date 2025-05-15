import styled from 'styled-components';

const FooterContainer = styled.footer`
  background-color: var(--card-background);
  padding: 1.5rem 2rem;
  margin-top: 2rem;
  border-top: 1px solid var(--border-color);
`;

const FooterContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
`;

const Copyright = styled.div`
  color: var(--light-text-color);
  font-size: 0.9rem;
`;

const Links = styled.div`
  display: flex;
  gap: 1.5rem;
  
  a {
    color: var(--light-text-color);
    font-size: 0.9rem;
    
    &:hover {
      color: var(--primary-color);
    }
  }
`;

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <FooterContainer>
      <FooterContent>
        <Copyright>
          © {currentYear} TextExpander Typing Game. All rights reserved.
        </Copyright>
        <Links>
          <a href="https://textexpander.com" target="_blank" rel="noopener noreferrer">
            TextExpander
          </a>
          <a href="https://textexpander.com/about" target="_blank" rel="noopener noreferrer">
            About
          </a>
          <a href="https://textexpander.com/privacy" target="_blank" rel="noopener noreferrer">
            Privacy
          </a>
        </Links>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;