import { Button, CellList, CellSimple } from '@maxhub/max-ui'
import { useNavigate, useSearch } from '@tanstack/react-router'

import { AppHeader } from '@/components/AppHeader'
import { AppName } from '@/components/AppName'
import { AppPageContainer } from '@/components/AppPageContainer'
import { getUniquePaginatedItems } from '@/lib/query/getUniquePaginatedItems'
import type { GetSessionResponse } from '@/modules/auth/api/endpoints'
import { HouseFeed } from '../components/HouseFeed'
import { HouseOverview } from '../components/HouseOverview'
import { useHomeFeed } from '../api/hooks/useHomeFeed'
import type { HomeSort } from '../api/endpoints'

export const HousePage = ({
  house,
  userId,
}: {
  house: NonNullable<GetSessionResponse['house']>
  userId: string
}) => {
  const houseId = house.id
  const { sort: searchSort } = useSearch({ from: '/' })
  const sort: HomeSort = searchSort ?? 'activity'
  const navigate = useNavigate()
  const home = useHomeFeed(houseId, userId, sort)
  const firstPage = home.data?.pages[0]

  const handleSortChange = (nextSort: HomeSort) => {
    navigate({
      to: '/',
      search: { sort: nextSort },
    })
  }

  const cases = getUniquePaginatedItems(home.data?.pages, (page) => page.cases)

  return (
    <AppPageContainer>
      <AppHeader
        title={<AppName />}
        subtitle={firstPage?.house.full_address ?? house.full_address}
      />

      {home.isError && !home.isFetchNextPageError ? (
        <CellList mode="island">
          <CellSimple
            title="Не удалось загрузить ленту"
            subtitle="Проверьте соединение и попробуйте ещё раз."
          />
          <div className="px-(--spacing-size2xl) pb-(--spacing-size2xl)">
            <Button
              stretched
              variant="secondary"
              onClick={() => home.refetch()}
            >
              Повторить
            </Button>
          </div>
        </CellList>
      ) : (
        <>
          <HouseOverview activeCaseCount={firstPage?.active_cases_count} />
          <HouseFeed
            cases={cases}
            houseId={houseId}
            userId={userId}
            sort={sort}
            isPending={home.isPending}
            onSortChange={handleSortChange}
          />
          {home.hasNextPage && (
            <div className="mt-(--spacing-size2xl)">
              <Button
                stretched
                variant="secondary"
                loading={home.isFetchingNextPage}
                disabled={home.isFetchingNextPage}
                onClick={() => home.fetchNextPage()}
              >
                Показать ещё
              </Button>
            </div>
          )}
          {home.isFetchNextPageError && (
            <p className="mt-(--spacing-size-m)" role="alert">
              Не удалось загрузить следующую страницу. Попробуйте ещё раз.
            </p>
          )}
        </>
      )}
    </AppPageContainer>
  )
}
