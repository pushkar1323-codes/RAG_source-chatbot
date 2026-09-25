import { useTheme, type Theme } from '../../context/ThemeContext'
import Container from '../../components/layout/Container'

function SettingsPage() {
  const { theme, setTheme } = useTheme()

  function handleThemeChange(nextTheme: Theme) {
    setTheme(nextTheme)
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Container className="py-10 sm:py-12 lg:py-14">
        {/* Header */}
        <section className="border-b border-[var(--color-border)] pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent-dark)]">
            Preferences
          </p>

          <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-[var(--color-primary)] sm:text-5xl">
            Settings
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--color-text-muted)]">
            Manage your Context Bridge preferences and workspace experience.
          </p>
        </section>

        {/* Settings content */}
        <section className="mt-8 max-w-4xl">
          {/* Appearance */}
          <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-white)]">
            <div className="border-b border-[var(--color-border)] px-6 py-6 sm:px-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-dark)]">
                Appearance
              </p>

              <h2 className="mt-2 font-serif text-2xl font-semibold text-[var(--color-primary)]">
                Theme
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--color-text-muted)]">
                Choose how Context Bridge appears across your workspace.
              </p>
            </div>

            <div className="px-6 py-6 sm:px-8">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Light */}
                <button
                  type="button"
                  onClick={() => handleThemeChange('light')}
                  aria-pressed={theme === 'light'}
                  className={[
                    'rounded-[18px] border p-5 text-left transition-all',
                    theme === 'light'
                      ? 'border-[var(--color-primary)] bg-[var(--color-surface)]'
                      : 'border-[var(--color-border)] bg-[var(--color-background)] hover:border-[var(--color-border-soft)]',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border-soft)] bg-white text-lg">
                      ☀
                    </span>

                    {theme === 'light' && (
                      <span className="text-xs font-semibold text-[var(--color-primary)]">
                        Selected
                      </span>
                    )}
                  </div>

                  <h3 className="mt-5 font-serif text-xl font-semibold text-[var(--color-primary)]">
                    Light
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                    Use the warm, editorial Context Bridge appearance.
                  </p>
                </button>

                {/* Dark */}
                <button
                  type="button"
                  onClick={() => handleThemeChange('dark')}
                  aria-pressed={theme === 'dark'}
                  className={[
                    'rounded-[18px] border p-5 text-left transition-all',
                    theme === 'dark'
                      ? 'border-[var(--color-accent)] bg-[var(--color-surface)]'
                      : 'border-[var(--color-border)] bg-[var(--color-background)] hover:border-[var(--color-border-soft)]',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-primary)] text-lg text-[var(--color-accent)]">
                      ◐
                    </span>

                    {theme === 'dark' && (
                      <span className="text-xs font-semibold text-[var(--color-accent)]">
                        Selected
                      </span>
                    )}
                  </div>

                  <h3 className="mt-5 font-serif text-xl font-semibold text-[var(--color-primary)]">
                    Dark
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                    Use a darker workspace for lower-light environments.
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* Current theme */}
          <div className="mt-5 rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-5 sm:px-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--color-primary)]">
                  Current theme
                </p>

                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  Your selection is saved automatically on this device.
                </p>
              </div>

              <span className="font-semibold capitalize text-[var(--color-accent-dark)]">
                {theme}
              </span>
            </div>
          </div>
        </section>
      </Container>
    </div>
  )
}

export default SettingsPage