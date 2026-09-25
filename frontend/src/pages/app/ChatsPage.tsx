import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Container from '../../components/layout/Container'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

interface Chat {
  id: string
  title: string
  created_at: string
}

function ChatsPage() {
  const navigate = useNavigate()
  const { token, isAuthenticated, isLoading: authLoading } = useAuth()

  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!isAuthenticated || !token) {
      setChats([])
      setError('Please sign in to view your conversations.')
      setLoading(false)
      return
    }

    let cancelled = false

    async function fetchChats() {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(`${API_BASE_URL}/chats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          let errorMessage = 'Unable to load your conversations.'

          try {
            const errorData = await response.json()

            if (typeof errorData.detail === 'string') {
              errorMessage = errorData.detail
            }
          } catch {
            // The server response did not contain JSON error details.
          }

          throw new Error(errorMessage)
        }

        const data: Chat[] = await response.json()

        if (!cancelled) {
          setChats(data)
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Unable to load your conversations.',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchChats()

    return () => {
      cancelled = true
    }
  }, [authLoading, isAuthenticated, token])

  function createChat() {
    navigate('/chats/new')
  }

  return (
    <div className="py-8 sm:py-10">
      <Container>
        <section className="border-b border-[var(--color-border)] pb-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-serif text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
                Conversations
              </p>

              <h1 className="mt-3 font-serif text-3xl font-bold leading-tight tracking-tight text-[var(--color-primary)] sm:text-4xl">
                Your chats
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--color-text-muted)]">
                Start conversations around your sources and keep your
                questions and answers together.
              </p>
            </div>

            <Button
              type="button"
              className="rounded-lg"
              onClick={createChat}
            >
              New chat
            </Button>
          </div>
        </section>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="py-8">
          <div className="rounded-xl border border-[var(--color-border)] bg-white">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-5">
              <div>
                <p className="font-serif text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
                  Workspace
                </p>

                <h2 className="mt-1 font-serif text-2xl font-bold text-[var(--color-primary)]">
                  Conversations
                </h2>
              </div>

              <span className="text-sm text-[var(--color-subtle)]">
                {chats.length} {chats.length === 1 ? 'chat' : 'chats'}
              </span>
            </div>

            {authLoading || loading ? (
              <div className="px-6 py-16 text-center">
                <p className="text-sm text-[var(--color-subtle)]">
                  Loading your conversations...
                </p>
              </div>
            ) : chats.length === 0 ? (
              <div className="px-6 py-16 text-center sm:py-20">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-brand-soft)] font-serif text-xl font-bold text-[var(--color-primary)]">
                  ?
                </div>

                <h3 className="mt-5 font-serif text-xl font-bold text-[var(--color-primary)]">
                  No conversations yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-text-muted)]">
                  Start a conversation and connect it to the sources you want
                  to explore.
                </p>

                <Button
                  type="button"
                  className="mt-6 rounded-lg"
                  onClick={createChat}
                >
                  Start your first chat
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {chats.map((chat) => (
                  <Link
                    key={chat.id}
                    to={`/chats/${chat.id}`}
                    className="flex items-center justify-between gap-4 px-6 py-5 transition-colors hover:bg-[var(--color-brand-cream)]"
                  >
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-[var(--color-primary)]">
                        {chat.title || 'Untitled conversation'}
                      </h3>

                      <p className="mt-1 text-xs text-[var(--color-subtle)]">
                        Open conversation
                      </p>
                    </div>

                    <span className="shrink-0 text-lg text-[var(--color-accent)]">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="border-t border-[var(--color-border)] pt-8">
          <div className="rounded-xl bg-[var(--color-primary)] px-6 py-8 text-white sm:px-8">
            <div className="max-w-2xl">
              <p className="font-serif text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
                Source-grounded conversations
              </p>

              <h2 className="mt-3 font-serif text-2xl font-bold leading-tight sm:text-3xl">
                Ask questions with the right context connected.
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/70 sm:text-base">
                Each conversation can use the sources you select as its
                context, keeping your questions connected to the material you
                want to explore.
              </p>

              <Link to="/sources" className="mt-5 inline-block">
                <Button
                  variant="secondary"
                  className="rounded-lg border-white/20 bg-white text-[var(--color-primary)] hover:bg-[var(--color-brand-cream)]"
                >
                  Manage sources
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </Container>
    </div>
  )
}

export default ChatsPage