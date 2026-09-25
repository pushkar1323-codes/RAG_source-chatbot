import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export interface User {
  id: string
  email: string
  created_at: string
}

interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

interface AuthContextValue {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

const TOKEN_STORAGE_KEY = 'context-bridge-access-token'

export function AuthProvider({
  children,
}: {
  children: ReactNode
}) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_STORAGE_KEY),
  )

  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function restoreSession() {
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        if (!response.ok) {
          localStorage.removeItem(TOKEN_STORAGE_KEY)
          setToken(null)
          setUser(null)
          return
        }

        const currentUser: User = await response.json()
        setUser(currentUser)
      } catch {
        localStorage.removeItem(TOKEN_STORAGE_KEY)
        setToken(null)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    restoreSession()
  }, [token])

  async function authenticate(
    endpoint: 'login' | 'register',
    email: string,
    password: string,
  ) {
    const response = await fetch(
      `${API_BASE_URL}/auth/${endpoint}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      },
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        data.detail || 'Authentication failed.',
      )
    }

    const authResponse = data as AuthResponse

    localStorage.setItem(
      TOKEN_STORAGE_KEY,
      authResponse.access_token,
    )

    setToken(authResponse.access_token)
    setUser(authResponse.user)
  }

  async function login(
    email: string,
    password: string,
  ) {
    await authenticate(
      'login',
      email,
      password,
    )
  }

  async function register(
    email: string,
    password: string,
  ) {
    await authenticate(
      'register',
      email,
      password,
    )
  }

  function logout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    setToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading,
      login,
      register,
      logout,
    }),
    [
      user,
      token,
      isLoading,
    ],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider.',
    )
  }

  return context
}