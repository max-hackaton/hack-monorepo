import { CaseFeed, HomeCaseCard } from '@/modules/cases'
import type { HomeResponse, HomeSort } from '../api/endpoints'

type HouseFeedProps = {
  cases: HomeResponse['cases']
  houseId: string
  userId: string
  sort: HomeSort
  isPending: boolean
  onSortChange: (sort: HomeSort) => void
}

const sortOptions = [
  ['activity', 'Недавние'],
  ['confirmations', 'Популярные'],
] as const

export const HouseFeed = ({
  cases,
  houseId,
  userId,
  sort,
  isPending,
  onSortChange,
}: HouseFeedProps) => (
  <CaseFeed
    isPending={isPending}
    skeletonFooter="confirm"
    isEmpty={cases.length === 0}
    emptyTitle={
      sort === 'confirmations'
        ? 'Пока нет общих проблем'
        : 'Пока нет активных проблем'
    }
    emptyDescription={
      sort === 'confirmations'
        ? 'Здесь появятся публичные проблемы дома.'
        : 'Здесь появятся общие проблемы дома и ваши приватные заявки.'
    }
    toolbar={
      <div
        className="mb-(--spacing-size2xl) flex gap-(--spacing-size-s) rounded-(--app-radius-control) bg-(--background-secondary) p-(--spacing-size-xs)"
        role="group"
        aria-label="Сортировка ленты"
      >
        {sortOptions.map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={sort === value}
            className={`min-h-(--app-control-height-compact) flex-1 rounded-(--app-radius-small) px-(--spacing-size-m) text-(--font-size-label) font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--text-themed) ${sort === value ? 'bg-(--background-primary) text-(--app-accent-text)' : 'text-(--text-secondary)'}`}
            onClick={() => onSortChange(value)}
          >
            {label}
          </button>
        ))}
      </div>
    }
  >
    {cases.map((caseItem) => (
      <HomeCaseCard
        key={caseItem.id}
        caseItem={caseItem}
        houseId={houseId}
        userId={userId}
      />
    ))}
  </CaseFeed>
)
