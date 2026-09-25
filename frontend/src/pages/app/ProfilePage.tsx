import { Link } from 'react-router-dom'

import Container from '../../components/layout/Container'
import Button from '../../components/ui/Button'

function ProfilePage() {
  /*
   * Authentication is not connected yet.
   * Until a real authenticated session exists, the profile
   * page should not display placeholder user information.
   */
  const isAuthenticated = false

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-77px)] bg-[var(--color-background)] py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-2xl">
            <section className="rounded-[24px] border border-[var(--color-border)] bg-white p-8 text-center sm:p-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface)]">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="text-[var(--color-primary)]"
                >
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M5.5 19c.8-3.2 3-5 6.5-5s5.7 1.8 6.5 5" />
                </svg>
              </div>

              <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-dark)]">
                Your profile
              </p>

              <h1 className="mt-3 font-serif text-3xl font-semibold text-[var(--color-primary)] sm:text-4xl">
                Sign in to access your profile.
              </h1>

              <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-[var(--color-text-muted)] sm:text-base">
                Your profile, account information, and personal settings will
                be available here once you sign in to Context Bridge.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link to="/login">
                  <Button className="rounded-lg px-7">
                    Sign in
                  </Button>
                </Link>

                <Link to="/signup">
                  <Button
                    variant="secondary"
                    className="rounded-lg px-7"
                  >
                    Create an account
                  </Button>
                </Link>
              </div>

              <div className="mt-8 border-t border-[var(--color-border)] pt-6">
                <Link
                  to="/"
                  className="text-sm font-medium text-[var(--color-primary)] transition-colors hover:text-[var(--color-accent-dark)]"
                >
                  Return to workspace →
                </Link>
              </div>
            </section>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-77px)] bg-[var(--color-background)] py-12 sm:py-16">
      <Container>
        <section className="rounded-[24px] border border-[var(--color-border)] bg-white p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-dark)]">
            Your profile
          </p>

          <h1 className="mt-3 font-serif text-3xl font-semibold text-[var(--color-primary)] sm:text-4xl">
            Profile
          </h1>

          <p className="mt-3 text-[var(--color-text-muted)]">
            Manage your Context Bridge account information.
          </p>
        </section>
      </Container>
    </div>
  )
}

export default ProfilePage