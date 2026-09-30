import type { paths } from '@/lib/api/openapi'

export type HomeCase =
  paths['/api/home']['get']['responses'][200]['content']['application/json']['cases'][number]
