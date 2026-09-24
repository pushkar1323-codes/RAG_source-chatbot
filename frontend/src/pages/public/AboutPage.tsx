import { Link } from 'react-router-dom'

import BrandLogo from '../../components/ui/BrandLogo'
import Button from '../../components/ui/Button'
import Container from '../../components/layout/Container'

function AboutPage() {
  return (
    <div className="bg-[var(--color-background)] text-[var(--color-text)]">
      {/* Intro */}
      <section className="border-b border-[var(--color-border)] py-14 sm:py-20">
        <Container>
          <div className="max-w-4xl">
            <p className="font-serif text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
              About Context Bridge
            </p>

            <h1 className="mt-5 font-serif text-4xl font-bold leading-[1.08] tracking-tight text-[var(--color-primary)] sm:text-5xl lg:text-6xl">
              One place to understand any source and get{' '}
              <span className="italic text-[var(--color-accent)]">
                grounded answers.
              </span>
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[var(--color-text-muted)] sm:text-xl">
              Context Bridge is a source-grounded study workspace built around
              your own learning material. Bring your sources together, ask
              questions about them, and explore answers connected to the
              material you selected.
            </p>
          </div>
        </Container>
      </section>

      {/* Purpose */}
      <section className="border-b border-[var(--color-border)] bg-white py-14 sm:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <p className="font-serif text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
                The idea
              </p>

              <h2 className="mt-3 max-w-sm font-serif text-3xl font-bold leading-tight text-[var(--color-primary)] sm:text-4xl">
                Your sources come first.
              </h2>
            </div>

            <div className="space-y-4 text-base leading-7 text-[var(--color-text-muted)] sm:text-lg sm:leading-8">
              <p>
                Studying often means moving between documents, notes, and
                different pieces of reference material. Context Bridge brings
                that material into a single workspace where you can interact
                with it through questions.
              </p>

              <p>
                Each conversation can be connected to the sources that matter
                for that context. This keeps the study experience centered
                around the material you actually want to explore.
              </p>

              <p>
                When source information is available for an answer, Context
                Bridge can surface citations so you can trace the response
                back to the relevant material.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Principles */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="max-w-3xl">
            <p className="font-serif text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
              Built around a few principles
            </p>

            <h2 className="mt-3 font-serif text-3xl font-bold leading-tight tracking-tight text-[var(--color-primary)] sm:text-4xl">
              A study tool should make your material easier to explore.
            </h2>
          </div>

          <div className="mt-9 grid items-start gap-4 md:grid-cols-3">
            {[
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
                  'Relevant source and page information can accompany answers when available.',
              },
              {
                number: '03',
                title: 'Reusable',
                description:
                  'Sources can be reused across different conversations instead of being tied to a single chat.',
              },
            ].map((item) => (
              <article
                key={item.number}
                className="self-start rounded-xl border border-[var(--color-border)] bg-white p-5 sm:p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif text-sm font-bold text-[var(--color-accent)]">
                    {item.number}
                  </span>

                  <span className="h-px w-8 bg-[var(--color-border-soft)]" />
                </div>

                <h3 className="mt-6 font-serif text-xl font-bold text-[var(--color-primary)]">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* Closing */}
      <section className="border-t border-[var(--color-border)] bg-[var(--color-primary)] py-14 text-white sm:py-16">
        <Container>
          <div className="flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
            <div>
              <BrandLogo size="md" variant="light" />

              <p className="mt-3 font-serif text-sm text-[var(--color-accent)]">
                Feed It Anything. Understand Everything.
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

export default AboutPage