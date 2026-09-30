import type { CaseEventsResponse } from '../../api/endpoints'
import { getCaseStatusTranslation } from '../getCaseStatusTranslation'

type StatusChangeData = Extract<
  CaseEventsResponse['events'][number],
  { event_type: 'status_changed' }
>['data']

export function formatCaseStatusChange(data: StatusChangeData) {
  const previous = getCaseStatusTranslation(data.from_status_key)
  const next = getCaseStatusTranslation(data.to_status_key)

  if (data.from_status_key === data.to_status_key) {
    return `Этап изменён, статус: «${next}»`
  }

  return `Статус изменён: «${previous}» → «${next}»`
}
