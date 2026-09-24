import { Link } from 'react-router-dom'

import BrandLogo from '../../components/ui/BrandLogo'
import Button from '../../components/ui/Button'
import Container from '../../components/layout/Container'

function ForgotPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[var(--color-background)]">
      <Container>
        <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center py-12 sm:py-16">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <Link to="/" className="inline-flex">
                <BrandLogo size="md" />
              </Link>

              <h1 className="mt-8 font-serif text-3xl font-bold tracking-tight text-[var(--color-primary)] sm:text-4xl">
                Reset your password
              </h1>

              <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
                Enter your email address and we’ll help you get back into your
                account.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 sm:p-8">
              <form className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-[var(--color-text)]"
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="w-full rounded-[var(--radius-input)] border border-[var(--color-border-soft)] bg-white px-4 py-3 text-sm text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-subtle)] focus:border-[var(--color-primary)]"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-lg py-3"
                >
                  Send reset link
                </Button>
              </form>

              <div className="mt-6 border-t border-[var(--color-border)] pt-6 text-center">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-[var(--color-primary)] transition-colors hover:text-[var(--color-accent-dark)]"
                >
                  ← Back to sign in
                </Link>
              </div>
            </div>

            <p className="mt-6 text-center text-xs leading-5 text-[var(--color-subtle)]">
              You’ll be able to reset your password once account recovery is
              connected to the backend.
            </p>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default ForgotPasswordPage