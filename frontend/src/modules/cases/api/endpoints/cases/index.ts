import type { CaseDetail } from '../caseDetail'
import { api } from '@/lib/api/httpClient'
import type { paths } from '@/lib/api/openapi'

type CreateCaseRequest = NonNullable<
  paths['/api/cases']['post']['requestBody']
>['content']['application/json']
export type CreateCaseInput = Pick<
  CreateCaseRequest,
  | 'case_type_key'
  | 'problem_key'
  | 'description'
  | 'visibility'
  | 'is_emergency'
  | 'location_details'
  | 'violation_started_at'
> & { photos: File[] }
export type CasesResponse =
  paths['/api/cases']['get']['responses'][200]['content']['application/json']
type CasesCursor = NonNullable<
  paths['/api/cases']['get']['parameters']['query']
>['cursor']
export type CasesScope = NonNullable<
  NonNullable<paths['/api/cases']['get']['parameters']['query']>['scope']
>
export type CasesStatus = NonNullable<
  NonNullable<paths['/api/cases']['get']['parameters']['query']>['status']
>

export const createCase = ({ photos, ...body }: CreateCaseInput) => {
  if (photos.length === 0) return api.post<CaseDetail>('/api/cases', body)

  const form = new FormData()
  for (const [key, value] of Object.entries(body)) {
    if (value != null) form.append(key, String(value))
  }
  for (const photo of photos) form.append('photos[]', photo)

  return api.post<CaseDetail>('/api/cases', form)
}

export const getCases = (
  scope: CasesScope,
  cursor?: CasesCursor,
  status?: CasesStatus,
) =>
  api.get<CasesResponse>('/api/cases', {
    params: {
      scope,
      ...(cursor ? { cursor } : {}),
      ...(status ? { status } : {}),
    },
  })
