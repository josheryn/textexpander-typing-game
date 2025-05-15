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

// Define a type for the users object
interface UsersData {
  [username: string]: User;
}

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
    try {
      const currentUser = localStorage.getItem('currentUser')
      if (currentUser) {
        const usersData = localStorage.getItem('users')
        if (usersData) {
          const users: UsersData = JSON.parse(usersData)
          if (users[currentUser]) {
            setUser(users[currentUser])
          }
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      // If there's an error, we'll just start with no user logged in
    }
  }, [])

  // Save user to localStorage when it changes
  useEffect(() => {
    if (user) {
      try {
        // Get existing users data or initialize empty object
        let users: UsersData = {}
        try {
          const usersData = localStorage.getItem('users')
          if (usersData) {
            users = JSON.parse(usersData)
          }
        } catch (error) {
          console.error('Error parsing users data, starting fresh:', error)
          // If there's an error parsing, we'll start with an empty users object
        }

        // Update the user data
        users[user.username] = user

        // Save back to localStorage
        localStorage.setItem('users', JSON.stringify(users))
        localStorage.setItem('currentUser', user.username)
      } catch (error) {
        console.error('Error saving user data:', error)
        // If localStorage is not available, we'll still have the user in memory
      }
    }
  }, [user])

  const handleLogin = (username: string) => {
    try {
      // Check if we have existing data for this username
      let users: UsersData = {}
      try {
        const usersData = localStorage.getItem('users')
        if (usersData) {
          users = JSON.parse(usersData)
        }
      } catch (error) {
        console.error('Error parsing users data, starting fresh:', error)
        // If there's an error parsing, we'll start with an empty users object
      }

      if (users[username]) {
        // User exists, use their data
        setUser(users[username])
      } else {
        // Create a new user
        const newUser: User = {
          username,
          level: 1,
          highScores: [],
          unlockedAbbreviations: [],
          lastUnlockedAbbreviation: null
        }
        setUser(newUser)
      }
    } catch (error) {
      console.error('Error during login:', error)
      // If localStorage is not available, we'll create a new user in memory
      const newUser: User = {
        username,
        level: 1,
        highScores: [],
        unlockedAbbreviations: [],
        lastUnlockedAbbreviation: null
      }
      setUser(newUser)
    }
  }

  const handleLogout = () => {
    try {
      // Just remove the current user reference, but keep the users data
      localStorage.removeItem('currentUser')
    } catch (error) {
      console.error('Error during logout:', error)
      // Even if we can't remove from localStorage, we can still clear the user in memory
    }
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
