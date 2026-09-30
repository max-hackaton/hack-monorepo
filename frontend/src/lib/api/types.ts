export type QueryParams = Record<string, string | number | boolean | undefined>

export type JsonBody = Record<string, unknown> | Array<unknown>

export type RequestBody = BodyInit | JsonBody

export type RequestOptions = Omit<RequestInit, 'body' | 'method'> & {
  params?: QueryParams
  body?: RequestBody
}

export type ApiErrorDetails = {
  status: number
  statusText: string
  data?: unknown
  responseHeaders: Headers
}
