import { NavLink, Outlet } from 'react-router-dom'

import BrandLogo from '../ui/BrandLogo'
import Container from './Container'

function AppShell() {
  const mainNavigation = [
    { label: 'Dashboard', to: '/app' },
    { label: 'Chats', to: '/app/chats' },
    { label: 'Sources', to: '/app/sources' },
    { label: 'Study', to: '/app/study' },
    { label: 'Insights', to: '/app/study/insights' },
  ]

  const secondaryNavigation = [
    { label: 'Getting Started', to: '/app/getting-started' },
    { label: 'Help', to: '/app/help' },
    { label: 'About', to: '/app/about' },
  ]

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-[var(--color-brand-soft)] text-[var(--color-primary)]'
        : 'text-[var(--color-text-muted)] hover:bg-[var(--color-brand-soft)] hover:text-[var(--color-primary)]'
    }`

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-[var(--color-border)] bg-[var(--color-brand-cream)] lg:flex lg:flex-col">
        <div className="border-b border-[var(--color-border)] px-6 py-5">
          <NavLink to="/app" aria-label="Context Bridge dashboard">
            <BrandLogo size="sm" />
          </NavLink>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-widest text-[var(--color-subtle)]">
              Workspace
            </p>

            <div className="mt-3 space-y-1">
              {mainNavigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/app'}
                  className={navLinkClass}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <p className="px-3 text-[11px] font-bold uppercase tracking-widest text-[var(--color-subtle)]">
              Support
            </p>

            <div className="mt-3 space-y-1">
              {secondaryNavigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={navLinkClass}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        <div className="border-t border-[var(--color-border)] p-4">
          <NavLink
            to="/app/profile"
            className="flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-[var(--color-brand-soft)]"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] font-serif text-sm font-bold text-white">
              U
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--color-primary)]">
                Your Profile
              </p>
              <p className="text-xs text-[var(--color-subtle)]">
                Account settings
              </p>
            </div>
          </NavLink>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-brand-cream)]/95 backdrop-blur-md">
          <Container>
            <div className="flex min-h-16 items-center justify-between gap-4">
              <div className="lg:hidden">
                <NavLink to="/app" aria-label="Context Bridge dashboard">
                  <BrandLogo size="sm" />
                </NavLink>
              </div>

              <div className="hidden lg:block">
                <p className="text-sm font-medium text-[var(--color-text-muted)]">
                  Your workspace
                </p>
              </div>

              <NavLink
                to="/app/profile"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary)] font-serif text-sm font-bold text-white transition-colors hover:bg-[var(--color-primary-hover)]"
                aria-label="Profile"
              >
                U
              </NavLink>
            </div>
          </Container>
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppShell