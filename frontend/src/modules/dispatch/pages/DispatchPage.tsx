import {
  Button,
  CellList,
  CellSimple,
  Switch,
  Typography,
} from '@maxhub/max-ui'
import { useNavigate, useSearch } from '@tanstack/react-router'

import { AppHeader } from '@/components/AppHeader'
import { AppName } from '@/components/AppName'
import { AppPageContainer } from '@/components/AppPageContainer'
import { Skeleton } from '@/components/Skeleton'
import { CaseCard, CaseCardSkeleton, CaseFeed } from '@/modules/cases'
import { getUniquePaginatedItems } from '@/lib/query/getUniquePaginatedItems'
import { useDispatchCases } from '../api/hooks/useDispatchCases'
import { useDispatchHouseSelection } from '../api/hooks/useDispatchHouseSelection'
import type { DispatchSearch } from '../helpers/validateDispatchSearch'
import { getDispatchFeedSearch } from '../helpers/getDispatchFeedSearch'
import type { DispatchFilters } from '../api/endpoints'
import { DispatchFeedFilters } from '../components/DispatchFeedFilters'
import { DispatchHousePicker } from '../components/DispatchHousePicker'

export const DispatchPage = () => {
  const search = useSearch({ from: '/' })
  const navigate = useNavigate()
  const houses = useDispatchHouseSelection()
  const houseList = houses.data?.houses ?? []
  const filters: DispatchFilters = {
    house_ids: houseList.map((house) => house.id),
    is_emergency: search.emergency,
  }
  const feed = useDispatchCases({
    ...filters,
    status_keys: search.status,
  })
  const cases = getUniquePaginatedItems(feed.data?.pages, (page) => page.cases)
  const changeFilters = (next: DispatchSearch) =>
    navigate({
      to: '/',
      search: getDispatchFeedSearch(next),
      replace: true,
    })

  return (
    <AppPageContainer>
      <AppHeader
        title={<AppName />}
        subtitle="Диспетчерская"
        action={
          houses.isPending ? (
            <Skeleton className="h-10 w-24 shrink-0 rounded-(--app-radius-control)" />
          ) : houses.data ? (
            <DispatchHousePicker selectedHouses={houseList} />
          ) : undefined
        }
      />
      {houses.isError && houses.data && (
        <CellList mode="island" className="mb-(--spacing-size2xl)">
          <CellSimple title="Не удалось обновить рабочие дома" />
          <div className="px-(--spacing-size2xl) pb-(--spacing-size2xl)">
            <Button
              stretched
              variant="secondary"
              onClick={() => houses.refetch()}
            >
              Повторить
            </Button>
          </div>
        </CellList>
      )}
      {houses.isPending ? (
        <div role="status" aria-label="Загрузка домов">
          <div className="mb-(--spacing-size-xl) flex items-center justify-between gap-(--spacing-size-m)">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-10 w-28 rounded-(--app-radius-control)" />
          </div>
          <Skeleton className="mb-(--spacing-size2xl) h-10 w-full rounded-(--app-radius-control)" />
          <div className="grid gap-(--spacing-size-xl)">
            {Array.from({ length: 6 }, (_, index) => (
              <CaseCardSkeleton key={index} />
            ))}
          </div>
        </div>
      ) : houses.isError && !houses.data ? (
        <CellList mode="island">
          <CellSimple title="Не удалось загрузить рабочие дома" />
          <div className="px-(--spacing-size2xl) pb-(--spacing-size2xl)">
            <Button stretched onClick={() => houses.refetch()}>
              Повторить
            </Button>
          </div>
        </CellList>
      ) : houseList.length === 0 ? (
        <CellList mode="island">
          <CellSimple
            title="Дома не выбраны"
            subtitle="Выберите рабочие дома, чтобы увидеть их заявки."
          />
        </CellList>
      ) : (
        <>
          <div className="mb-(--spacing-size-xl) flex min-w-0 items-center justify-between gap-(--spacing-size-m)">
            <Typography.Title variant="medium-strong" asChild>
              <h2 id="house-feed-title" className="min-w-0">
                {houseList.length > 1 ? 'Лента домов' : 'Лента дома'}
              </h2>
            </Typography.Title>
            <label className="flex shrink-0 items-center gap-(--spacing-size-s) text-(--text-secondary)">
              Аварийные
              <Switch
                aria-label="Только аварийные"
                checked={search.emergency ?? false}
                onChange={(event) =>
                  changeFilters({
                    ...search,
                    emergency: event.target.checked || undefined,
                  })
                }
              />
            </label>
          </div>
          <section>
            <CaseFeed
              title=""
              isPending={feed.isPending}
              isEmpty={!feed.isError && cases.length === 0}
              emptyTitle="Заявок не найдено"
              emptyDescription={
                search.emergency || search.status
                  ? 'Попробуйте изменить выбранные фильтры'
                  : 'Заявки выбранных домов появятся здесь'
              }
              toolbar={
                <DispatchFeedFilters search={search} onChange={changeFilters} />
              }
            >
              {feed.isError && !feed.isFetchNextPageError ? (
                <CellList mode="island">
                  <CellSimple title="Не удалось загрузить ленту" />
                  <div className="px-(--spacing-size2xl) pb-(--spacing-size2xl)">
                    <Button stretched onClick={() => feed.refetch()}>
                      Повторить загрузку ленты
                    </Button>
                  </div>
                </CellList>
              ) : (
                cases.map((item) => (
                  <CaseCard
                    key={item.id}
                    dispatcher
                    caseItem={item}
                    search={getDispatchFeedSearch(search)}
                  />
                ))
              )}
            </CaseFeed>
            {feed.hasNextPage && (
              <Button
                stretched
                variant="secondary"
                className="mt-(--spacing-size2xl)"
                disabled={feed.isFetchingNextPage}
                loading={feed.isFetchingNextPage}
                onClick={() => feed.fetchNextPage()}
              >
                Показать ещё
              </Button>
            )}
            {feed.isFetchNextPageError && (
              <p role="alert" className="mt-(--spacing-size-m)">
                Не удалось загрузить следующую страницу. Попробуйте ещё раз.
              </p>
            )}
          </section>
        </>
      )}
    </AppPageContainer>
  )
}
