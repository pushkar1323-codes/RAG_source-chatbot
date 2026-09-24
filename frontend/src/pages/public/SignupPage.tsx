import { Link } from 'react-router-dom'

import BrandLogo from '../../components/ui/BrandLogo'
import Button from '../../components/ui/Button'
import Container from '../../components/layout/Container'

function SignupPage() {
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
                Create your account
              </h1>

              <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
                Start building your source-grounded study workspace.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 sm:p-8">
              <form className="space-y-5">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-[var(--color-text)]"
                  >
                    Full name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Your name"
                    className="w-full rounded-[var(--radius-input)] border border-[var(--color-border-soft)] bg-white px-4 py-3 text-sm text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-subtle)] focus:border-[var(--color-primary)]"
                  />
                </div>

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

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-[var(--color-text)]"
                  >
                    Password
                  </label>

                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Create a password"
                    className="w-full rounded-[var(--radius-input)] border border-[var(--color-border-soft)] bg-white px-4 py-3 text-sm text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-subtle)] focus:border-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-[var(--color-text)]"
                  >
                    Confirm password
                  </label>

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    className="w-full rounded-[var(--radius-input)] border border-[var(--color-border-soft)] bg-white px-4 py-3 text-sm text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-subtle)] focus:border-[var(--color-primary)]"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-lg py-3"
                >
                  Create account
                </Button>
              </form>

              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-[var(--color-border)]" />

                <span className="text-xs text-[var(--color-subtle)]">
                  Already have an account?
                </span>

                <div className="h-px flex-1 bg-[var(--color-border)]" />
              </div>

              <Link to="/login" className="block">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full rounded-lg py-3"
                >
                  Sign in
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-center text-xs leading-5 text-[var(--color-subtle)]">
              Create your workspace and start exploring your sources in one
              place.
            </p>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default SignupPage