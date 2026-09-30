import { Button } from '@maxhub/max-ui'
import { ChevronDown } from 'lucide-react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { ApiError } from '@/lib/api/httpClient'
import { Select } from '@/components/Select'
import { Skeleton } from '@/components/Skeleton'
import { getUniquePaginatedItems } from '@/lib/query/getUniquePaginatedItems'
import { useDispatchHouses } from '../api/hooks/useDispatchHouses'
import { useUpdateDispatchHouseSelection } from '../api/hooks/useUpdateDispatchHouseSelection'
import type { DispatchHouseSelection } from '../api/endpoints'
import { dispatchHouseSelectionSchema } from '../helpers/dispatchHouseSelectionForm'
import type { DispatchHouseSelectionFormValues } from '../helpers/dispatchHouseSelectionForm'

function sameHouseIds(left: string[], right: string[]) {
  return left.length === right.length && left.every((id) => right.includes(id))
}

export const DispatchHousePicker = ({
  selectedHouses,
}: {
  selectedHouses: DispatchHouseSelection['houses']
}) => {
  const [openedOnce, setOpenedOnce] = useState(false)
  const houses = useDispatchHouses(openedOnce)
  const { mutateAsync, error: saveError } = useUpdateDispatchHouseSelection()
  const errorId = useId()
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'error'>(
    'idle',
  )
  const savedIdsRef = useRef(selectedHouses.map((house) => house.id))
  const latestIdsRef = useRef(savedIdsRef.current)
  const failedIdsRef = useRef<string[] | null>(null)
  const savingRef = useRef(false)
  const {
    control,
    getValues,
    setError,
    setValue,
    formState: { errors },
  } = useForm<DispatchHouseSelectionFormValues>({
    resolver: zodResolver(dispatchHouseSelectionSchema),
    defaultValues: { houseIds: selectedHouses.map((house) => house.id) },
    mode: 'onChange',
  })
  const houseIds = useWatch({ control, name: 'houseIds' })
  latestIdsRef.current = houseIds
  const houseError = errors.houseIds?.message
  const persist = useCallback(
    async (retry = false) => {
      if (savingRef.current) return
      if (
        !retry &&
        failedIdsRef.current &&
        sameHouseIds(latestIdsRef.current, failedIdsRef.current)
      )
        return
      savingRef.current = true

      while (!sameHouseIds(latestIdsRef.current, savedIdsRef.current)) {
        const requested = [...latestIdsRef.current]
        const result = dispatchHouseSelectionSchema.safeParse({
          houseIds: requested,
        })
        if (!result.success) {
          setError('houseIds', {
            type: 'validate',
            message: result.error.issues[0]?.message,
          })
          break
        }
        setSaveStatus('saving')
        try {
          await mutateAsync({ house_ids: requested })
          savedIdsRef.current = requested
          failedIdsRef.current = null
        } catch {
          if (!sameHouseIds(latestIdsRef.current, requested)) continue
          failedIdsRef.current = requested
          setSaveStatus('error')
          savingRef.current = false
          return
        }
      }

      savingRef.current = false
      setSaveStatus('idle')
    },
    [mutateAsync, setError],
  )

  useEffect(() => {
    if (!savingRef.current)
      savedIdsRef.current = selectedHouses.map((house) => house.id)
  }, [selectedHouses])

  useEffect(() => {
    if (sameHouseIds(houseIds, savedIdsRef.current)) {
      failedIdsRef.current = null
      if (!savingRef.current) setSaveStatus('idle')
      return
    }
    const timer = setTimeout(() => persist(), 250)
    return () => clearTimeout(timer)
  }, [houseIds, persist])

  const persistRef = useRef(persist)
  persistRef.current = persist
  useEffect(() => {
    return () => {
      if (!sameHouseIds(latestIdsRef.current, savedIdsRef.current))
        persistRef.current()
    }
  }, [])
  const available = getUniquePaginatedItems(
    houses.data?.pages,
    (page) => page.houses,
  )
  const options = Array.from(
    new Map(
      [...selectedHouses, ...available].map((house) => [house.id, house]),
    ).values(),
  ).sort(
    (left, right) =>
      left.full_address.localeCompare(right.full_address, 'ru') ||
      left.id.localeCompare(right.id),
  )
  const loadFailed = houses.isError && !houses.isFetchNextPageError
  useEffect(() => {
    if (!houses.isSuccess || houses.isFetching) return
    const availableIds = new Set(options.map((house) => house.id))
    const previous = getValues('houseIds')
    const accessible = previous.filter((id) => availableIds.has(id))
    if (accessible.length !== previous.length)
      setValue('houseIds', accessible, {
        shouldDirty: true,
        shouldValidate: true,
      })
  }, [options, houses.isSuccess, houses.isFetching, getValues, setValue])
  return (
    <Select
      mode="multiple"
      selectAll
      value={houseIds}
      onValueChange={(next) =>
        setValue('houseIds', next, {
          shouldDirty: true,
          shouldValidate: true,
        })
      }
      onOpenChange={(open) => {
        if (open) setOpenedOnce(true)
      }}
      className="shrink-0"
    >
      <Select.Trigger>
        {(triggerProps) => (
          <Button
            {...triggerProps}
            size="small"
            variant="secondary"
            iconAfter={<ChevronDown size={16} aria-hidden="true" />}
          >
            {selectedHouses.length
              ? `Дома: ${selectedHouses.length}`
              : 'Выбрать дома'}
          </Button>
        )}
      </Select.Trigger>
      <Select.Content
        aria-label="Выбор домов"
        className="top-full right-0 mt-(--spacing-size-s) w-[min(20rem,calc(100vw-2*var(--app-page-gutter)))] p-(--spacing-size2xl)"
      >
        <div>
          <fieldset className="grid min-w-0 gap-(--spacing-size-xl)">
            <legend className="sr-only">Рабочие дома</legend>
            {houses.isPending ? (
              <div
                role="status"
                aria-label="Загрузка домов"
                className="grid gap-(--spacing-size-xs)"
              >
                {[0, 1, 2].map((item) => (
                  <Skeleton
                    key={item}
                    className="h-10 w-full rounded-(--app-radius-control)"
                  />
                ))}
              </div>
            ) : loadFailed ? (
              <>
                <p role="alert">
                  Не удалось загрузить дома управляющей организации.
                </p>
                <Button
                  type="button"
                  stretched
                  variant="secondary"
                  onClick={() => houses.refetch()}
                >
                  Повторить
                </Button>
              </>
            ) : (
              <>
                {options.length ? (
                  <div className="grid max-h-[min(50dvh,24rem)] gap-(--spacing-size-xs) overflow-y-auto overscroll-contain">
                    {options.map((house) => (
                      <Select.Item
                        key={house.id}
                        value={house.id}
                        aria-invalid={Boolean(houseError)}
                        aria-describedby={houseError ? errorId : undefined}
                      >
                        {house.full_address}
                      </Select.Item>
                    ))}
                  </div>
                ) : (
                  <p>Управляющая организация ещё не добавила дома.</p>
                )}
                {houses.hasNextPage && (
                  <Button
                    type="button"
                    stretched
                    variant="secondary"
                    loading={houses.isFetchingNextPage}
                    disabled={houses.isFetchingNextPage}
                    onClick={() => houses.fetchNextPage()}
                  >
                    Загрузить ещё дома
                  </Button>
                )}
                {houses.isFetchNextPageError && (
                  <p role="alert">
                    Не удалось загрузить остальные дома. Попробуйте ещё раз.
                  </p>
                )}
                {houseError && (
                  <p
                    id={errorId}
                    role="alert"
                    className="text-(length:--font-size-action-small) text-(--text-negative)"
                  >
                    {houseError}
                  </p>
                )}
              </>
            )}
          </fieldset>
          {saveStatus === 'error' && (
            <div className="mt-(--spacing-size-xl) grid gap-(--spacing-size-m)">
              <p
                role="alert"
                className="text-(length:--font-size-action-small) text-(--text-negative)"
              >
                {saveError instanceof ApiError && saveError.status === 403
                  ? 'Доступ к одному из домов изменился. Обновите список и выберите дома ещё раз.'
                  : 'Не удалось сохранить дома. Попробуйте ещё раз.'}
              </p>
              <Button
                size="small"
                variant="secondary"
                onClick={() => persist(true)}
              >
                Повторить
              </Button>
            </div>
          )}
        </div>
      </Select.Content>
    </Select>
  )
}
