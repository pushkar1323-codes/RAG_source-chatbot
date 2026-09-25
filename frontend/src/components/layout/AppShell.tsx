import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'

import BrandLogo from '../ui/BrandLogo'
import Container from './Container'
import PublicFooter from './PublicFooter'

function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)

  const workspaceNavigation = [
    {
      label: 'Workspace',
      to: '/',
    },
    {
      label: 'Chats',
      to: '/chats',
    },
    {
      label: 'Sources',
      to: '/sources',
    },
  ]

  function closeMenu() {
    setMenuOpen(false)
  }

  const desktopNavClass = ({ isActive }: { isActive: boolean }) =>
    [
      'text-sm font-medium whitespace-nowrap transition-colors',
      isActive
        ? 'text-[var(--color-primary)]'
        : 'text-[var(--color-text-muted)] hover:text-[var(--color-primary)]',
    ].join(' ')

  const mobileNavClass = ({ isActive }: { isActive: boolean }) =>
    [
      'rounded-lg px-4 py-3 text-sm font-medium transition-colors',
      isActive
        ? 'bg-[var(--color-surface)] text-[var(--color-primary)]'
        : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-primary)]',
    ].join(' ')

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-brand-cream)]/95 backdrop-blur">
        <Container>
          <nav className="relative flex min-h-[76px] items-center justify-between gap-6">
            <Link
              to="/"
              onClick={closeMenu}
              className="shrink-0 transition-opacity hover:opacity-85"
              aria-label="Context Bridge workspace"
            >
              <BrandLogo size="md" />
            </Link>

            <div className="hidden items-center gap-5 xl:flex">
              <NavLink
                to="/about"
                className={desktopNavClass}
              >
                About
              </NavLink>

              <NavLink
                to="/getting-started"
                className={desktopNavClass}
              >
                Getting Started
              </NavLink>

              <span className="mx-1 h-5 w-px bg-[var(--color-border)]" />

              {workspaceNavigation.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={item.to === '/'}
                  className={desktopNavClass}
                >
                  {item.label}
                </NavLink>
              ))}

              <span className="mx-1 h-5 w-px bg-[var(--color-border)]" />

              <NavLink
                to="/profile"
                className={desktopNavClass}
              >
                Profile
              </NavLink>

              <NavLink
                to="/settings"
                className={desktopNavClass}
              >
                Settings
              </NavLink>
            </div>

            <button
              type="button"
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-primary)] xl:hidden"
            >
              <span className="text-lg leading-none">
                {menuOpen ? '✕' : '☰'}
              </span>
            </button>

            {menuOpen && (
              <div className="absolute left-0 right-0 top-[calc(100%+1px)] border-b border-[var(--color-border)] bg-[var(--color-background)] px-5 py-5 shadow-sm xl:hidden">
                <div className="flex flex-col gap-1">
                  <NavLink
                    to="/about"
                    onClick={closeMenu}
                    className={mobileNavClass}
                  >
                    About
                  </NavLink>

                  <NavLink
                    to="/getting-started"
                    onClick={closeMenu}
                    className={mobileNavClass}
                  >
                    Getting Started
                  </NavLink>

                  <div className="my-2 h-px bg-[var(--color-border)]" />

                  {workspaceNavigation.map((item) => (
                    <NavLink
                      key={item.label}
                      to={item.to}
                      end={item.to === '/'}
                      onClick={closeMenu}
                      className={mobileNavClass}
                    >
                      {item.label}
                    </NavLink>
                  ))}

                  <div className="my-2 h-px bg-[var(--color-border)]" />

                  <NavLink
                    to="/profile"
                    onClick={closeMenu}
                    className={mobileNavClass}
                  >
                    Profile
                  </NavLink>

                  <NavLink
                    to="/settings"
                    onClick={closeMenu}
                    className={mobileNavClass}
                  >
                    Settings
                  </NavLink>
                </div>
              </div>
            )}
          </nav>
        </Container>
      </header>

      <main>
        <Outlet />
      </main>

      <PublicFooter />
    </div>
  )
}

export default AppShell