import AppRouter from './app/AppRouter'
import { AuthProvider } from './context/AuthContext'
import { GuestProvider } from './context/GuestContext'
import { ThemeProvider } from './context/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GuestProvider>
          <AppRouter />
        </GuestProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App