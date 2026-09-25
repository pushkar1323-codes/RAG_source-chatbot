import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import { useGuest } from '../../context/GuestContext'
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

interface GuestAnswer {
  answer: string
  citations: Citation[]
}

function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>()
  const navigate = useNavigate()

  const { token, isAuthenticated, isLoading: authLoading } = useAuth()
  const { guestSessionId } = useGuest()

  const isDraftChat = !chatId || chatId === 'new'
  const isGuest = !isAuthenticated

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [chat, setChat] = useState<Chat | null>(null)
  const [allSources, setAllSources] = useState<Source[]>([])
  const [connectedSources, setConnectedSources] = useState<Source[]>([])
  const [messages, setMessages] = useState<Message[]>([])

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [sourcePickerOpen, setSourcePickerOpen] = useState(false)
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([])
  const [error, setError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState('')

  function authenticatedHeaders(): HeadersInit {
    return token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}
  }

  function guestHeaders(): HeadersInit {
    return {
      'X-Guest-Session-ID': guestSessionId,
    }
  }

  useEffect(() => {
    if (authLoading) {
      return
    }

    let cancelled = false

    async function loadChat() {
      try {
        setError('')
        setLoading(true)

        if (isDraftChat) {
          const sourcesResponse = await fetch(
            isGuest
              ? `${API_BASE_URL}/guest/sources`
              : `${API_BASE_URL}/sources`,
            {
              headers: isGuest
                ? guestHeaders()
                : authenticatedHeaders(),
            },
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

        if (isGuest) {
          throw new Error(
            'This saved conversation requires an account.',
          )
        }

        const headers = authenticatedHeaders()

        const [
          chatResponse,
          sourcesResponse,
          connectedResponse,
          messagesResponse,
        ] = await Promise.all([
          fetch(`${API_BASE_URL}/chats/${chatId}`, {
            headers,
          }),
          fetch(`${API_BASE_URL}/sources`, {
            headers,
          }),
          fetch(`${API_BASE_URL}/chats/${chatId}/sources`, {
            headers,
          }),
          fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
            headers,
          }),
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

        const chatData: Chat =
          await chatResponse.json()

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
  }, [
    authLoading,
    chatId,
    guestSessionId,
    isAuthenticated,
    isDraftChat,
    isGuest,
    token,
  ])

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
      setError(
        'Only PDF and TXT files are currently supported.',
      )
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
      isGuest
        ? `${API_BASE_URL}/guest/sources`
        : `${API_BASE_URL}/sources`,
      {
        method: 'POST',
        headers: isGuest
          ? guestHeaders()
          : authenticatedHeaders(),
        body: formData,
      },
    )

    if (!sourceResponse.ok) {
      let errorMessage =
        'Unable to upload this source.'

      try {
        const errorData =
          await sourceResponse.json()

        if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail
        }
      } catch {
        // The server response did not contain JSON error details.
      }

      throw new Error(errorMessage)
    }

    const source: Source =
      await sourceResponse.json()

    /*
     * Guest sources and draft-chat sources are kept
     * in local state until they are used in the
     * appropriate guest or first-message flow.
     *
     * An existing authenticated chat must persist
     * the source-to-chat relationship immediately.
     */
    if (!isGuest && !isDraftChat && chatId) {
      const attachResponse = await fetch(
        `${API_BASE_URL}/chats/${chatId}/sources/${source.source_id}`,
        {
          method: 'POST',
          headers: authenticatedHeaders(),
        },
      )

      if (!attachResponse.ok) {
        let errorMessage =
          'The source was uploaded, but could not be connected to this conversation.'

        try {
          const errorData =
            await attachResponse.json()

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
        (item) =>
          item.source_id === source.source_id,
      )

      if (alreadyExists) {
        return currentSources
      }

      return [source, ...currentSources]
    })

    setConnectedSources((currentSources) => {
      const alreadyConnected =
        currentSources.some(
          (item) =>
            item.source_id === source.source_id,
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

    setSourcePickerOpen(false)
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



  function toggleSourceSelection(sourceId: string) {
    setSelectedSourceIds((currentIds) =>
      currentIds.includes(sourceId)
        ? currentIds.filter((id) => id !== sourceId)
        : [...currentIds, sourceId],
    )
  }

  async function addSelectedSources() {
    if (selectedSourceIds.length === 0 || connecting) {
      return
    }

    for (const sourceId of selectedSourceIds) {
      await connectSource(sourceId)
    }

    setSelectedSourceIds([])
    setSourcePickerOpen(false)
  }

  async function connectSource(sourceId: string) {
    if (connecting) {
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
      if (isDraftChat || isGuest) {
        setConnectedSources((currentSources) => {
          if (
            currentSources.some(
              (item) =>
                item.source_id === source.source_id,
            )
          ) {
            return currentSources
          }

          return [...currentSources, source]
        })

          return
      }

      const response = await fetch(
        `${API_BASE_URL}/chats/${chatId}/sources/${sourceId}`,
        {
          method: 'POST',
          headers: authenticatedHeaders(),
        },
      )

      if (!response.ok) {
        let errorMessage =
          'Unable to connect this source.'

        try {
          const errorData =
            await response.json()

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
            (item) =>
              item.source_id === source.source_id,
          )
        ) {
          return currentSources
        }

        return [...currentSources, source]
      })

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
    if (isDraftChat || isGuest) {
      setConnectedSources((currentSources) =>
        currentSources.filter(
          (source) => source.source_id !== sourceId,
        ),
      )
      setError('')
      setUploadSuccess('')
      return
    }

    setError('')
    setUploadSuccess('')

    try {
      const response = await fetch(
        `${API_BASE_URL}/chats/${chatId}/sources/${sourceId}`,
        {
          method: 'DELETE',
          headers: authenticatedHeaders(),
        },
      )

      if (!response.ok) {
        let errorMessage = 'Unable to remove this source.'

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
          : 'Unable to remove this source.',
      )
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (!message.trim() || sending) {
      return
    }

    if (connectedSources.length === 0) {
      setError(
        'Connect at least one source before asking a question.',
      )
      fileInputRef.current?.click()
      return
    }

    setSending(true)
    setError('')
    setUploadSuccess('')

    const question = message.trim()

    try {
      if (isGuest) {
        const response = await fetch(
          `${API_BASE_URL}/guest/ask`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...guestHeaders(),
            },
            body: JSON.stringify({
              question,
              source_ids: connectedSources.map(
                (source) => source.source_id,
              ),
            }),
          },
        )

        if (!response.ok) {
          let errorMessage =
            'Unable to send your question.'

          try {
            const errorData =
              await response.json()

            if (typeof errorData.detail === 'string') {
              errorMessage = errorData.detail
            }
          } catch {
            // The server response did not contain JSON error details.
          }

          throw new Error(errorMessage)
        }

        const guestResponse: GuestAnswer =
          await response.json()

        const guestMessage: Message = {
          message_id: `guest-${Date.now()}`,
          chat_id: 'guest',
          question,
          answer: guestResponse.answer,
          citations: guestResponse.citations,
          created_at: new Date().toISOString(),
        }

        setMessages((currentMessages) => [
          ...currentMessages,
          guestMessage,
        ])

        setMessage('')

        return
      }

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
            headers: authenticatedHeaders(),
          },
        )

        if (!chatResponse.ok) {
          let errorMessage =
            'Unable to create the conversation.'

          try {
            const errorData =
              await chatResponse.json()

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
          const attachResponse =
            await fetch(
              `${API_BASE_URL}/chats/${createdChat.id}/sources/${source.source_id}`,
              {
                method: 'POST',
                headers: authenticatedHeaders(),
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
        throw new Error(
          'Unable to determine the conversation.',
        )
      }

      const response = await fetch(
        `${API_BASE_URL}/chats/${activeChatId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authenticatedHeaders(),
          },
          body: JSON.stringify({
            question,
          }),
        },
      )

      if (!response.ok) {
        let errorMessage =
          'Unable to send your question.'

        try {
          const errorData =
            await response.json()

          if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail
          }
        } catch {
          // The server response did not contain JSON error details.
        }

        throw new Error(errorMessage)
      }

      const newMessage: Message =
        await response.json()

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
          connectedSource.source_id ===
          source.source_id,
      ),
  )

  if (authLoading || loading) {
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
                          getReferenceNames(
                            item.citations,
                          ).length > 0 && (
                            <div className="mt-4 border-t border-[var(--color-border)] pt-3">
                              <p className="font-serif text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
                                References
                              </p>

                              <div className="mt-2 flex flex-wrap gap-2">
                                {getReferenceNames(
                                  item.citations,
                                ).map(
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
                      sending ||
                      connectedSources.length === 0
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
                      {sending
                        ? 'Thinking...'
                        : 'Send'}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <aside className="h-fit rounded-xl border border-[var(--color-border)] bg-white">
            <div className="border-b border-[var(--color-border)] px-5 py-4">
              <p className="font-serif text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
                Context
              </p>

              <div className="mt-1 flex items-center justify-between gap-3">
                <h2 className="font-serif text-xl font-bold text-[var(--color-primary)]">
                  {connectedSources.length > 1
                    ? 'Connected sources'
                    : 'Source context'}
                </h2>

                <span className="text-xs text-[var(--color-subtle)]">
                  {connectedSources.length} connected
                </span>
              </div>
            </div>

            <div className="p-5">
              {connectedSources.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[var(--color-border-soft)] bg-[var(--color-brand-cream)] p-5 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-brand-soft)] font-serif text-lg font-bold text-[var(--color-primary)]">
                    +
                  </div>

                  <h3 className="mt-4 font-serif text-lg font-bold text-[var(--color-primary)]">
                    No source connected
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                    Add a PDF or TXT file to give this conversation its context.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {connectedSources.map((source) => (
                    <div
                      key={source.source_id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-brand-cream)] p-3"
                    >
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
                        className="shrink-0 text-xs font-semibold text-[var(--color-subtle)] hover:text-red-600"
                        onClick={() => removeSource(source.source_id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

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
                className="mt-5 w-full rounded-lg"
                onClick={() => setSourcePickerOpen(true)}
              >
                + Add source
              </Button>

              {sourcePickerOpen && (
                <div
                  className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 px-4 py-6"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="source-picker-title"
                  onClick={() => setSourcePickerOpen(false)}
                >
                  <div
                    className="w-full max-w-lg rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-xl"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-dark)]">
                          Sources
                        </p>
                        <h2
                          id="source-picker-title"
                          className="mt-2 font-serif text-2xl font-bold text-[var(--color-primary)]"
                        >
                          Add source
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                          Upload a new PDF or TXT file, or select sources already in your library.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSourcePickerOpen(false)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--color-border)] text-lg text-[var(--color-subtle)] hover:bg-[var(--color-brand-soft)] hover:text-[var(--color-primary)]"
                        aria-label="Close source picker"
                      >
                        ×
                      </button>
                    </div>

                    <div className="mt-6 rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-brand-cream)] p-4">
                      <p className="font-serif text-base font-bold text-[var(--color-primary)]">
                        Upload new source
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[var(--color-subtle)]">
                        PDF and TXT files are currently supported.
                      </p>

                      <Button
                        type="button"
                        variant="secondary"
                        className="mt-3 w-full rounded-lg"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        {selectedFile ? selectedFile.name : 'Choose PDF or TXT'}
                      </Button>

                      {selectedFile && (
                        <Button
                          type="button"
                          className="mt-3 w-full rounded-lg"
                          onClick={uploadSource}
                          disabled={uploading}
                        >
                          {uploading ? 'Uploading...' : 'Upload and connect'}
                        </Button>
                      )}
                    </div>

                    {!isGuest && unconnectedSources.length > 0 && (
                      <div className="mt-5">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-serif text-base font-bold text-[var(--color-primary)]">
                            Existing sources
                          </p>
                          <span className="text-xs text-[var(--color-subtle)]">
                            {selectedSourceIds.length} selected
                          </span>
                        </div>

                        <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1">
                          {unconnectedSources.map((source) => {
                            const selected = selectedSourceIds.includes(source.source_id)

                            return (
                              <button
                                key={source.source_id}
                                type="button"
                                onClick={() => toggleSourceSelection(source.source_id)}
                                className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                                  selected
                                    ? 'border-[var(--color-accent)] bg-[var(--color-brand-soft)]'
                                    : 'border-[var(--color-border)] hover:bg-[var(--color-brand-soft)]'
                                }`}
                              >
                                <span
                                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs font-bold ${
                                    selected
                                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                                      : 'border-[var(--color-border-soft)] bg-white text-transparent'
                                  }`}
                                  aria-hidden="true"
                                >
                                  ✓
                                </span>

                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-sm font-semibold text-[var(--color-primary)]">
                                    {source.filename}
                                  </span>
                                  <span className="mt-1 block text-xs uppercase text-[var(--color-subtle)]">
                                    {source.type}
                                  </span>
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    <div className="mt-6 flex justify-end gap-3 border-t border-[var(--color-border)] pt-4">
                      <Button
                        type="button"
                        variant="secondary"
                        className="rounded-lg"
                        onClick={() => setSourcePickerOpen(false)}
                      >
                        Cancel
                      </Button>
                      {!isGuest && (
                        <Button
                          type="button"
                          className="rounded-lg"
                          onClick={addSelectedSources}
                          disabled={selectedSourceIds.length === 0 || connecting !== null}
                        >
                          {connecting ? 'Adding...' : 'Add selected'}
                        </Button>
                      )}
                    </div>
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
    .filter(
      (name): name is string => Boolean(name),
    )

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

  return filename.replace(
    uuidPrefixPattern,
    '',
  )
}

export default ChatPage