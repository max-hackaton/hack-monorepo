import { api } from '@/lib/api/httpClient'
import type { paths } from '@/lib/api/openapi'
import type { CaseDetail, CaseId } from '../caseDetail'

export type CaseStatusInput = NonNullable<
  paths['/api/cases/{case_id}/status']['patch']['requestBody']
>['content']['application/json']

export const patchCaseStatus = (id: CaseId, body: CaseStatusInput) =>
  api.patch<CaseDetail>(`/api/cases/${encodeURIComponent(id)}/status`, body)
