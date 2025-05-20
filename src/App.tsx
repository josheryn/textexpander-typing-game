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

// Services
import { getUser, saveUser, getUserFromLocalStorage, saveUserToLocalStorage } from './services/api'

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

  // Check if user is logged in
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = localStorage.getItem('currentUser')
        if (currentUser) {
          // First try to get user from API
          const userData = await getUser(currentUser)

          if (userData) {
            setUser(userData)
          } else {
            // If API fails, try localStorage as fallback
            const localUser = getUserFromLocalStorage(currentUser)
            if (localUser) {
              setUser(localUser)

              // Try to save the local user to the API for future use
              saveUser(localUser).catch(err => 
                console.error('Failed to sync local user to API:', err)
              )
            }
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error)
        // If there's an error, we'll just start with no user logged in
      }
    }

    loadUser()
  }, [])

  // Save user when it changes
  useEffect(() => {
    if (user) {
      // Save to API
      saveUser(user)
        .then(success => {
          if (!success) {
            // If API save fails, fall back to localStorage
            console.warn('API save failed, falling back to localStorage')
            saveUserToLocalStorage(user)
          }
        })
        .catch(error => {
          console.error('Error saving user data to API:', error)
          // Fall back to localStorage
          saveUserToLocalStorage(user)
        })

      // Always save current user to localStorage for session persistence
      localStorage.setItem('currentUser', user.username)
    }
  }, [user])

  const handleLogin = async (username: string) => {
    try {
      // First try to get user from API
      const userData = await getUser(username)

      if (userData) {
        // User exists in API, use their data
        setUser(userData)
      } else {
        // Try to get user from localStorage as fallback
        const localUser = getUserFromLocalStorage(username)

        if (localUser) {
          // User exists in localStorage, use their data and sync to API
          setUser(localUser)
          await saveUser(localUser)
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

          // Try to save the new user to the API
          await saveUser(newUser).catch(err => {
            console.error('Failed to save new user to API:', err)
            // Fall back to localStorage
            saveUserToLocalStorage(newUser)
          })
        }
      }
    } catch (error) {
      console.error('Error during login:', error)
      // If all else fails, create a new user in memory
      const newUser: User = {
        username,
        level: 1,
        highScores: [],
        unlockedAbbreviations: [],
        lastUnlockedAbbreviation: null
      }
      setUser(newUser)
      // Try to save to localStorage as last resort
      saveUserToLocalStorage(newUser)
    }
  }

  const handleLogout = () => {
    try {
      // Just remove the current user reference from localStorage
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
