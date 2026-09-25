import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import PublicLayout from '../layouts/PublicLayout'
import AppShell from '../components/layout/AppShell'

import AboutPage from '../pages/public/AboutPage'
import GettingStartedPage from '../pages/public/GettingStartedPage'
import LoginPage from '../pages/public/LoginPage'
import SignupPage from '../pages/public/SignupPage'
import ForgotPasswordPage from '../pages/public/ForgotPasswordPage'

import DashboardPage from '../pages/app/DashboardPage'
import ChatsPage from '../pages/app/ChatsPage'
import ChatPage from '../pages/app/ChatPage'
import SourcesPage from '../pages/app/SourcesPage'
import ProfilePage from '../pages/app/ProfilePage'
import SettingsPage from '../pages/app/SettingsPage'

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
      <div className="text-sm text-[var(--color-text-muted)]">
        Loading...
      </div>
    </div>
  )
}

function PublicRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route element={<PublicLayout />}>
          <Route
            path="/about"
            element={<AboutPage />}
          />

          <Route
            path="/getting-started"
            element={<GettingStartedPage />}
          />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignupPage />
              </PublicRoute>
            }
          />

          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPasswordPage />
              </PublicRoute>
            }
          />
        </Route>

        {/* Application */}
        <Route element={<AppShell />}>
          <Route
            path="/"
            element={<DashboardPage />}
          />

          <Route
            path="/chats"
            element={<ChatsPage />}
          />

          <Route
            path="/chats/new"
            element={<ChatPage />}
          />

          <Route
            path="/chats/:chatId"
            element={<ChatPage />}
          />

          <Route
            path="/sources"
            element={<SourcesPage />}
          />

          <Route
            path="/profile"
            element={<ProfilePage />}
          />

          <Route
            path="/settings"
            element={<SettingsPage />}
          />
        </Route>

        {/* Fallback */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter