import { useEffect, useRef, useState, type DragEvent } from 'react'

import Button from '../../components/ui/Button'
import Container from '../../components/layout/Container'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

interface Source {
  source_id: string
  filename: string
  type: string
  path: string
  url: string | null
  metadata: Record<string, unknown>
  status: string
}

function SourcesPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [sources, setSources] = useState<Source[]>([])
  const [loadingSources, setLoadingSources] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadSources()
  }, [])

  async function loadSources() {
    setLoadingSources(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/sources`)

      if (!response.ok) {
        throw new Error('Unable to load your sources.')
      }

      const data: Source[] = await response.json()
      setSources(data)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to load your sources.',
      )
    } finally {
      setLoadingSources(false)
    }
  }

  function handleFileSelect(file: File | undefined) {
    if (!file) {
      return
    }

    const extension = file.name.split('.').pop()?.toLowerCase()

    if (extension !== 'pdf' && extension !== 'txt') {
      setSelectedFile(null)
      setError('Only PDF and TXT files are currently supported.')
      return
    }

    setError('')
    setSuccess('')
    setSelectedFile(file)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    handleFileSelect(event.dataTransfer.files[0])
  }

  async function handleUpload() {
    if (!selectedFile || uploading) {
      return
    }

    setUploading(true)
    setError('')
    setSuccess('')

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await fetch(`${API_BASE_URL}/sources`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        let message = 'Unable to upload the source.'

        try {
          const errorData = await response.json()

          if (typeof errorData.detail === 'string') {
            message = errorData.detail
          }
        } catch {
          // The server response did not contain JSON error details.
        }

        throw new Error(message)
      }

      const uploadedSource: Source = await response.json()

      setSources((currentSources) => [
        uploadedSource,
        ...currentSources.filter(
          (source) => source.source_id !== uploadedSource.source_id,
        ),
      ])

      setSelectedFile(null)
      setSuccess(`"${uploadedSource.filename}" was added successfully.`)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to upload the source.',
      )
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="py-8 sm:py-10">
      <Container>
        <section className="border-b border-[var(--color-border)] pb-8">
          <p className="font-serif text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
            Sources
          </p>

          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight text-[var(--color-primary)] sm:text-4xl">
                Your sources
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--color-text-muted)]">
                Add the material you want Context Bridge to understand and use
                as context for your conversations.
              </p>
            </div>

            <span className="text-sm text-[var(--color-subtle)]">
              PDF and TXT supported
            </span>
          </div>
        </section>

        <section className="py-8">
          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
            className="rounded-2xl border border-dashed border-[var(--color-border-soft)] bg-white p-6 sm:p-8"
          >
            <div className="flex flex-col items-center justify-center py-8 text-center sm:py-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--color-brand-soft)] font-serif text-2xl font-bold text-[var(--color-primary)]">
                +
              </div>

              <h2 className="mt-5 font-serif text-2xl font-bold text-[var(--color-primary)]">
                Add a source
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-[var(--color-text-muted)]">
                Drag and drop a PDF or TXT file here, or choose a file from
                your computer.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,application/pdf,text/plain"
                className="hidden"
                onChange={(event) =>
                  handleFileSelect(event.target.files?.[0])
                }
              />

              <Button
                type="button"
                className="mt-6 rounded-lg"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                Choose a file
              </Button>

              <p className="mt-4 text-xs text-[var(--color-subtle)]">
                PDF and TXT files are currently supported.
              </p>
            </div>

            {selectedFile && (
              <div className="border-t border-[var(--color-border)] pt-5">
                <div className="flex flex-col gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-brand-cream)] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--color-primary)]">
                      {selectedFile.name}
                    </p>

                    <p className="mt-1 text-xs text-[var(--color-subtle)]">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      className="rounded-lg"
                      onClick={() => setSelectedFile(null)}
                      disabled={uploading}
                    >
                      Remove
                    </Button>

                    <Button
                      type="button"
                      className="rounded-lg"
                      onClick={handleUpload}
                      disabled={uploading}
                    >
                      {uploading ? 'Processing...' : 'Upload'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-5 rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-brand-soft)] px-4 py-3 text-sm text-[var(--color-accent-dark)]">
                {success}
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-end justify-between border-b border-[var(--color-border)] pb-4">
            <div>
              <p className="font-serif text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
                Library
              </p>

              <h2 className="mt-1 font-serif text-2xl font-bold text-[var(--color-primary)]">
                Your material
              </h2>
            </div>

            <span className="text-sm text-[var(--color-subtle)]">
              {sources.length} {sources.length === 1 ? 'source' : 'sources'}
            </span>
          </div>

          {loadingSources ? (
            <div className="py-16 text-center">
              <p className="text-sm text-[var(--color-subtle)]">
                Loading your sources...
              </p>
            </div>
          ) : sources.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-brand-soft)] font-serif text-lg font-bold text-[var(--color-primary)]">
                +
              </div>

              <h3 className="mt-4 font-serif text-xl font-bold text-[var(--color-primary)]">
                Your source library is empty
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-text-muted)]">
                Add your first PDF or TXT file and it will appear here once the
                source is processed.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border)]">
              {sources.map((source) => (
                <article
                  key={source.source_id}
                  className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--color-brand-soft)] font-serif text-xs font-bold uppercase text-[var(--color-primary)]">
                      {source.type}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-[var(--color-primary)]">
                        {source.filename}
                      </h3>

                      <p className="mt-1 text-xs text-[var(--color-subtle)]">
                        {formatStatus(source.status)}
                      </p>
                    </div>
                  </div>

                  <span className="self-start rounded-full bg-[var(--color-brand-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-accent-dark)] sm:self-auto">
                    {source.status}
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>
      </Container>
    </div>
  )
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatStatus(status: string) {
  if (!status) {
    return 'Source processed'
  }

  return status.charAt(0).toUpperCase() + status.slice(1)
}

export default SourcesPage