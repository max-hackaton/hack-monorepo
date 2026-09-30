import { api } from '@/lib/api/httpClient'
import type { paths } from '@/lib/api/openapi'

export type DispatchClassificationInput = NonNullable<
  paths['/api/dispatch/cases/{case_id}/classification']['put']['requestBody']
>['content']['application/json']
type DispatchClassificationResponse =
  paths['/api/dispatch/cases/{case_id}/classification']['put']['responses'][200]['content']['application/json']

export const updateDispatchClassification = (
  id: string,
  body: DispatchClassificationInput,
) =>
  api.put<DispatchClassificationResponse>(
    `/api/dispatch/cases/${encodeURIComponent(id)}/classification`,
    body,
  )
