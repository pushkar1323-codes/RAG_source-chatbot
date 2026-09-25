// import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Container from '../../components/layout/Container'

// const API_BASE_URL =
//   import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

function GettingStartedPage() {
  const navigate = useNavigate()
  // const [creatingChat, setCreatingChat] = useState(false)

  function createNewChat() {
  navigate('/chats/new')
}

  const steps = [
    {
      number: '01',
      title: 'Add your sources',
      description:
        'Upload the PDF or TXT material you want Context Bridge to understand. Your source becomes part of your workspace and can be reused across conversations.',
    },
    {
      number: '02',
      title: 'Create a conversation',
      description:
        'Once your source is indexed, start a conversation connected to that material. The conversation keeps its source context attached to it.',
    },
    {
      number: '03',
      title: 'Ask a question',
      description:
        'Ask naturally about the material. The retrieval system looks for relevant passages from the sources connected to your conversation.',
    },
    {
      number: '04',
      title: 'Read the evidence',
      description:
        'When relevant information is found, the response can include source and page citations so you can inspect the material behind the answer.',
    },
  ]

  return (
    <div className="bg-[var(--color-background)] text-[var(--color-text)]">
      <section className="border-b border-[var(--color-border)] py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent-dark)]">
              Getting started
            </p>

            <h1 className="mt-5 font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-[var(--color-primary)] sm:text-5xl lg:text-6xl">
              From source material
              <br />
              to grounded answers.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--color-text-muted)] sm:text-xl">
              Context Bridge is built around a simple workflow: bring in your
              material, connect it to a conversation, ask questions, and trace
              answers back to the source.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-dark)]">
              The workflow
            </p>

            <h2 className="mt-3 font-serif text-3xl font-semibold text-[var(--color-primary)] sm:text-4xl">
              Four steps from material to understanding.
            </h2>

            <p className="mt-4 text-base leading-7 text-[var(--color-text-muted)]">
              You don't need to prepare your material manually. Context Bridge
              handles the processing needed to make your uploaded source
              searchable.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {steps.map((step) => (
              <article
                key={step.number}
                className="rounded-[20px] border border-[var(--color-border)] bg-white p-6 sm:p-7"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif text-sm font-bold text-[var(--color-accent)]">
                    {step.number}
                  </span>

                  <span className="h-px w-10 bg-[var(--color-border-soft)]" />
                </div>

                <h3 className="mt-7 font-serif text-2xl font-semibold text-[var(--color-primary)]">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-[var(--color-text-muted)] sm:text-base">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-[var(--color-border)] bg-[var(--color-brand-soft)] py-16 sm:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-dark)]">
                What happens after upload
              </p>

              <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-[var(--color-primary)] sm:text-4xl">
                Your source becomes searchable context.
              </h2>
            </div>

            <div className="space-y-4">
              <div className="rounded-[18px] border border-[var(--color-border)] bg-white p-5">
                <p className="text-sm font-semibold text-[var(--color-primary)]">
                  1. The source is processed
                </p>

                <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                  The uploaded document is loaded and its text is prepared for
                  retrieval.
                </p>
              </div>

              <div className="rounded-[18px] border border-[var(--color-border)] bg-white p-5">
                <p className="text-sm font-semibold text-[var(--color-primary)]">
                  2. The content is indexed
                </p>

                <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                  The material is divided into searchable passages and
                  represented for semantic retrieval.
                </p>
              </div>

              <div className="rounded-[18px] border border-[var(--color-border)] bg-white p-5">
                <p className="text-sm font-semibold text-[var(--color-primary)]">
                  3. Your conversation uses that context
                </p>

                <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                  Questions retrieve relevant passages from the sources
                  connected to the conversation.
                </p>
              </div>

              <div className="rounded-[18px] border border-[var(--color-border)] bg-white p-5">
                <p className="text-sm font-semibold text-[var(--color-primary)]">
                  4. The answer stays grounded
                </p>

                <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                  The response is generated from the retrieved source context,
                  with citations when available.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <div className="rounded-[24px] border border-[var(--color-border)] bg-white p-7 sm:p-9">
            <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-dark)]">
                  Supported source formats
                </p>

                <h2 className="mt-3 font-serif text-2xl font-semibold text-[var(--color-primary)] sm:text-3xl">
                  Start with PDF or TXT.
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)] sm:text-base">
                  The current source workflow supports PDF and plain-text TXT
                  files.
                </p>
              </div>

              <div className="flex gap-3">
                <span className="rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-surface)] px-4 py-2 font-semibold text-[var(--color-primary)]">
                  .PDF
                </span>

                <span className="rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-surface)] px-4 py-2 font-semibold text-[var(--color-primary)]">
                  .TXT
                </span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-[var(--color-primary)] py-16 text-white sm:py-20">
        <Container>
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
              Ready to explore?
            </p>

            <h2 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl">
              Bring your material into Context Bridge.
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
              Start a new conversation and connect the source material you want
              to explore.
            </p>

            <button
              type="button"
              onClick={createNewChat}
              // disabled={creatingChat}
              className="mt-7 inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-brand-cream)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {'Get started →'}
            </button>
          </div>
        </Container>
      </section>
    </div>
  )
}

export default GettingStartedPage