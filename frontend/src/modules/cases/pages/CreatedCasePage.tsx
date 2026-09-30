import { Button, CellList, CellSimple, Typography } from '@maxhub/max-ui'
import { Link } from '@tanstack/react-router'

import { AppPageContainer } from '@/components/AppPageContainer'
import { Skeleton } from '@/components/Skeleton'
import { useCaseDetail } from '../api/hooks/useCaseDetail'
import { CaseDetailError } from '../components/CaseDetailError'
import { CreateCaseProgress } from '../components/CreateCaseProgress'

type CreatedCasePageProps = {
  houseId: string
  userId: string
  id: string
}

export const CreatedCasePage = ({
  houseId,
  userId,
  id,
}: CreatedCasePageProps) => {
  const detail = useCaseDetail(houseId, userId, id)

  return (
    <AppPageContainer>
      <CreateCaseProgress step={4} />
      {detail.isPending ? (
        <div
          role="status"
          aria-label="Загрузка заявки"
          className="grid gap-(--spacing-size-m)"
        >
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="mt-(--spacing-size3xl) h-24 w-full rounded-(--app-radius-card)" />
          <Skeleton className="mt-(--spacing-size4xl) h-12 w-full rounded-(--app-radius-control)" />
          <Skeleton className="h-12 w-full rounded-(--app-radius-control)" />
        </div>
      ) : detail.isError ? (
        <CaseDetailError
          error={detail.error}
          onRetry={() => detail.refetch()}
        />
      ) : (
        <>
          <Typography.Title variant="large-strong" asChild>
            <h1>Заявка создана</h1>
          </Typography.Title>
          <p className="mt-(--spacing-size-m) mb-(--spacing-size3xl) text-(--font-size-action-small)">
            Она уже доступна в разделе «Мои заявки».
          </p>
          <CellList mode="island">
            <CellSimple
              overline={detail.data.case_type.name}
              title={detail.data.title}
              subtitle={detail.data.location_details ?? undefined}
            />
          </CellList>
          <Button
            stretched
            variant="primary"
            asChild
            className="mt-(--spacing-size4xl)"
          >
            <Link to="/cases/$id" params={{ id }}>
              Открыть заявку
            </Link>
          </Button>
          <Button
            stretched
            variant="secondary"
            asChild
            className="mt-(--spacing-size-m)"
          >
            <Link to="/cases" search={{ scope: 'mine' }}>
              К моим заявкам
            </Link>
          </Button>
        </>
      )}
    </AppPageContainer>
  )
}
