import { ChevronDown } from 'lucide-react'
import { Select } from '@/components/Select'
import {
  caseStatusTranslations,
  getCaseStatusTranslation,
} from '@/modules/cases'
import { getDispatchStatus } from '../helpers/getDispatchStatus'
import type { DispatchStatus } from '../helpers/getDispatchStatus'
import type { DispatchSearch } from '../helpers/validateDispatchSearch'

type DispatchFeedFiltersProps = {
  search: DispatchSearch
  onChange: (next: DispatchSearch) => void
}

export const DispatchFeedFilters = ({
  search,
  onChange,
}: DispatchFeedFiltersProps) => {
  const statuses = search.status ?? []
  const statusLabel =
    statuses.length === 0
      ? 'Все статусы'
      : statuses.map(getCaseStatusTranslation).join(', ')

  return (
    <div className="mb-(--spacing-size2xl)">
      <Select
        mode="multiple"
        value={statuses}
        onValueChange={(values) => {
          const selected = values
            .map(getDispatchStatus)
            .filter((status): status is DispatchStatus => status !== undefined)
          onChange({
            ...search,
            status: selected.length ? selected : undefined,
          })
        }}
      >
        <Select.Trigger>
          {(triggerProps) => (
            <button
              {...triggerProps}
              aria-labelledby="dispatch-status-label dispatch-status-value"
              className="flex min-h-(--app-control-height) w-full min-w-0 items-center justify-between gap-(--spacing-size-m) rounded-(--app-radius-control) border border-(--divider-primary) bg-(--background-surface) px-(--spacing-size-xl) text-left text-(--font-size-action-small) focus-visible:outline-2 focus-visible:outline-(--text-themed)"
            >
              <span
                id="dispatch-status-value"
                className="min-w-0 flex-1 truncate"
              >
                {statusLabel}
              </span>
              <ChevronDown size={16} aria-hidden="true" className="shrink-0" />
            </button>
          )}
        </Select.Trigger>
        <Select.Content
          aria-label="Статус задачи"
          className="top-full left-0 mt-(--spacing-size-s) max-h-[50dvh] w-full overflow-y-auto p-(--spacing-size-xs)"
        >
          {statuses.length > 0 && (
            <button
              type="button"
              className="min-h-(--app-control-height-compact) w-full rounded-(--app-radius-small) px-(--spacing-size-m) text-left text-(length:--font-size-action-small) font-medium text-(--app-accent-text) focus-visible:outline-2 focus-visible:outline-(--text-themed)"
              onClick={() => onChange({ ...search, status: undefined })}
            >
              Сбросить статусы
            </button>
          )}
          {Object.keys(caseStatusTranslations).map((value) => (
            <Select.Item key={value} value={value}>
              {getCaseStatusTranslation(value as DispatchStatus)}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </div>
  )
}
