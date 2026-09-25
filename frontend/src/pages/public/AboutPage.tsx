import { Link } from 'react-router-dom'

import BrandLogo from '../../components/ui/BrandLogo'
import Container from '../../components/layout/Container'

function AboutPage() {
  const principles = [
    {
      number: '01',
      title: 'Source-centered',
      description:
        'Your uploaded material provides the context for the conversations you build around it.',
    },
    {
      number: '02',
      title: 'Traceable',
      description:
        'Relevant source and page information can accompany answers when available, helping you inspect the material behind a response.',
    },
    {
      number: '03',
      title: 'Reusable',
      description:
        'Sources can be reused across different conversations instead of being tied to a single chat.',
    },
  ]

  return (
    <div className="bg-[var(--color-background)] text-[var(--color-text)]">

      {/* Intro */}
      <section className="border-b border-[var(--color-border)] py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="max-w-5xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent-dark)]">
              About Context Bridge
            </p>

            <h1 className="mt-5 max-w-4xl font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-[var(--color-primary)] sm:text-5xl lg:text-6xl">
              Understand your sources.
              <br />
              <span className="text-[var(--color-accent)]">
                Ask better questions.
              </span>
            </h1>

            <p className="mt-7 max-w-3xl text-lg leading-8 text-[var(--color-text-muted)] sm:text-xl">
              Context Bridge is a source-grounded workspace built around your
              own learning material. Bring your sources together, ask questions
              about them, and explore answers connected to the material you
              selected.
            </p>

            <p className="mt-6 font-serif text-sm tracking-[0.16em] text-[var(--color-accent-dark)]">
              FEED IT ANYTHING. UNDERSTAND EVERYTHING.
            </p>
          </div>
        </Container>
      </section>

      {/* Why Context Bridge */}
      <section className="border-b border-[var(--color-border)] bg-white py-16 sm:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-dark)]">
                The idea
              </p>

              <h2 className="mt-3 max-w-md font-serif text-3xl font-semibold leading-tight text-[var(--color-primary)] sm:text-4xl">
                Your sources come first.
              </h2>
            </div>

            <div className="space-y-5 text-base leading-8 text-[var(--color-text-muted)] sm:text-lg">
              <p>
                Studying often means moving between documents, notes, and
                different pieces of reference material. Context Bridge brings
                that material into one workspace where you can interact with it
                through questions.
              </p>

              <p>
                Each conversation can be connected to the sources that matter
                for that context. This keeps the experience centered around the
                material you actually want to explore.
              </p>

              <p>
                When relevant source information is available, Context Bridge
                can surface citations so you can trace an answer back to the
                material behind it.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Product principles */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-dark)]">
              What guides the workspace
            </p>

            <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight tracking-tight text-[var(--color-primary)] sm:text-4xl">
              A study tool should make your material easier to explore.
            </h2>

            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--color-text-muted)]">
              Context Bridge is built around keeping the source material,
              conversation, and evidence connected.
            </p>
          </div>

          <div className="mt-10 grid items-start gap-4 md:grid-cols-3">
            {principles.map((principle) => (
              <article
                key={principle.number}
                className="rounded-xl border border-[var(--color-border)] bg-white p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif text-sm font-bold text-[var(--color-accent)]">
                    {principle.number}
                  </span>

                  <span className="h-px w-8 bg-[var(--color-border-soft)]" />
                </div>

                <h3 className="mt-6 font-serif text-xl font-bold text-[var(--color-primary)]">
                  {principle.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                  {principle.description}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* How the pieces connect */}
      <section className="border-y border-[var(--color-border)] bg-[var(--color-brand-soft)] py-16 sm:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-dark)]">
                The Context Bridge approach
              </p>

              <h2 className="mt-3 max-w-xl font-serif text-3xl font-semibold leading-tight text-[var(--color-primary)] sm:text-4xl">
                Keep sources and conversations connected.
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-[var(--color-text-muted)] sm:text-lg">
                Your source library provides the material. Conversations give
                that material a purpose. Citations help you inspect where an
                answer came from.
              </p>
            </div>

            <div className="rounded-[24px] border border-[var(--color-border)] bg-white p-6 sm:p-8">
              <div className="space-y-5">
                <div className="border-l-2 border-[var(--color-accent)] pl-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-subtle)]">
                    Sources
                  </p>

                  <p className="mt-1 font-serif text-xl font-semibold text-[var(--color-primary)]">
                    Your material
                  </p>
                </div>

                <div className="border-l-2 border-[var(--color-primary)] pl-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-subtle)]">
                    Conversations
                  </p>

                  <p className="mt-1 font-serif text-xl font-semibold text-[var(--color-primary)]">
                    Your questions
                  </p>
                </div>

                <div className="border-l-2 border-[var(--color-accent-dark)] pl-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-subtle)]">
                    Citations
                  </p>

                  <p className="mt-1 font-serif text-xl font-semibold text-[var(--color-primary)]">
                    The evidence behind the answer
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Closing */}
      <section className="bg-[var(--color-primary)] py-16 text-white sm:py-20">
        <Container>
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <BrandLogo size="md" variant="light" />

              <p className="mt-3 font-serif text-sm text-[var(--color-accent)]">
                Feed It Anything. Understand Everything.
              </p>
            </div>

            <Link
              to="/getting-started"
              className="inline-flex items-center justify-center rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              See how it works →
            </Link>
          </div>
        </Container>
      </section>
    </div>
  )
}

export default AboutPage