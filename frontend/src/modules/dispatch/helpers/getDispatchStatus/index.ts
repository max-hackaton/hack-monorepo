import { caseStatusTranslations } from '@/modules/cases'
import type { DispatchFilters } from '../../api/endpoints'

export type DispatchStatus = NonNullable<DispatchFilters['status_key']>

export function getDispatchStatus(value: unknown): DispatchStatus | undefined {
  return Object.keys(caseStatusTranslations).find(
    (key): key is DispatchStatus => key === value,
  )
}
