import { Button, CellList, CellSimple } from '@maxhub/max-ui'
import { useId } from 'react'

import { getUniquePaginatedItems } from '@/lib/query/getUniquePaginatedItems'
import { Skeleton } from '@/components/Skeleton'
import type { useCaseEvents } from '../api/hooks/useCaseEvents'
import { formatCaseDate } from '../helpers/formatCaseDate'
import { eventTitle } from '../helpers/eventTitle'
import { isCaseAccessError } from '../helpers/isCaseAccessError'

type CaseHistoryProps = {
  events: ReturnType<typeof useCaseEvents>
  isEmergency: boolean
}

export const CaseHistory = ({ events, isEmergency }: CaseHistoryProps) => {
  const timelineId = useId()
  const history = getUniquePaginatedItems(
    events.data?.pages,
    (page) => page.events,
  )

  return (
    <section aria-labelledby="case-history-title">
      {events.isError &&
        events.data &&
        !events.isFetchNextPageError &&
        !isCaseAccessError(events.error) && (
          <div
            role="alert"
            className="mb-(--spacing-size-xl) grid gap-(--spacing-size-m) text-(--font-size-action-small)"
          >
            <p>
              Не удалось обновить историю заявки. Показаны ранее загруженные
              записи.
            </p>
            <Button variant="secondary" onClick={() => events.refetch()}>
              Обновить историю
            </Button>
          </div>
        )}
      {events.isPending ? (
        <div
          role="status"
          aria-label="Загрузка истории"
          className="grid gap-(--spacing-size3xl)"
        >
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="space-y-(--spacing-size-s) pl-(--spacing-size4xl)"
            >
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : events.isError &&
        (isCaseAccessError(events.error) ||
          (!events.isFetchNextPageError && !events.data)) ? (
        <CellList mode="island">
          <CellSimple title="Не удалось загрузить историю" />
          <div className="px-(--spacing-size2xl) pb-(--spacing-size2xl)">
            <Button
              stretched
              variant="secondary"
              onClick={() => events.refetch()}
            >
              Повторить загрузку истории
            </Button>
          </div>
        </CellList>
      ) : history.length === 0 ? (
        <p>История заявки пока пуста.</p>
      ) : (
        <div>
          <ol id={timelineId}>
            {history.map((event, index) => (
              <li
                key={event.id}
                className="relative pb-(--spacing-size3xl) pl-(--spacing-size4xl) last:pb-0"
              >
                {index < history.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute top-3 bottom-0 left-1.25 w-px bg-(--app-accent-muted)"
                  />
                )}
                <span
                  aria-hidden="true"
                  className="absolute top-1 left-0 size-(--spacing-size-xl) rounded-full border-2 border-(--text-themed) bg-(--background-primary)"
                />
                <time
                  dateTime={event.occurred_at}
                  className="block text-(length:--font-size-tag) text-(--text-secondary)"
                >
                  {formatCaseDate(event.occurred_at)}
                </time>
                <strong className="mt-(--spacing-size2xs) block text-(--font-size-description) leading-snug">
                  {eventTitle(event)}
                </strong>
                {event.event_type === 'classification_confirmed' &&
                  event.data.to.case_type_name && (
                    <p className="mt-(--spacing-size-xs) text-(length:--font-size-description) text-(--text-secondary)">
                      {event.data.from.case_type_key !==
                        event.data.to.case_type_key &&
                      event.data.from.case_type_name
                        ? `${event.data.from.case_type_name} → `
                        : ''}
                      {event.data.to.case_type_name}
                    </p>
                  )}
                {'body' in event.data && (
                  <p className="mt-(--spacing-size-xs) text-(length:--font-size-description) leading-relaxed whitespace-pre-wrap wrap-anywhere text-(--text-secondary)">
                    {event.data.body}
                  </p>
                )}
                {event.event_type === 'case_created' && isEmergency && (
                  <p className="mt-(--spacing-size-xs) text-(length:--font-size-description) text-(--app-attention-fg)">
                    Аварийная ситуация
                  </p>
                )}
              </li>
            ))}
          </ol>
          {events.hasNextPage && !events.isFetchNextPageError && (
            <Button
              stretched
              variant="secondary"
              loading={events.isFetchingNextPage}
              disabled={events.isFetchingNextPage}
              onClick={() => events.fetchNextPage()}
            >
              Показать более ранние записи
            </Button>
          )}
          {events.isFetchNextPageError && (
            <div role="alert" className="grid gap-(--spacing-size-m)">
              <p>Не удалось загрузить более ранние записи.</p>
              <Button
                stretched
                variant="secondary"
                onClick={() => events.fetchNextPage()}
              >
                Повторить загрузку истории
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
