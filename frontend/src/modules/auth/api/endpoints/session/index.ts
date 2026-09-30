import { api } from '@/lib/api/httpClient'
import type { paths } from '@/lib/api/openapi'

export type PostSessionRequest = NonNullable<
  paths['/api/auth/session']['post']['requestBody']
>['content']['application/json']
export type PostSessionResponse =
  paths['/api/auth/session']['post']['responses'][200]['content']['application/json']
export type GetSessionResponse =
  paths['/api/auth/session']['get']['responses'][200]['content']['application/json']
export type PatchSessionRequest = NonNullable<
  paths['/api/auth/session']['patch']['requestBody']
>['content']['application/json']
export type PatchSessionResponse =
  paths['/api/auth/session']['patch']['responses'][200]['content']['application/json']

export const postSession = async (initData: PostSessionRequest) =>
  api.post<PostSessionResponse>('/api/auth/session', initData)

export const getSession = async () =>
  api.get<GetSessionResponse>('/api/auth/session')

export const patchSession = (body: PatchSessionRequest) =>
  api.patch<PatchSessionResponse>('/api/auth/session', body)

export const deleteSession = () => api.delete<void>('/api/auth/session')
