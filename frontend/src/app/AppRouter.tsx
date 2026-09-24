import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import LandingPage from '../pages/public/LandingPage'
import AboutPage from '../pages/public/AboutPage'
import GettingStartedPage from '../pages/public/GettingStartedPage'
import LoginPage from '../pages/public/LoginPage'
import SignupPage from '../pages/public/SignupPage'
import ForgotPasswordPage from '../pages/public/ForgotPasswordPage'

import DashboardPage from '../pages/app/DashboardPage'
import ChatsPage from '../pages/app/ChatsPage'
import ChatPage from '../pages/app/ChatPage'
import SourcesPage from '../pages/app/SourcesPage'
import StudyPage from '../pages/app/StudyPage'
import InsightsPage from '../pages/app/InsightsPage'
import AppGettingStartedPage from '../pages/app/AppGettingStartedPage'
import ProfilePage from '../pages/app/ProfilePage'
import SettingsPage from '../pages/app/SettingsPage'
import HelpPage from '../pages/app/HelpPage'
import AppAboutPage from '../pages/app/AppAboutPage'

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/getting-started" element={<GettingStartedPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Application routes */}
        <Route path="/app" element={<DashboardPage />} />
        <Route path="/app/chats" element={<ChatsPage />} />
        <Route path="/app/chats/:chatId" element={<ChatPage />} />
        <Route path="/app/sources" element={<SourcesPage />} />
        <Route path="/app/study" element={<StudyPage />} />
        <Route path="/app/study/insights" element={<InsightsPage />} />
        <Route
          path="/app/getting-started"
          element={<AppGettingStartedPage />}
        />
        <Route path="/app/profile" element={<ProfilePage />} />
        <Route path="/app/settings" element={<SettingsPage />} />
        <Route path="/app/help" element={<HelpPage />} />
        <Route path="/app/about" element={<AppAboutPage />} />

        {/* Unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter