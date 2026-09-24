import { Link } from 'react-router-dom'

import Button from '../../components/ui/Button'
import Container from '../../components/layout/Container'

function DashboardPage() {
  return (
    <div className="py-8 sm:py-10">
      <Container>
        <section className="border-b border-[var(--color-border)] pb-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-serif text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
                Workspace
              </p>

              <h1 className="mt-3 font-serif text-3xl font-bold leading-tight tracking-tight text-[var(--color-primary)] sm:text-4xl">
                Welcome to Context Bridge.
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--color-text-muted)]">
                Bring your sources together, start a conversation, and explore
                your material through grounded answers.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/app/sources">
                <Button variant="secondary" className="w-full rounded-lg sm:w-auto">
                  Add source
                </Button>
              </Link>

              <Link to="/app/chats">
                <Button className="w-full rounded-lg sm:w-auto">
                  New chat
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="grid gap-4 md:grid-cols-3">
            <Link
              to="/app/sources"
              className="group rounded-xl border border-[var(--color-border)] bg-white p-6 transition-colors hover:border-[var(--color-border-soft)] hover:bg-[var(--color-brand-cream)]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-brand-soft)] font-serif text-lg font-bold text-[var(--color-primary)]">
                +
              </div>

              <h2 className="mt-5 font-serif text-xl font-bold text-[var(--color-primary)]">
                Add your sources
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                Upload the PDF or TXT material you want Context Bridge to
                understand.
              </p>

              <span className="mt-5 inline-block text-sm font-semibold text-[var(--color-primary)] transition-colors group-hover:text-[var(--color-accent-dark)]">
                Manage sources →
              </span>
            </Link>

            <Link
              to="/app/chats"
              className="group rounded-xl border border-[var(--color-border)] bg-white p-6 transition-colors hover:border-[var(--color-border-soft)] hover:bg-[var(--color-brand-cream)]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-brand-soft)] font-serif text-lg font-bold text-[var(--color-primary)]">
                ?
              </div>

              <h2 className="mt-5 font-serif text-xl font-bold text-[var(--color-primary)]">
                Ask about your material
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                Create a conversation and ask questions using the sources
                connected to it.
              </p>

              <span className="mt-5 inline-block text-sm font-semibold text-[var(--color-primary)] transition-colors group-hover:text-[var(--color-accent-dark)]">
                Open chats →
              </span>
            </Link>

            <Link
              to="/app/study"
              className="group rounded-xl border border-[var(--color-border)] bg-white p-6 transition-colors hover:border-[var(--color-border-soft)] hover:bg-[var(--color-brand-cream)]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-brand-soft)] font-serif text-lg font-bold text-[var(--color-primary)]">
                S
              </div>

              <h2 className="mt-5 font-serif text-xl font-bold text-[var(--color-primary)]">
                Study with context
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                Use your connected material as the foundation for your study
                workspace.
              </p>

              <span className="mt-5 inline-block text-sm font-semibold text-[var(--color-primary)] transition-colors group-hover:text-[var(--color-accent-dark)]">
                Open study →
              </span>
            </Link>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-xl border border-[var(--color-border)] bg-white">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-5">
              <div>
                <p className="font-serif text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
                  Conversations
                </p>

                <h2 className="mt-1 font-serif text-2xl font-bold text-[var(--color-primary)]">
                  Recent chats
                </h2>
              </div>

              <Link
                to="/app/chats"
                className="text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-accent-dark)]"
              >
                View all
              </Link>
            </div>

            <div className="px-6 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-brand-soft)] font-serif text-lg font-bold text-[var(--color-primary)]">
                ?
              </div>

              <h3 className="mt-4 font-serif text-lg font-bold text-[var(--color-primary)]">
                No conversations yet
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--color-text-muted)]">
                Start your first conversation to begin asking questions about
                your sources.
              </p>

              <Link to="/app/chats" className="mt-5 inline-block">
                <Button className="rounded-lg">
                  Start a chat
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-white">
            <div className="border-b border-[var(--color-border)] px-6 py-5">
              <p className="font-serif text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
                Sources
              </p>

              <h2 className="mt-1 font-serif text-2xl font-bold text-[var(--color-primary)]">
                Your material
              </h2>
            </div>

            <div className="px-6 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-brand-soft)] font-serif text-lg font-bold text-[var(--color-primary)]">
                +
              </div>

              <h3 className="mt-4 font-serif text-lg font-bold text-[var(--color-primary)]">
                No sources yet
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--color-text-muted)]">
                Upload a PDF or TXT file to give your workspace material to
                work with.
              </p>

              <Link to="/app/sources" className="mt-5 inline-block">
                <Button variant="secondary" className="rounded-lg">
                  Add a source
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-6 border-t border-[var(--color-border)] pt-8">
          <div className="rounded-xl bg-[var(--color-primary)] px-6 py-8 text-white sm:px-8">
            <div className="max-w-2xl">
              <p className="font-serif text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
                How Context Bridge works
              </p>

              <h2 className="mt-3 font-serif text-2xl font-bold leading-tight sm:text-3xl">
                Your sources provide the context. Your questions drive the
                conversation.
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/70 sm:text-base">
                Add material, connect it to a conversation, and ask questions
                grounded in the sources you selected.
              </p>

              <Link to="/app/getting-started" className="mt-5 inline-block">
                <Button
                  variant="secondary"
                  className="rounded-lg border-white/20 bg-white text-[var(--color-primary)] hover:bg-[var(--color-brand-cream)]"
                >
                  Learn how it works
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </Container>
    </div>
  )
}

export default DashboardPage