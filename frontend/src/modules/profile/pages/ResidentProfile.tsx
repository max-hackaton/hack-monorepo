import { Button, CellList, CellSimple, Typography } from '@maxhub/max-ui'
import { useNavigate } from '@tanstack/react-router'
import { ChevronDown } from 'lucide-react'

import { AppHeader } from '@/components/AppHeader'
import { Skeleton } from '@/components/Skeleton'
import { AppPageContainer } from '@/components/AppPageContainer'
import { Select } from '@/components/Select'
import { ApiError } from '@/lib/api/httpClient'
import { LogoutButton, useMaxSession } from '@/modules/auth'
import { useHousesQuery } from '../api/hooks/useHousesQuery'
import { useSelectHouseMutation } from '../api/hooks/useSelectHouseMutation'
import { ProfileIdentity } from '../components/ProfileIdentity'

export const ResidentProfile = () => {
  const { house } = useMaxSession()
  const houses = useHousesQuery()
  const selection = useSelectHouseMutation()
  const navigate = useNavigate()
  const sortedHouses = [...(houses.data?.houses ?? [])].sort(
    (left, right) =>
      left.full_address.localeCompare(right.full_address, 'ru') ||
      left.id.localeCompare(right.id),
  )

  const handleSelect = (houseId: string) => {
    if (selection.isPending || houseId === house?.id) return
    selection.mutate(
      { house_id: houseId },
      { onSuccess: () => navigate({ to: '/' }) },
    )
  }

  const selectionError =
    selection.error instanceof ApiError && selection.error.status === 403
      ? 'Доступ к этому дому больше не подтверждается. Выберите другой дом.'
      : selection.error instanceof ApiError && selection.error.status === 503
        ? 'MAX сейчас недоступен. Попробуйте выбрать дом ещё раз.'
        : 'Не удалось выбрать дом. Попробуйте ещё раз.'

  return (
    <AppPageContainer>
      <AppHeader title="Профиль" />
      <ProfileIdentity role="resident" />
      <section
        className="mt-(--spacing-size-m)"
        aria-labelledby="profile-houses-title"
      >
        <Typography.Title variant="medium-strong" asChild>
          <h2 id="profile-houses-title" className="mb-(--spacing-size-xl)">
            Выбрать дом
          </h2>
        </Typography.Title>

        {houses.isPending ? (
          <CellList mode="island">
            <div
              role="status"
              aria-label="Загрузка домов"
              className="grid gap-(--spacing-size-m) p-(--spacing-size2xl)"
            >
              <Skeleton className="h-12 w-full rounded-(--app-radius-control)" />
            </div>
          </CellList>
        ) : houses.isError ? (
          <CellList mode="island">
            <CellSimple title="Не удалось загрузить дома" />
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
        ) : sortedHouses.length === 0 ? (
          <CellList mode="island">
            <CellSimple
              title="Пока нет домов для выбора"
              subtitle="Откройте приложение из чата нужного дома в MAX."
            />
          </CellList>
        ) : (
          <Select
            mode="single"
            value={house?.id ?? null}
            onValueChange={handleSelect}
          >
            <Select.Trigger>
              {(triggerProps) => (
                <button
                  {...triggerProps}
                  disabled={selection.isPending}
                  aria-label={`Выбрать дом: ${house?.full_address ?? 'Выбрать дом'}`}
                  className="flex min-h-(--app-control-height) w-full min-w-0 items-center justify-between gap-(--spacing-size-m) rounded-(--app-radius-control) border border-(--divider-primary) bg-(--background-surface) px-(--spacing-size-xl) py-(--spacing-size-s) text-left text-(--font-size-action-small) focus-visible:outline-2 focus-visible:outline-(--text-themed)"
                >
                  <span className="min-w-0 flex-1 wrap-break-word">
                    {house?.full_address ?? 'Выбрать дом'}
                  </span>
                  <ChevronDown
                    size={16}
                    aria-hidden="true"
                    className="shrink-0"
                  />
                </button>
              )}
            </Select.Trigger>
            <Select.Content
              floating
              aria-label="Выбор дома"
              className="overflow-y-auto p-(--spacing-size-xs)"
            >
              {sortedHouses.map((item) => (
                <Select.Item key={item.id} value={item.id}>
                  {item.full_address}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        )}
        {selection.isError && (
          <Typography.Body
            variant="small"
            className="mt-(--spacing-size-m)"
            role="alert"
          >
            {selectionError}
          </Typography.Body>
        )}
      </section>
      <LogoutButton />
    </AppPageContainer>
  )
}
