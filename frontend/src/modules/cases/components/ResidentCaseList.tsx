import { Button, CellList, CellSimple, Typography } from '@maxhub/max-ui'
import { Link } from '@tanstack/react-router'

import { getUniquePaginatedItems } from '@/lib/query/getUniquePaginatedItems'
import { useCases } from '../api/hooks/useCases'
import type { CasesScope, CasesStatus } from '../api/endpoints'
import { CaseCard } from './CaseCard'
import { CaseCardSkeleton } from './CaseCardSkeleton'

type ResidentCaseListProps = {
  houseId: string
  userId: string
  scope: CasesScope
  status?: CasesStatus
  enabled?: boolean
}

export const ResidentCaseList = ({
  houseId,
  userId,
  scope,
  status,
  enabled,
}: ResidentCaseListProps) => {
  const cases = useCases(houseId, userId, scope, status, enabled)
  const items = getUniquePaginatedItems(cases.data?.pages, (page) => page.cases)

  if (cases.isPending)
    return (
      <div
        role="status"
        aria-label="Загрузка заявок"
        className="grid gap-(--spacing-size-xl)"
      >
        <CaseCardSkeleton footer={scope === 'mine' ? 'progress' : undefined} />
        <CaseCardSkeleton footer={scope === 'mine' ? 'progress' : undefined} />
      </div>
    )

  if (cases.isError && !cases.isFetchNextPageError)
    return (
      <CellList mode="island">
        <CellSimple title="Не удалось загрузить заявки" />
        <div className="px-(--spacing-size2xl) pb-(--spacing-size2xl)">
          <Button stretched variant="secondary" onClick={() => cases.refetch()}>
            Повторить
          </Button>
        </div>
      </CellList>
    )

  if (items.length === 0)
    return (
      <div className="rounded-(--app-radius-card) border border-(--divider-primary) bg-(--background-primary) p-(--app-card-padding)">
        <strong>
          {status === 'completed'
            ? 'Пока нет завершённых заявок'
            : scope === 'mine'
              ? 'Пока нет заявок'
              : 'Пока нет подписок'}
        </strong>
        {status !== 'completed' && (
          <>
            <p className="mt-(--spacing-size-m) text-(length:--font-size-description) text-(--text-secondary)">
              {scope === 'mine'
                ? 'Расскажите о проблеме вашего дома'
                : 'Откройте ленту дома и нажмите «У меня так же» у общей проблемы'}
            </p>
            <Button
              stretched
              variant="primary"
              role="link"
              asChild
              className="mt-(--spacing-size-xl)"
            >
              <Link to={scope === 'mine' ? '/cases/new' : '/'}>
                {scope === 'mine'
                  ? 'Сообщить о проблеме'
                  : 'Перейти в ленту дома'}
              </Link>
            </Button>
          </>
        )}
      </div>
    )

  return (
    <div className="grid gap-(--spacing-size-xl)">
      {items.map((item) => (
        <CaseCard
          key={item.id}
          caseItem={item}
          houseId={scope === 'mine' ? houseId : undefined}
        />
      ))}
      {cases.hasNextPage && !cases.isFetchNextPageError && (
        <Button
          stretched
          variant="secondary"
          loading={cases.isFetchingNextPage}
          disabled={cases.isFetchingNextPage}
          onClick={() => cases.fetchNextPage()}
        >
          Показать ещё
        </Button>
      )}
      {cases.isFetchNextPageError && (
        <div role="alert" className="grid gap-(--spacing-size-m)">
          <Typography.Body variant="small">
            Не удалось загрузить следующую страницу.
          </Typography.Body>
          <Button
            stretched
            variant="secondary"
            onClick={() => cases.fetchNextPage()}
          >
            Повторить загрузку
          </Button>
        </div>
      )}
    </div>
  )
}
