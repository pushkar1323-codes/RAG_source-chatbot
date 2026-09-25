import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import BrandLogo from '../../components/ui/BrandLogo'
import Button from '../../components/ui/Button'
import Container from '../../components/layout/Container'

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError('')
    setIsSubmitting(true)

    try {
      await login(email.trim(), password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to sign in. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

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
                Welcome back
              </h1>

              <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
                Sign in to continue exploring your sources.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 sm:p-8">
              <form
                className="space-y-5"
                onSubmit={handleSubmit}
              >
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
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    required
                    disabled={isSubmitting}
                    className="w-full rounded-[var(--radius-input)] border border-[var(--color-border-soft)] bg-white px-4 py-3 text-sm text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-subtle)] focus:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <label
                      htmlFor="password"
                      className="block text-sm font-semibold text-[var(--color-text)]"
                    >
                      Password
                    </label>

                    <Link
                      to="/forgot-password"
                      className="text-xs font-semibold text-[var(--color-primary)] transition-colors hover:text-[var(--color-accent-dark)]"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    required
                    disabled={isSubmitting}
                    className="w-full rounded-[var(--radius-input)] border border-[var(--color-border-soft)] bg-white px-4 py-3 text-sm text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-subtle)] focus:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                {error && (
                  <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
                  >
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-lg py-3"
                >
                  {isSubmitting ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>

              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-[var(--color-border)]" />
                <span className="text-xs text-[var(--color-subtle)]">
                  New to Context Bridge?
                </span>
                <div className="h-px flex-1 bg-[var(--color-border)]" />
              </div>

              <Link to="/signup" className="block">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full rounded-lg py-3"
                >
                  Create an account
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-center text-xs leading-5 text-[var(--color-subtle)]">
              Your sources stay at the center of your Context Bridge workspace.
            </p>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default LoginPage