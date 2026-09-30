import { api } from '@/lib/api/httpClient'

export const getCasePhoto = (url: string, signal?: AbortSignal) =>
  api.getBlob(url, { signal })
