import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import styled from 'styled-components'

// Pages
import Login from './pages/Login'
import Home from './pages/Home'
import Game from './pages/Game'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'

// Components
import Header from './components/Header'
import Footer from './components/Footer'

// Types
import { User } from './types'

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
`

const MainContent = styled.main`
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`

function App() {
  const [user, setUser] = useState<User | null>(null)
  
  // Check if user is logged in from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  // Save user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    }
  }, [user])

  const handleLogin = (username: string) => {
    // In a real app, we would validate the user here
    const newUser: User = {
      username,
      level: 1,
      highScores: [],
      unlockedAbbreviations: []
    }
    setUser(newUser)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AppContainer>
      <Header user={user} onLogout={handleLogout} />
      <MainContent>
        <Routes>
          <Route path="/" element={user ? <Home user={user} /> : <Navigate to="/login" />} />
          <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
          <Route path="/game/:level" element={user ? <Game user={user} setUser={setUser} /> : <Navigate to="/login" />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" />} />
        </Routes>
      </MainContent>
      <Footer />
    </AppContainer>
  )
}

export default App