import type { GetSessionResponse } from './api/endpoints'

export type SessionRole = Exclude<GetSessionResponse['active_role'], null>
