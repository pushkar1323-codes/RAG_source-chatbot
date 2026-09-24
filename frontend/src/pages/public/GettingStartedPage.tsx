import { Link } from 'react-router-dom'

import BrandLogo from '../../components/ui/BrandLogo'
import Button from '../../components/ui/Button'
import Container from '../../components/layout/Container'

function GettingStartedPage() {
  const steps = [
    {
      number: '01',
      title: 'Add your sources',
      description:
        'Upload the study material you want to explore. Context Bridge currently supports PDF and TXT files.',
    },
    {
      number: '02',
      title: 'Create a conversation',
      description:
        'Start a chat and choose the sources that should provide the context for that conversation.',
    },
    {
      number: '03',
      title: 'Ask your questions',
      description:
        'Ask naturally about the material and continue the conversation with follow-up questions.',
    },
    {
      number: '04',
      title: 'Explore the answer',
      description:
        'Read the response alongside the available source and page citations.',
    },
  ]

  return (
    <div className="bg-[var(--color-background)] text-[var(--color-text)]">
      {/* Intro */}
      <section className="border-b border-[var(--color-border)] py-14 sm:py-20">
        <Container>
          <div className="max-w-4xl">
            <p className="font-serif text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
              Getting Started
            </p>

            <h1 className="mt-5 max-w-3xl font-serif text-4xl font-bold leading-[1.08] tracking-tight text-[var(--color-primary)] sm:text-5xl lg:text-6xl">
              Start with your sources. Then start asking.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--color-text-muted)] sm:text-xl">
              Bring your study material into Context Bridge, connect it to a
              conversation, and explore it through questions.
            </p>
          </div>
        </Container>
      </section>

      {/* Steps */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <BrandLogo size="md" />

              <p className="mt-6 max-w-sm font-serif text-2xl font-bold leading-tight text-[var(--color-primary)] sm:text-3xl">
                Feed It Anything.
                <br />
                <span className="text-[var(--color-accent)]">
                  Understand Everything.
                </span>
              </p>

              <p className="mt-4 max-w-sm text-sm leading-6 text-[var(--color-text-muted)]">
                Your sources provide the context. Your questions drive the
                conversation.
              </p>
            </div>

            <div className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="grid gap-4 py-7 sm:grid-cols-[70px_1fr] sm:gap-6"
                >
                  <span className="font-serif text-sm font-bold text-[var(--color-accent)]">
                    {step.number}
                  </span>

                  <div>
                    <h2 className="font-serif text-2xl font-bold text-[var(--color-primary)]">
                      {step.title}
                    </h2>

                    <p className="mt-2 max-w-xl text-[15px] leading-7 text-[var(--color-text-muted)]">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Supported sources */}
      <section className="border-y border-[var(--color-border)] bg-white py-14 sm:py-16">
        <Container>
          <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-center md:gap-14">
            <div>
              <p className="font-serif text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
                Supported sources
              </p>

              <h2 className="mt-3 font-serif text-3xl font-bold leading-tight text-[var(--color-primary)] sm:text-4xl">
                Start with the material you already have.
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-5">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-sm font-bold text-[var(--color-accent)]">
                    PDF
                  </span>

                  <span className="h-px w-8 bg-[var(--color-border-soft)]" />
                </div>

                <h3 className="mt-6 font-serif text-xl font-bold text-[var(--color-primary)]">
                  PDF documents
                </h3>

                <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                  Bring lecture material, textbooks, reference documents, and
                  other PDF study material into your source library.
                </p>
              </div>

              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-5">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-sm font-bold text-[var(--color-accent)]">
                    TXT
                  </span>

                  <span className="h-px w-8 bg-[var(--color-border-soft)]" />
                </div>

                <h3 className="mt-6 font-serif text-xl font-bold text-[var(--color-primary)]">
                  Text files
                </h3>

                <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                  Add plain-text notes, summaries, or other text-based study
                  material.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="bg-[var(--color-primary)] py-16 text-white sm:py-20">
        <Container>
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <BrandLogo size="md" variant="light" />

              <h2 className="mt-5 font-serif text-3xl font-bold leading-tight sm:text-4xl">
                Ready to explore your sources?
              </h2>

              <p className="mt-3 max-w-xl text-base leading-7 text-white/70">
                Add your material and start a conversation around it.
              </p>
            </div>

            <Link to="/signup">
              <Button className="rounded-lg bg-[var(--color-accent)] px-8 py-3 text-white hover:bg-[var(--color-accent-hover)]">
                Get started
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </div>
  )
}

export default GettingStartedPage