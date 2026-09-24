import { useState } from 'react'
import { Link } from 'react-router-dom'

import Button from '../ui/Button'
import BrandLogo from '../ui/BrandLogo'
import Container from './Container'

function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-brand-cream)]/95 backdrop-blur-md">
      <Container>
        <nav className="relative flex min-h-20 items-center justify-between gap-6">
          <Link
            to="/"
            className="transition-opacity hover:opacity-90"
            onClick={() => setMenuOpen(false)}
          >
            <BrandLogo size="md" />
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link
              to="/about"
              className="text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
            >
              About
            </Link>

            <Link
              to="/getting-started"
              className="text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
            >
              Getting Started
            </Link>

            <Link
              to="/login"
              className="text-sm font-semibold text-[var(--color-primary)] transition-colors hover:text-[var(--color-accent)]"
            >
              Sign in
            </Link>

            <Link to="/signup">
              <Button className="rounded-lg px-5 py-2.5 text-sm font-medium">
                Get started
              </Button>
            </Link>
          </div>

          <button
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border)] bg-white text-[var(--color-primary)] md:hidden"
          >
            <span className="text-xl leading-none">
              {menuOpen ? '✕' : '☰'}
            </span>
          </button>

          {menuOpen && (
            <div className="absolute left-0 right-0 top-[calc(100%+1px)] z-20 border-b border-[var(--color-border)] bg-[var(--color-brand-cream)] px-5 py-5 shadow-lg md:hidden">
              <div className="flex flex-col gap-1">
                <Link
                  to="/about"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-brand-soft)]"
                >
                  About
                </Link>

                <Link
                  to="/getting-started"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-brand-soft)]"
                >
                  Getting Started
                </Link>

                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-brand-soft)]"
                >
                  Sign in
                </Link>

                <Link
                  to="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="mt-2"
                >
                  <Button className="w-full rounded-lg">
                    Get started
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </nav>
      </Container>
    </header>
  )
}

export default PublicHeader