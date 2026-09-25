import { useEffect, useRef, useState } from 'react'

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
  const [deletingSourceId, setDeletingSourceId] = useState<string | null>(
    null,
  )
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadSources() {
      try {
        setLoadingSources(true)
        setError('')

        const response = await fetch(`${API_BASE_URL}/sources`)

        if (!response.ok) {
          throw new Error('Unable to load your sources.')
        }

        const data: Source[] = await response.json()

        if (!cancelled) {
          setSources(data)
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Unable to load your sources.',
          )
        }
      } finally {
        if (!cancelled) {
          setLoadingSources(false)
        }
      }
    }

    loadSources()

    return () => {
      cancelled = true
    }
  }, [])

  function handleFileSelect(file: File | undefined) {
    if (!file) {
      return
    }

    setError('')
    setSuccess('')

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

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()

    if (uploading) {
      return
    }

    handleFileSelect(event.dataTransfer.files[0])
  }

  async function uploadSource() {
    if (!selectedFile || uploading) {
      return
    }

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const sourceResponse = await fetch(`${API_BASE_URL}/sources`, {
        method: 'POST',
        body: formData,
      })

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

      setSources((currentSources) => {
        const alreadyExists = currentSources.some(
          (item) => item.source_id === source.source_id,
        )

        if (alreadyExists) {
          return currentSources
        }

        return [source, ...currentSources]
      })

      setSelectedFile(null)
      setSuccess(
        `"${source.filename}" was added to your source library.`,
      )

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to complete the upload.',
      )
    } finally {
      setUploading(false)
    }
  }

  async function deleteSource(source: Source) {
    if (deletingSourceId) {
      return
    }

    const confirmed = window.confirm(
      `Permanently delete "${source.filename}"?\n\nThis removes the source from your library, its chat associations, uploaded file, and indexed vectors.`,
    )

    if (!confirmed) {
      return
    }

    setDeletingSourceId(source.source_id)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(
        `${API_BASE_URL}/sources/${source.source_id}`,
        {
          method: 'DELETE',
        },
      )

      if (!response.ok) {
        let message = 'Unable to delete this source.'

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

      setSources((currentSources) =>
        currentSources.filter(
          (item) => item.source_id !== source.source_id,
        ),
      )

      setSuccess(`"${source.filename}" was permanently deleted.`)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to delete this source.',
      )
    } finally {
      setDeletingSourceId(null)
    }
  }

  return (
    <div className="py-8 sm:py-10">
      <Container>
        <section className="border-b border-[var(--color-border)] pb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-serif text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
                Sources
              </p>

              <h1 className="mt-3 font-serif text-3xl font-bold leading-tight tracking-tight text-[var(--color-primary)] sm:text-4xl">
                Your sources
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--color-text-muted)]">
                Add the material you want Context Bridge to understand.
                Sources stay in your library until you permanently delete
                them.
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
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
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
                      disabled={uploading}
                      onClick={() => {
                        setSelectedFile(null)
                        setError('')
                        setSuccess('')

                        if (fileInputRef.current) {
                          fileInputRef.current.value = ''
                        }
                      }}
                    >
                      Remove
                    </Button>

                    <Button
                      type="button"
                      className="rounded-lg"
                      disabled={uploading}
                      onClick={uploadSource}
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
              <div className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
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
              {sources.length}{' '}
              {sources.length === 1 ? 'source' : 'sources'}
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
                Add your first PDF or TXT file and it will appear here
                once the source is processed.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border)]">
              {sources.map((source) => (
                <div
                  key={source.source_id}
                  className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-soft)] font-serif text-xs font-bold uppercase text-[var(--color-primary)]">
                      {source.type}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--color-primary)]">
                        {source.filename}
                      </p>

                      <p className="mt-1 text-xs text-[var(--color-subtle)]">
                        {source.status}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <span className="rounded-full bg-[var(--color-brand-soft)] px-3 py-1 text-xs font-medium text-[var(--color-accent-dark)]">
                      {source.status}
                    </span>

                    <Button
                      type="button"
                      variant="ghost"
                      className="rounded-lg border border-red-200 px-4 py-2 text-red-700 hover:bg-red-50 hover:text-red-800"
                      disabled={deletingSourceId !== null}
                      onClick={() => deleteSource(source)}
                    >
                      {deletingSourceId === source.source_id
                        ? 'Deleting...'
                        : 'Delete'}
                    </Button>
                  </div>
                </div>
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

export default SourcesPage