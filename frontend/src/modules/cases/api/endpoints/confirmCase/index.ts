import { api } from '@/lib/api/httpClient'
import type { paths } from '@/lib/api/openapi'

type ConfirmCaseId =
  paths['/api/cases/{id}/confirmations']['post']['parameters']['path']['id']
export type ConfirmationResponse =
  paths['/api/cases/{id}/confirmations']['post']['responses'][200]['content']['application/json']

export const postConfirmCase = (id: ConfirmCaseId) =>
  api.post<ConfirmationResponse>(
    `/api/cases/${encodeURIComponent(id)}/confirmations`,
  )
