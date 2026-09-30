import { useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'

import { AppHeader } from '@/components/AppHeader'
import { AppPageContainer } from '@/components/AppPageContainer'
import { ResidentCaseList } from '../components/ResidentCaseList'
import { CompletedCasesSection } from '../components/CompletedCasesSection'

const TABS = [
  ['subscriptions', 'Подписки'],
  ['mine', 'Мои заявки'],
] as const

export const CasesPage = ({
  houseId,
  userId,
}: {
  houseId: string
  userId: string
}) => {
  const { scope: searchScope } = useSearch({ from: '/cases/' })
  const scope = searchScope ?? 'subscriptions'
  const navigate = useNavigate()
  const [completedOpen, setCompletedOpen] = useState(false)

  return (
    <AppPageContainer>
      <AppHeader title="Заявки" />
      <div
        className="mb-(--spacing-size2xl) flex gap-(--spacing-size-s) rounded-(--app-radius-control) bg-(--background-secondary) p-(--spacing-size-xs)"
        role="tablist"
        aria-label="Заявки"
      >
        {TABS.map(([tab, label]) => (
          <button
            key={tab}
            type="button"
            role="tab"
            id={`${tab}-tab`}
            aria-controls={`${tab}-cases`}
            aria-selected={scope === tab}
            className={`min-h-(--app-control-height) flex-1 rounded-(--app-radius-small) px-(--spacing-size-m) text-(--font-size-description) font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--text-themed) ${scope === tab ? 'bg-(--background-primary) text-(--app-accent-text)' : 'text-(--text-secondary)'}`}
            onClick={() => navigate({ to: '/cases', search: { scope: tab } })}
          >
            {label}
          </button>
        ))}
      </div>
      <section
        role="tabpanel"
        id={`${scope}-cases`}
        aria-labelledby={`${scope}-tab`}
      >
        <ResidentCaseList
          houseId={houseId}
          userId={userId}
          scope={scope}
          status={scope === 'mine' ? 'active' : undefined}
        />
        {scope === 'mine' && (
          <CompletedCasesSection onOpenChange={setCompletedOpen}>
            <ResidentCaseList
              houseId={houseId}
              userId={userId}
              scope={scope}
              status="completed"
              enabled={completedOpen}
            />
          </CompletedCasesSection>
        )}
      </section>
    </AppPageContainer>
  )
}
