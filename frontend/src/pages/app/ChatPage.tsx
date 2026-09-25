import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import Button from '../../components/ui/Button'
import Container from '../../components/layout/Container'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

interface Chat {
  id: string
  title: string
  created_at: string
}

interface Source {
  source_id: string
  filename: string
  type: string
  status: string
}

interface Citation {
  source: string | null
  page: string | null
}

interface Message {
  message_id: string
  chat_id: string
  question: string
  answer: string
  citations: Citation[]
  created_at: string
}

function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>()
  const navigate = useNavigate()
  const isDraftChat = !chatId || chatId === 'new'

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [chat, setChat] = useState<Chat | null>(null)
  const [allSources, setAllSources] = useState<Source[]>([])
  const [connectedSources, setConnectedSources] = useState<Source[]>([])
  const [messages, setMessages] = useState<Message[]>([])

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showSources, setShowSources] = useState(false)
  const [error, setError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadChat() {
      try {
        setError('')

        if (isDraftChat) {
          const sourcesResponse = await fetch(
            `${API_BASE_URL}/sources`,
          )

          if (!sourcesResponse.ok) {
            throw new Error('Unable to load your sources.')
          }

          const sourceData: Source[] =
            await sourcesResponse.json()

          if (!cancelled) {
            setChat(null)
            setAllSources(sourceData)
            setConnectedSources([])
            setMessages([])
          }

          return
        }

        const [
          chatResponse,
          sourcesResponse,
          connectedResponse,
          messagesResponse,
        ] = await Promise.all([
          fetch(`${API_BASE_URL}/chats/${chatId}`),
          fetch(`${API_BASE_URL}/sources`),
          fetch(`${API_BASE_URL}/chats/${chatId}/sources`),
          fetch(`${API_BASE_URL}/chats/${chatId}/messages`),
        ])

        if (!chatResponse.ok) {
          throw new Error('Unable to load this conversation.')
        }

        if (!sourcesResponse.ok) {
          throw new Error('Unable to load your sources.')
        }

        if (!connectedResponse.ok) {
          throw new Error('Unable to load connected sources.')
        }

        if (!messagesResponse.ok) {
          throw new Error('Unable to load conversation messages.')
        }

        const chatData: Chat = await chatResponse.json()
        const sourceData: Source[] =
          await sourcesResponse.json()
        const connectedData: Source[] =
          await connectedResponse.json()
        const messageData: Message[] =
          await messagesResponse.json()

        if (!cancelled) {
          setChat(chatData)
          setAllSources(sourceData)
          setConnectedSources(connectedData)
          setMessages(messageData)
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Unable to load this conversation.',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadChat()

    return () => {
      cancelled = true
    }
  }, [chatId, isDraftChat])

  function handleFileSelect(file: File | undefined) {
    if (!file) {
      return
    }

    setError('')
    setUploadSuccess('')

    const extension = file.name
      .split('.')
      .pop()
      ?.toLowerCase()

    if (extension !== 'pdf' && extension !== 'txt') {
      setSelectedFile(null)
      setError('Only PDF and TXT files are currently supported.')
      return
    }

    setSelectedFile(file)
  }

  async function uploadSource() {
    if (!selectedFile || uploading) {
      return
    }

    setUploading(true)
    setError('')
    setUploadSuccess('')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const sourceResponse = await fetch(
        `${API_BASE_URL}/sources`,
        {
          method: 'POST',
          body: formData,
        },
      )

      if (!sourceResponse.ok) {
        let message = 'Unable to upload this source.'

        try {
          const errorData = await sourceResponse.json()

          if (typeof errorData.detail === 'string') {
            message = errorData.detail
          }
        } catch {
          // The server response did not contain JSON error details.
        }

        throw new Error(message)
      }

      const source: Source = await sourceResponse.json()

      if (!isDraftChat) {
        const attachResponse = await fetch(
          `${API_BASE_URL}/chats/${chatId}/sources/${source.source_id}`,
          {
            method: 'POST',
          },
        )

        if (!attachResponse.ok) {
          let errorMessage =
            'The source was uploaded but could not be connected to this conversation.'

          try {
            const errorData = await attachResponse.json()

            if (typeof errorData.detail === 'string') {
              errorMessage = errorData.detail
            }
          } catch {
            // The server response did not contain JSON error details.
          }

          throw new Error(errorMessage)
        }
      }

      setAllSources((currentSources) => {
        const alreadyExists = currentSources.some(
          (item) => item.source_id === source.source_id,
        )

        if (alreadyExists) {
          return currentSources
        }

        return [source, ...currentSources]
      })

      setConnectedSources((currentSources) => {
        const alreadyConnected = currentSources.some(
          (item) => item.source_id === source.source_id,
        )

        if (alreadyConnected) {
          return currentSources
        }

        return [...currentSources, source]
      })

      setSelectedFile(null)
      setUploadSuccess(
        `"${source.filename}" is ready to use in this conversation.`,
      )

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      setShowSources(false)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to upload this source.',
      )
    } finally {
      setUploading(false)
    }
  }

  async function connectSource(sourceId: string) {
    if (connecting || removing) {
      return
    }

    const source = allSources.find(
      (item) => item.source_id === sourceId,
    )

    if (!source) {
      return
    }

    setConnecting(sourceId)
    setError('')
    setUploadSuccess('')

    try {
      if (isDraftChat) {
        setConnectedSources((currentSources) => {
          if (
            currentSources.some(
              (item) => item.source_id === source.source_id,
            )
          ) {
            return currentSources
          }

          return [...currentSources, source]
        })

        setShowSources(false)
        return
      }

      const response = await fetch(
        `${API_BASE_URL}/chats/${chatId}/sources/${sourceId}`,
        {
          method: 'POST',
        },
      )

      if (!response.ok) {
        let errorMessage = 'Unable to connect this source.'

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

      setConnectedSources((currentSources) => {
        if (
          currentSources.some(
            (item) => item.source_id === source.source_id,
          )
        ) {
          return currentSources
        }

        return [...currentSources, source]
      })

      setShowSources(false)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to connect this source.',
      )
    } finally {
      setConnecting(null)
    }
  }

  async function removeSource(sourceId: string) {
    if (removing || connecting) {
      return
    }

    setRemoving(sourceId)
    setError('')
    setUploadSuccess('')

    try {
      if (isDraftChat) {
        setConnectedSources((currentSources) =>
          currentSources.filter(
            (source) => source.source_id !== sourceId,
          ),
        )

        return
      }

      const response = await fetch(
        `${API_BASE_URL}/chats/${chatId}/sources/${sourceId}`,
        {
          method: 'DELETE',
        },
      )

      if (!response.ok) {
        let errorMessage = 'Unable to remove this source from the chat.'

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

      setConnectedSources((currentSources) =>
        currentSources.filter(
          (source) => source.source_id !== sourceId,
        ),
      )
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to remove this source from the chat.',
      )
    } finally {
      setRemoving(null)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!message.trim() || sending) {
      return
    }

    if (connectedSources.length === 0) {
      setError(
        'Connect at least one source before asking a question.',
      )
      setShowSources(true)
      return
    }

    setSending(true)
    setError('')
    setUploadSuccess('')

    const question = message.trim()

    try {
      let activeChatId = chatId

      if (isDraftChat) {
        const title =
          connectedSources.length > 0
            ? connectedSources[0].filename
            : 'New conversation'

        const chatResponse = await fetch(
          `${API_BASE_URL}/chats?title=${encodeURIComponent(title)}`,
          {
            method: 'POST',
          },
        )

        if (!chatResponse.ok) {
          let errorMessage =
            'Unable to create the conversation.'

          try {
            const errorData = await chatResponse.json()

            if (typeof errorData.detail === 'string') {
              errorMessage = errorData.detail
            }
          } catch {
            // The server response did not contain JSON error details.
          }

          throw new Error(errorMessage)
        }

        const createdChat: Chat =
          await chatResponse.json()

        activeChatId = createdChat.id

        for (const source of connectedSources) {
          const attachResponse = await fetch(
            `${API_BASE_URL}/chats/${createdChat.id}/sources/${source.source_id}`,
            {
              method: 'POST',
            },
          )

          if (!attachResponse.ok) {
            throw new Error(
              `Unable to connect ${source.filename} to the conversation.`,
            )
          }
        }

        setChat(createdChat)

        navigate(`/chats/${createdChat.id}`, {
          replace: true,
        })
      }

      if (!activeChatId) {
        throw new Error('Unable to determine the conversation.')
      }

      const response = await fetch(
        `${API_BASE_URL}/chats/${activeChatId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question,
          }),
        },
      )

      if (!response.ok) {
        let errorMessage = 'Unable to send your question.'

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

      const newMessage: Message = await response.json()

      setMessages((currentMessages) => [
        ...currentMessages,
        newMessage,
      ])

      setMessage('')
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to send your question.',
      )
    } finally {
      setSending(false)
    }
  }

  const unconnectedSources = allSources.filter(
    (source) =>
      !connectedSources.some(
        (connectedSource) =>
          connectedSource.source_id === source.source_id,
      ),
  )

  if (loading) {
    return (
      <div className="py-10">
        <Container>
          <div className="py-20 text-center">
            <p className="text-sm text-[var(--color-subtle)]">
              Loading conversation...
            </p>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col">
      <Container className="flex w-full flex-1 flex-col">
        <section className="border-b border-[var(--color-border)] py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <Link
                to="/chats"
                className="text-sm font-medium text-[var(--color-subtle)] transition-colors hover:text-[var(--color-primary)]"
              >
                ← Back to chats
              </Link>

              <h1 className="mt-3 truncate font-serif text-2xl font-bold text-[var(--color-primary)] sm:text-3xl">
                {chat?.title || 'New conversation'}
              </h1>
            </div>

            <Button
              type="button"
              variant="secondary"
              className="rounded-lg"
              onClick={() => setShowSources((current) => !current)}
            >
              {showSources ? 'Close sources' : 'Add source'}
            </Button>
          </div>
        </section>

        {error && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {uploadSuccess && (
          <div className="mt-5 rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-brand-soft)] px-4 py-3 text-sm text-[var(--color-accent-dark)]">
            {uploadSuccess}
          </div>
        )}

        <section className="grid flex-1 gap-6 py-6 lg:grid-cols-[1fr_300px]">
          <div className="flex min-h-[600px] flex-col rounded-xl border border-[var(--color-border)] bg-white">
            <div className="flex-1 px-5 py-6 sm:px-8">
              {messages.length === 0 ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-brand-soft)] font-serif text-xl font-bold text-[var(--color-primary)]">
                    ?
                  </div>

                  <h2 className="mt-5 font-serif text-2xl font-bold text-[var(--color-primary)]">
                    Start exploring your source
                  </h2>

                  <p className="mt-3 max-w-lg text-sm leading-6 text-[var(--color-text-muted)]">
                    {connectedSources.length > 0
                      ? 'Ask a question about the material connected to this conversation.'
                      : 'Add a source to give this conversation its context.'}
                  </p>

                  {connectedSources.length === 0 && (
                    <Button
                      type="button"
                      className="mt-6 rounded-lg"
                      onClick={() => setShowSources(true)}
                    >
                      Add a source
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-8">
                  {messages.map((item) => (
                    <article key={item.message_id}>
                      <div className="flex justify-end">
                        <div className="max-w-[85%] rounded-xl bg-[var(--color-primary)] px-4 py-3 text-sm leading-6 text-white">
                          {item.question}
                        </div>
                      </div>

                      <div className="mt-4 max-w-[90%]">
                        <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--color-text)]">
                          {item.answer}
                        </p>

                        {connectedSources.length > 1 &&
                          getReferenceNames(item.citations).length > 0 && (
                            <div className="mt-4 border-t border-[var(--color-border)] pt-3">
                              <p className="font-serif text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
                                References
                              </p>

                              <div className="mt-2 flex flex-wrap gap-2">
                                {getReferenceNames(item.citations).map(
                                  (sourceName) => (
                                    <span
                                      key={`${item.message_id}-${sourceName}`}
                                      className="rounded-full border border-[var(--color-border-soft)] bg-[var(--color-brand-soft)] px-3 py-1 text-xs font-medium text-[var(--color-accent-dark)]"
                                    >
                                      {sourceName}
                                    </span>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-[var(--color-border)] p-4 sm:p-5">
              <form onSubmit={handleSubmit}>
                <div className="rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-brand-cream)] p-3">
                  <textarea
                    value={message}
                    onChange={(event) =>
                      setMessage(event.target.value)
                    }
                    placeholder={
                      connectedSources.length > 0
                        ? 'Ask a question about your source...'
                        : 'Add a source before asking a question...'
                    }
                    rows={3}
                    disabled={
                      sending || connectedSources.length === 0
                    }
                    className="w-full resize-none border-0 bg-transparent px-2 py-1 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-subtle)] disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <div className="mt-2 flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-3">
                    <span className="text-xs text-[var(--color-subtle)]">
                      {connectedSources.length > 1
                        ? `${connectedSources.length} sources connected`
                        : connectedSources.length === 1
                          ? 'Source connected'
                          : 'No source connected'}
                    </span>

                    <Button
                      type="submit"
                      className="rounded-lg px-5 py-2.5"
                      disabled={
                        !message.trim() ||
                        sending ||
                        connectedSources.length === 0
                      }
                    >
                      {sending ? 'Thinking...' : 'Send'}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <aside className="h-fit rounded-xl border border-[var(--color-border)] bg-white">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
              <div>
                <p className="font-serif text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
                  Context
                </p>

                <h2 className="mt-1 font-serif text-xl font-bold text-[var(--color-primary)]">
                  {connectedSources.length > 1
                    ? 'Connected sources'
                    : 'Source context'}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowSources((current) => !current)
                }
                className="text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-accent-dark)]"
              >
                {showSources ? 'Close' : 'Add'}
              </button>
            </div>

            <div className="p-5">
              {connectedSources.length === 0 ? (
                <div className="py-6 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--color-brand-soft)] font-serif text-lg font-bold text-[var(--color-primary)]">
                    +
                  </div>

                  <h3 className="mt-4 font-serif text-lg font-bold text-[var(--color-primary)]">
                    No source connected
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                    Add a source to give this conversation its
                    context.
                  </p>

                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-5 w-full rounded-lg"
                    onClick={() => setShowSources(true)}
                  >
                    Add a source
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {connectedSources.map((source) => (
                    <div
                      key={source.source_id}
                      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-brand-cream)] p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[var(--color-primary)]">
                            {source.filename}
                          </p>

                          <p className="mt-1 text-xs uppercase text-[var(--color-subtle)]">
                            {source.type}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeSource(source.source_id)
                          }
                          disabled={
                            removing !== null ||
                            connecting !== null
                          }
                          className="shrink-0 text-xs font-semibold text-[var(--color-subtle)] transition-colors hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {removing === source.source_id
                            ? 'Removing...'
                            : 'Remove'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showSources && (
                <div className="mt-5 border-t border-[var(--color-border)] pt-5">
                  <p className="font-serif text-sm font-bold text-[var(--color-primary)]">
                    Add another source
                  </p>

                  <div className="mt-3 rounded-lg border border-dashed border-[var(--color-border-soft)] bg-[var(--color-brand-cream)] p-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.txt"
                      className="hidden"
                      onChange={(event) =>
                        handleFileSelect(event.target.files?.[0])
                      }
                    />

                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full rounded-lg"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      Choose PDF or TXT
                    </Button>

                    {selectedFile && (
                      <div className="mt-3">
                        <p className="truncate text-sm font-medium text-[var(--color-text)]">
                          {selectedFile.name}
                        </p>

                        <Button
                          type="button"
                          className="mt-3 w-full rounded-lg"
                          onClick={uploadSource}
                          disabled={uploading}
                        >
                          {uploading
                            ? 'Uploading...'
                            : 'Upload and connect'}
                        </Button>
                      </div>
                    )}

                    <p className="mt-3 text-center text-xs leading-5 text-[var(--color-subtle)]">
                      PDF and TXT files are currently supported.
                    </p>
                  </div>

                  <div className="mt-6 border-t border-[var(--color-border)] pt-5">
                    <p className="font-serif text-sm font-bold text-[var(--color-primary)]">
                      Existing sources
                    </p>

                    {unconnectedSources.length === 0 ? (
                      <p className="mt-3 text-sm leading-6 text-[var(--color-subtle)]">
                        All available sources are already connected.
                      </p>
                    ) : (
                      <div className="mt-3 space-y-2">
                        {unconnectedSources.map((source) => (
                          <div
                            key={source.source_id}
                            className="flex items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] p-3"
                          >
                            <p className="min-w-0 truncate text-sm text-[var(--color-text)]">
                              {source.filename}
                            </p>

                            <Button
                              type="button"
                              className="shrink-0 rounded-lg px-3 py-2 text-xs"
                              onClick={() =>
                                connectSource(source.source_id)
                              }
                              disabled={connecting !== null}
                            >
                              {connecting === source.source_id
                                ? 'Adding...'
                                : 'Add'}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </section>
      </Container>
    </div>
  )
}

function getReferenceNames(citations: Citation[]) {
  const names = citations
    .map((citation) => {
      if (!citation.source) {
        return null
      }

      return getDisplaySourceName(citation.source)
    })
    .filter((name): name is string => Boolean(name))

  return Array.from(new Set(names))
}

function getDisplaySourceName(source: string) {
  const normalized = source.replace(/\\/g, '/')
  const filename = normalized.split('/').pop()

  if (!filename) {
    return 'Source'
  }

  const uuidPrefixPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_/i

  return filename.replace(uuidPrefixPattern, '')
}

export default ChatPage