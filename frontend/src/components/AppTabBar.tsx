import { Link, useMatch, useMatchRoute } from '@tanstack/react-router'
import { ClipboardList, House, UserRound } from 'lucide-react'
import { useSessionControls } from '@/modules/auth'
import { DispatchCaseHomeLink } from '@/modules/dispatch'

const tabs = [
  { label: 'Заявки', to: '/cases', icon: ClipboardList },
  { label: 'Дом', to: '/', icon: House },
  { label: 'Профиль', to: '/profile', icon: UserRound },
]

export const AppTabBar = () => {
  const matchRoute = useMatchRoute()
  const caseMatch = useMatch({ from: '/cases/$id', shouldThrow: false })
  const { role } = useSessionControls()
  const visibleTabs =
    role === 'dispatcher' ? tabs.filter((tab) => tab.to !== '/cases') : tabs

  return (
    <nav
      aria-label="Основные разделы"
      className="fixed inset-x-0 bottom-(--spacing-size-xl) z-10 px-(--app-page-gutter) pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto flex w-full max-w-[calc(var(--app-page-width)-2*var(--app-page-gutter))] gap-(--spacing-size-xs) rounded-(--app-radius-floating) border border-(--divider-primary) bg-(--background-primary) p-(--spacing-size-s) shadow-(--app-shadow-floating)">
        {visibleTabs.map(({ label, to, icon: Icon }) => {
          const active = Boolean(matchRoute({ to, fuzzy: to === '/cases' }))
          const className = `flex min-h-(--app-nav-height) flex-1 flex-col items-center justify-center gap-(--spacing-size2xs) rounded-(--app-radius-control) text-(--font-size-note) font-medium focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--text-themed) ${active ? 'bg-(--app-accent-subtle) text-(--app-accent-text)' : 'text-(--text-secondary)'}`
          const content = (
            <>
              <Icon
                size={20}
                strokeWidth={active ? 2.3 : 1.9}
                aria-hidden="true"
              />
              {label}
            </>
          )
          if (role === 'dispatcher' && to === '/' && caseMatch) {
            return (
              <DispatchCaseHomeLink key={to} className={className}>
                {content}
              </DispatchCaseHomeLink>
            )
          }
          return (
            <Link
              key={to}
              to={to}
              search={role === 'dispatcher' && to === '/' ? true : undefined}
              aria-current={active ? 'page' : undefined}
              className={className}
            >
              {content}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
