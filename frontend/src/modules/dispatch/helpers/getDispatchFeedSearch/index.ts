import type { DispatchSearch } from '../validateDispatchSearch'

export function getDispatchFeedSearch(search: DispatchSearch): DispatchSearch {
  return {
    emergency: search.emergency,
    status: search.status,
  }
}
