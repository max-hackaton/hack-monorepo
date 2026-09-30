import { ApiError } from '@/lib/api/httpClient'

export function isCaseAccessError(error: unknown) {
  return error instanceof ApiError && [401, 403, 404].includes(error.status)
}
