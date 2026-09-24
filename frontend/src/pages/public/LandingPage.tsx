import { Link } from 'react-router-dom'

import BrandLogo from '../../components/ui/BrandLogo'
import Button from '../../components/ui/Button'
import Container from '../../components/layout/Container'

function LandingPage() {
  return (
    <div className="bg-[var(--color-background)] text-[var(--color-text)]">
      {/* Hero */}
      <section className="overflow-hidden border-b border-[var(--color-border)]">
        <Container>
          <div className="grid min-h-[auto] items-center gap-10 py-14 sm:gap-12 sm:py-20 lg:min-h-[680px] lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-24">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-border-soft)] bg-[var(--color-brand-soft)] px-4 py-1.5 text-xs font-semibold tracking-wider text-[var(--color-accent-dark)]">
                <span>Upload</span>
                <span className="text-[var(--color-accent)]">•</span>
                <span>Ask</span>
                <span className="text-[var(--color-accent)]">•</span>
                <span>Cite</span>
              </div>

              <div className="mb-5">
                <BrandLogo size="md" />
              </div>

              <h1 className="font-serif text-4xl font-bold leading-[1.08] tracking-tight text-[var(--color-primary)] sm:text-6xl lg:text-[4rem]">
                One place to understand any source and get{' '}
                <span className="italic text-[var(--color-accent)]">
                  grounded answers.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--color-text-muted)] sm:text-xl">
                Bring your study material into one place, ask questions
                naturally, and explore answers connected to the sources you
                choose.
              </p>

              <div className="mt-8 flex flex-col gap-3.5 sm:flex-row">
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button className="w-full rounded-lg px-7 py-3 sm:w-auto">
                    Start exploring
                  </Button>
                </Link>

                <Link to="/getting-started" className="w-full sm:w-auto">
                  <Button
                    variant="secondary"
                    className="w-full rounded-lg sm:w-auto"
                  >
                    See how it works
                  </Button>
                </Link>
              </div>

              <p className="mt-4 font-serif text-xs tracking-widest text-[var(--color-accent-dark)]">
                FEED IT ANYTHING. UNDERSTAND EVERYTHING.
              </p>
            </div>

            {/* Product preview */}
            <div className="relative">
              <div className="rounded-2xl border border-[var(--color-border)] bg-white p-3 shadow-sm sm:p-6">
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-brand-cream)] p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] pb-3">
                    <BrandLogo size="sm" />

                    <span className="rounded-md border border-[var(--color-border-soft)] bg-white px-2.5 py-0.5 font-serif text-xs font-medium text-[var(--color-accent-dark)]">
                      Study Workspace
                    </span>
                  </div>

                  <div className="mt-5 space-y-3.5">
                    <div className="rounded-lg border border-[var(--color-border)] bg-white p-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-subtle)]">
                        Context Documents
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded bg-[var(--color-brand-soft)] px-2.5 py-1 text-xs font-medium text-[var(--color-primary)]">
                          <span className="font-bold text-[var(--color-accent)]">
                            PDF
                          </span>
                          AWS_Exam.pdf
                        </span>

                        <span className="inline-flex items-center gap-1.5 rounded bg-[var(--color-brand-soft)] px-2.5 py-1 text-xs font-medium text-[var(--color-primary)]">
                          <span className="font-bold text-[var(--color-accent)]">
                            TXT
                          </span>
                          Networking_Notes.txt
                        </span>
                      </div>
                    </div>

                    <div className="rounded-lg border border-[var(--color-border)] bg-white p-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-subtle)]">
                        Student Inquiry
                      </p>

                      <p className="mt-1 text-sm font-medium text-[var(--color-primary)]">
                        What is the shared responsibility model?
                      </p>
                    </div>

                    <div className="rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-brand-soft)] p-4 text-[var(--color-primary)]">
                      <p className="font-serif text-xs font-bold uppercase tracking-wider text-[var(--color-accent-dark)]">
                        Grounded Answer
                      </p>

                      <p className="mt-1.5 text-sm leading-relaxed">
                        The shared responsibility model divides security
                        responsibilities between the cloud provider and the
                        customer.
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded border border-[var(--color-border-soft)] bg-white px-2.5 py-0.5 text-xs text-[var(--color-primary)]">
                          AWS Exam · p. 12
                        </span>

                        <span className="rounded border border-[var(--color-border-soft)] bg-white px-2.5 py-0.5 text-xs font-semibold text-[var(--color-accent-dark)]">
                          Cited Source
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Core message */}
      <section className="border-b border-[var(--color-border)] bg-white py-16 sm:py-20">
        <Container>
          <div className="max-w-3xl">
            <p className="font-serif text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
              Built around your sources
            </p>

            <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-[var(--color-primary)] sm:text-4xl">
              Your material stays at the center of the conversation.
            </h2>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--color-text-muted)]">
              Bring your study material together, choose the sources that
              matter to a conversation, and explore them through natural
              questions.
            </p>
          </div>

          <div className="mt-10 grid items-start gap-4 sm:mt-12 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                number: '01',
                title: 'Ask your material',
                description:
                  'Turn your study material into a question-and-answer workspace.',
              },
              {
                number: '02',
                title: 'Bring sources together',
                description:
                  'Use multiple pieces of study material within the same conversation.',
              },
              {
                number: '03',
                title: 'Keep context connected',
                description:
                  'Keep conversations organized around the sources that matter to you.',
              },
              {
                number: '04',
                title: 'See the source',
                description:
                  'Trace answers back to relevant source and page information when available.',
              },
            ].map((feature) => (
              <article
                key={feature.number}
                className="self-start rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-5 sm:p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif text-sm font-bold text-[var(--color-accent)]">
                    {feature.number}
                  </span>

                  <span className="h-px w-8 bg-[var(--color-border-soft)]" />
                </div>

                <h3 className="mt-6 font-serif text-lg font-bold leading-snug text-[var(--color-primary)]">
                  {feature.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-14">
            <div className="lg:sticky lg:top-28">
              <p className="font-serif text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
                How it works
              </p>

              <h2 className="mt-3 max-w-md font-serif text-3xl font-bold leading-tight tracking-tight text-[var(--color-primary)] sm:text-4xl">
                A simple path from material to understanding.
              </h2>

              <div className="mt-7 border-l-2 border-[var(--color-accent)] pl-5">
                <p className="font-serif text-lg italic leading-7 text-[var(--color-text-muted)]">
                  Feed It Anything.
                  <br />
                  Understand Everything.
                </p>
              </div>
            </div>

            <div className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
              {[
                {
                  step: '01',
                  title: 'Add your sources',
                  description:
                    'Bring your study material into the source library.',
                },
                {
                  step: '02',
                  title: 'Create a chat',
                  description:
                    'Choose the sources that should provide the context for your conversation.',
                },
                {
                  step: '03',
                  title: 'Ask a question',
                  description:
                    'Ask naturally and continue the conversation with follow-up questions.',
                },
                {
                  step: '04',
                  title: 'Read the evidence',
                  description:
                    'Review the answer alongside the available source citations.',
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="grid gap-3 py-5 sm:grid-cols-[70px_1fr] sm:gap-6 sm:py-6"
                >
                  <span className="font-serif text-sm font-bold text-[var(--color-accent)]">
                    {item.step}
                  </span>

                  <div>
                    <h3 className="font-serif text-lg font-bold text-[var(--color-primary)]">
                      {item.title}
                    </h3>

                    <p className="mt-1.5 max-w-xl text-[15px] leading-6 text-[var(--color-text-muted)]">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Workspace */}
      <section className="bg-[var(--color-primary)] py-20 text-white sm:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-14">
            <div>
              <p className="font-serif text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)]">
                Context Bridge
              </p>

              <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
                Keep sources and conversations connected.
              </h2>

              <p className="mt-5 max-w-xl text-lg leading-8 text-white/70">
                Reuse sources across conversations while keeping each chat
                focused on the material you choose.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: 'Source Library',
                  description:
                    'Manage the material you have added and reuse it across chats.',
                },
                {
                  title: 'Chats',
                  description:
                    'Keep separate conversations around different study contexts.',
                },
                {
                  title: 'Citations',
                  description:
                    'See where information used in an answer came from.',
                },
                {
                  title: 'Study Insights',
                  description:
                    'A dedicated space for exploring your study activity.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-white/15 bg-white/5 p-5 sm:p-6"
                >
                  <h3 className="font-serif font-bold">{item.title}</h3>

                  <p className="mt-2 text-sm leading-6 text-white/65">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="bg-[var(--color-background)] py-16 sm:py-20">
        <Container>
          <div className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-primary)] px-6 py-10 text-center text-white sm:px-12 sm:py-12">
            <p className="font-serif text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)]">
              Feed It Anything. Understand Everything.
            </p>

            <h2 className="mx-auto mt-3 max-w-2xl font-serif text-3xl font-bold sm:text-4xl">
              Bring your sources. Start asking better questions.
            </h2>

            <p className="mx-auto mt-4 max-w-xl leading-7 text-white/70">
              Build your own source-grounded study workspace and explore your
              material through conversation.
            </p>

            <div className="mt-7">
              <Link to="/signup">
                <Button
                  className="rounded-lg bg-[var(--color-accent)] px-8 py-3 text-white hover:bg-[var(--color-accent-hover)]"
                >
                  Get started
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}

export default LandingPage