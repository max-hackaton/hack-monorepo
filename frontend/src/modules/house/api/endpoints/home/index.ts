import { api } from '@/lib/api/httpClient'
import type { paths } from '@/lib/api/openapi'

export type HomeQuery = NonNullable<
  paths['/api/home']['get']['parameters']['query']
>
export type HomeResponse =
  paths['/api/home']['get']['responses'][200]['content']['application/json']
export type HomeSort = NonNullable<HomeQuery['sort']>

export const getHome = async (query: HomeQuery) =>
  api.get<HomeResponse>('/api/home', { params: query })
