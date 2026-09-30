import { api } from '@/lib/api/httpClient'
import type { paths } from '@/lib/api/openapi'
import type { CaseEventsResponse } from '../caseEvents'
import type { CaseId } from '../caseDetail'

export type CaseMessageInput = NonNullable<
  paths['/api/cases/{case_id}/messages']['post']['requestBody']
>['content']['application/json']

export const postCaseMessage = (id: CaseId, body: CaseMessageInput) =>
  api.post<CaseEventsResponse['events'][number]>(
    `/api/cases/${encodeURIComponent(id)}/messages`,
    body,
  )
