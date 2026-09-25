import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

interface GuestContextValue {
  guestSessionId: string
}

const GuestContext = createContext<
  GuestContextValue | undefined
>(undefined)

const STORAGE_KEY = 'context-bridge-guest-session'

function createGuestSessionId(): string {
  const existing = sessionStorage.getItem(STORAGE_KEY)

  if (existing) {
    return existing
  }

  const sessionId = crypto.randomUUID()

  sessionStorage.setItem(
    STORAGE_KEY,
    sessionId,
  )

  return sessionId
}

export function GuestProvider({
  children,
}: {
  children: ReactNode
}) {
  const [guestSessionId] = useState(
    createGuestSessionId,
  )

  const value = useMemo(
    () => ({
      guestSessionId,
    }),
    [guestSessionId],
  )

  return (
    <GuestContext.Provider value={value}>
      {children}
    </GuestContext.Provider>
  )
}

export function useGuest() {
  const context = useContext(GuestContext)

  if (!context) {
    throw new Error(
      'useGuest must be used inside GuestProvider.',
    )
  }

  return context
}