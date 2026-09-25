import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import Container from '../../components/layout/Container'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

interface Source {
  source_id: string
  filename: string
  type: string
  status: string
}

interface Chat {
  id: string
  title: string
  created_at: string
}

function formatDate(dateString: string) {
  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function getFileType(filename: string) {
  const extension = filename.split('.').pop()?.toUpperCase()

  return extension || 'FILE'
}

function DashboardPage() {
  const navigate = useNavigate()

  const [sources, setSources] = useState<Source[]>([])
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadWorkspace() {
      try {
        const [sourcesResponse, chatsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/sources`),
          fetch(`${API_BASE_URL}/chats`),
        ])

        if (!sourcesResponse.ok || !chatsResponse.ok) {
          throw new Error('Unable to load your workspace.')
        }

        const sourcesData: Source[] = await sourcesResponse.json()
        const chatsData: Chat[] = await chatsResponse.json()

        if (!cancelled) {
          setSources(sourcesData)
          setChats(chatsData)
        }
      } catch {
        if (!cancelled) {
          setSources([])
          setChats([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadWorkspace()

    return () => {
      cancelled = true
    }
  }, [])

  function openSources() {
    navigate('/sources')
  }

  function openChats() {
    navigate('/chats')
  }

  const recentChats = chats.slice(0, 5)
  const recentSources = sources.slice(0, 4)

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Container className="py-10 sm:py-12 lg:py-14">

        {/* Hero */}
        <section className="border-b border-[var(--color-border)] pb-10 sm:pb-12">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent-dark)]">
              Your knowledge workspace
            </p>

            <h1 className="mt-4 max-w-3xl font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-[var(--color-primary)] sm:text-5xl lg:text-6xl">
              Understand your sources.
              <br />
              Ask better questions.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--color-text-muted)] sm:text-lg">
              Bring your study material into one place, ask questions
              naturally, and explore answers grounded in the sources you
              choose.
            </p>

            <p className="mt-5 font-serif text-xs tracking-[0.18em] text-[var(--color-accent-dark)]">
              FEED IT ANYTHING. UNDERSTAND EVERYTHING.
            </p>
          </div>
        </section>

        {/* Workspace statistics */}
        <section className="grid gap-4 py-8 sm:grid-cols-3">
          <div className="rounded-[20px] border border-[var(--color-border)] bg-white p-6">
            <div className="mb-8 flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-surface)] text-[var(--color-primary)]">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M6 3.5h9l3 3V20.5H6z" />
                  <path d="M14 3.5v4h4" />
                  <path d="M9 12h6M9 15.5h6" />
                </svg>
              </span>

              <span className="text-xs font-medium text-[var(--color-subtle)]">
                Sources
              </span>
            </div>

            <p className="text-3xl font-semibold text-[var(--color-primary)]">
              {loading ? '—' : sources.length}
            </p>

            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Documents in your workspace
            </p>
          </div>

          <div className="rounded-[20px] border border-[var(--color-border)] bg-white p-6">
            <div className="mb-8 flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-surface)] text-[var(--color-primary)]">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M5 5.5h14v10H9l-4 3z" />
                  <path d="M9 9h6M9 12h4" />
                </svg>
              </span>

              <span className="text-xs font-medium text-[var(--color-subtle)]">
                Conversations
              </span>
            </div>

            <p className="text-3xl font-semibold text-[var(--color-primary)]">
              {loading ? '—' : chats.length}
            </p>

            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Saved conversations
            </p>
          </div>

          <div className="rounded-[20px] border border-[var(--color-border)] bg-white p-6">
            <div className="mb-8 flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-surface)] text-[var(--color-primary)]">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M4 7.5h16M4 12h16M4 16.5h10" />
                </svg>
              </span>

              <span className="text-xs font-medium text-[var(--color-subtle)]">
                Supported formats
              </span>
            </div>

            <p className="text-2xl font-semibold text-[var(--color-primary)]">
              PDF · TXT
            </p>

            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Supported source material
            </p>
          </div>
        </section>

        {/* Workspace actions */}
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">

          <div className="rounded-[24px] border border-[var(--color-border)] bg-white p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-dark)]">
              Start with your material
            </p>

            <h2 className="mt-2 font-serif text-2xl font-semibold text-[var(--color-primary)] sm:text-3xl">
              Your sources stay at the center.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
              Context Bridge keeps your source material connected to the
              conversations built around it, so your questions stay grounded
              in the context you provide.
            </p>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={openSources}
                className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-brand-cream)] p-5 text-left transition-colors hover:border-[var(--color-border-soft)] hover:bg-[var(--color-surface)]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-surface)] text-xl text-[var(--color-primary)]">
                  +
                </span>

                <h3 className="mt-5 font-serif text-xl font-semibold text-[var(--color-primary)]">
                  Add your sources
                </h3>

                <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                  Upload the PDF or TXT material you want to explore.
                </p>

                <span className="mt-5 inline-block text-sm font-semibold text-[var(--color-primary)]">
                  Open source library →
                </span>
              </button>

              <button
                type="button"
                onClick={openChats}
                className="rounded-[18px] border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-5 text-left transition-colors hover:bg-[var(--color-brand-cream)]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white font-serif text-lg text-[var(--color-primary)]">
                  ?
                </span>

                <h3 className="mt-5 font-serif text-xl font-semibold text-[var(--color-primary)]">
                  Ask about your material
                </h3>

                <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                  Open your conversations and continue asking questions about
                  connected sources.
                </p>

                <span className="mt-5 inline-block text-sm font-semibold text-[var(--color-accent-dark)]">
                  Open chats →
                </span>
              </button>
            </div>
          </div>

          {/* Source library preview */}
          <div className="rounded-[24px] bg-[var(--color-primary)] p-6 text-white sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                  Source library
                </p>

                <h2 className="mt-2 font-serif text-2xl font-semibold">
                  Your material
                </h2>
              </div>

              <button
                type="button"
                onClick={openSources}
                className="text-sm font-semibold text-white/90 hover:text-white"
              >
                View all →
              </button>
            </div>

            <div className="mt-7 space-y-3">
              {loading ? (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
                  Loading your sources...
                </div>
              ) : recentSources.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm leading-6 text-white/70">
                    Your source library is empty.
                  </p>

                  <button
                    type="button"
                    onClick={openSources}
                    className="mt-4 text-sm font-semibold text-[var(--color-accent)]"
                  >
                    Add your first source →
                  </button>
                </div>
              ) : (
                recentSources.map((source) => (
                  <div
                    key={source.source_id}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-xs font-semibold text-[var(--color-accent)]">
                      {getFileType(source.filename)}
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {source.filename}
                      </p>

                      <p className="mt-1 text-xs text-white/50">
                        {source.status}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Recent conversations */}
        <section className="mt-6 rounded-[24px] border border-[var(--color-border)] bg-white p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-dark)]">
                Conversations
              </p>

              <h2 className="mt-2 font-serif text-2xl font-semibold text-[var(--color-primary)]">
                Recent chats
              </h2>
            </div>

            <Link
              to="/chats"
              className="text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-accent-dark)]"
            >
              View all →
            </Link>
          </div>

          <div className="mt-6">
            {loading ? (
              <p className="py-6 text-sm text-[var(--color-text-muted)]">
                Loading your conversations...
              </p>
            ) : recentChats.length === 0 ? (
              <div className="rounded-[18px] border border-dashed border-[var(--color-border-soft)] bg-[var(--color-brand-cream)] p-6">
                <p className="text-sm text-[var(--color-text-muted)]">
                  No conversations yet.
                </p>

                <button
                  type="button"
                  onClick={openChats}
                  className="mt-3 text-sm font-semibold text-[var(--color-primary)]"
                >
                  Open chat history →
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {recentChats.map((chat) => (
                  <Link
                    key={chat.id}
                    to={`/chats/${chat.id}`}
                    className="flex items-center justify-between gap-4 py-5 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-[var(--color-primary)]">
                        {chat.title}
                      </h3>

                      <p className="mt-1 text-xs text-[var(--color-subtle)]">
                        {formatDate(chat.created_at)}
                      </p>
                    </div>

                    <span className="shrink-0 text-sm font-semibold text-[var(--color-primary)]">
                      Open →
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Grounded-answer principle */}
        <section className="mt-6 border-t border-[var(--color-border)] pt-10 sm:pt-12">
          <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-dark)]">
                Built around your sources
              </p>

              <h2 className="mt-2 font-serif text-3xl font-semibold text-[var(--color-primary)]">
                Your material stays at the center of the conversation.
              </h2>
            </div>

            <div className="space-y-4 text-sm leading-7 text-[var(--color-text-muted)] sm:text-base">
              <p>
                Ask questions about the material you provide instead of
                searching through disconnected notes and documents.
              </p>

              <p>
                When relevant source information is available, answers can
                include source and page citations so you can trace the response
                back to the material behind it.
              </p>

              <Link
                to="/getting-started"
                className="inline-block font-semibold text-[var(--color-primary)] hover:text-[var(--color-accent-dark)]"
              >
                Learn how Context Bridge works →
              </Link>
            </div>
          </div>
        </section>
      </Container>
    </div>
  )
}

export default DashboardPage