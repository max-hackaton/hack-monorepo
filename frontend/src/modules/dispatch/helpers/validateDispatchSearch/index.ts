import { getDispatchStatus } from '../getDispatchStatus'
import type { DispatchStatus } from '../getDispatchStatus'

export type DispatchSearch = {
  emergency?: boolean
  status?: DispatchStatus[]
}

export function validateDispatchSearch(
  search: Record<string, unknown>,
): DispatchSearch {
  const rawStatuses = Array.isArray(search.status)
    ? search.status
    : [search.status]
  const statuses = [
    ...new Set(
      rawStatuses
        .map(getDispatchStatus)
        .filter((status): status is DispatchStatus => status !== undefined),
    ),
  ].sort()

  return {
    emergency: search.emergency === true ? true : undefined,
    status: statuses.length ? statuses : undefined,
  }
}
