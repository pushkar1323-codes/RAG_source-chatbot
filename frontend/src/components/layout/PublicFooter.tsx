import { Link } from 'react-router-dom'

import BrandLogo from '../ui/BrandLogo'
import Container from './Container'

function PublicFooter() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-brand-cream)]">
      <Container>
        <div className="grid gap-10 py-12 sm:grid-cols-2 md:grid-cols-4 md:py-14">
          <div className="sm:col-span-2">
            <BrandLogo size="md" />

            <p className="mt-4 max-w-sm text-sm leading-6 text-[var(--color-text-muted)]">
              One place to understand any source and get grounded answers.
            </p>

            <div className="mt-4 inline-block rounded-md border border-[var(--color-border-soft)] bg-white px-3 py-1 font-serif text-xs tracking-wider text-[var(--color-accent-dark)]">
              Feed It Anything. Understand Everything.
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
              Navigation
            </p>

            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  to="/about"
                  className="text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
                >
                  About
                </Link>
              </li>

              <li>
                <Link
                  to="/getting-started"
                  className="text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
                >
                  Getting Started
                </Link>
              </li>

              <li>
                <Link
                  to="/app/help"
                  className="text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
                >
                  Help
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
              Built around
            </p>

            <div className="mt-4 flex flex-col gap-2.5 text-sm text-[var(--color-text-muted)]">
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
                Your Sources
              </span>

              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
                Connected Context
              </span>

              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-subtle)]" />
                Traceable Answers
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[var(--color-border)] py-6 text-xs text-[var(--color-subtle)] sm:flex-row">
          <p>
            © {new Date().getFullYear()} Context Bridge. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  )
}

export default PublicFooter