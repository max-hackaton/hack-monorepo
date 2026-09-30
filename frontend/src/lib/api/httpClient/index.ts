import { env } from '@/env'
import type {
  ApiErrorDetails,
  QueryParams,
  RequestBody,
  RequestOptions,
} from '../types'

type ApiResponse<T> = {
  data: T
  headers: Headers
  status: number
}

type ApiClientOptions = {
  baseUrl: string
  credentials?: RequestCredentials
  fetchFn?: typeof fetch
  headers?: HeadersInit
}

export class ApiError extends Error {
  status: number
  statusText: string
  data?: unknown
  responseHeaders: Headers

  constructor({ status, statusText, data, responseHeaders }: ApiErrorDetails) {
    super(
      `API request failed with status ${status}${statusText ? ` ${statusText}` : ''}`,
    )
    this.name = 'ApiError'
    this.status = status
    this.statusText = statusText
    this.data = data
    this.responseHeaders = responseHeaders
  }
}

function buildSearchParams(params?: QueryParams) {
  const searchParams = new URLSearchParams()

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.set(key, String(value))
    }
  })

  return searchParams
}

function buildUrl(path: string, baseUrl: string, params?: QueryParams) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '')
  const normalizedPath = path.replace(/^\/+/, '')
  const search = buildSearchParams(params).toString()
  const url = `${normalizedBaseUrl}/${normalizedPath}`

  return search ? `${url}?${search}` : url
}

function isBodyInit(body: RequestBody): body is BodyInit {
  return (
    typeof body === 'string' ||
    body instanceof Blob ||
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof ReadableStream ||
    body instanceof ArrayBuffer ||
    ArrayBuffer.isView(body)
  )
}

function prepareBody(body: RequestBody | undefined, headers: Headers) {
  if (body == null || isBodyInit(body)) {
    return body ?? undefined
  }

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  return JSON.stringify(body)
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204 || response.status === 205) {
    return undefined as T
  }

  const contentType = response.headers.get('content-type') ?? ''

  if (
    contentType.includes('application/json') ||
    contentType.includes('+json')
  ) {
    return response.json() as Promise<T>
  }

  return response.text() as T
}

async function createApiError(response: Response) {
  let data: unknown

  try {
    data = await parseResponse(response)
  } catch {
    data = undefined
  }

  return new ApiError({
    status: response.status,
    statusText: response.statusText,
    data,
    responseHeaders: new Headers(response.headers),
  })
}

function createHttpClient({
  baseUrl,
  credentials,
  fetchFn = fetch,
  headers: defaultHeaders,
}: ApiClientOptions) {
  async function requestResponse<T>(
    method: string,
    path: string,
    options: RequestOptions = {},
  ): Promise<ApiResponse<T>> {
    const { body, headers, params, ...init } = options
    const normalizedHeaders = new Headers(defaultHeaders)
    new Headers(headers).forEach((value, key) =>
      normalizedHeaders.set(key, value),
    )

    const response = await fetchFn(buildUrl(path, baseUrl, params), {
      ...init,
      body: prepareBody(body, normalizedHeaders),
      credentials: init.credentials ?? credentials,
      headers: normalizedHeaders,
      method,
    })

    if (!response.ok) {
      throw await createApiError(response)
    }

    return {
      data: await parseResponse<T>(response),
      headers: new Headers(response.headers),
      status: response.status,
    }
  }

  async function request<T>(
    method: string,
    path: string,
    options?: RequestOptions,
  ): Promise<T> {
    const response = await requestResponse<T>(method, path, options)

    return response.data
  }

  return {
    get<T>(path: string, options?: RequestOptions) {
      return request<T>('GET', path, options)
    },
    async getBlob(path: string, options: RequestOptions = {}) {
      const response = await fetchFn(buildUrl(path, baseUrl, options.params), {
        method: 'GET',
        credentials: options.credentials ?? credentials,
        headers: new Headers(options.headers ?? defaultHeaders),
        signal: options.signal,
      })
      if (!response.ok) throw await createApiError(response)
      return response.blob()
    },
    post<T>(path: string, body?: RequestBody, options?: RequestOptions) {
      return request<T>('POST', path, { ...options, body })
    },
    put<T>(path: string, body?: RequestBody, options?: RequestOptions) {
      return request<T>('PUT', path, { ...options, body })
    },
    patch<T>(path: string, body?: RequestBody, options?: RequestOptions) {
      return request<T>('PATCH', path, { ...options, body })
    },
    delete<T>(path: string, options?: RequestOptions) {
      return request<T>('DELETE', path, options)
    },
  }
}

export const api = createHttpClient({
  baseUrl: env.VITE_API_URL,
  credentials: 'include',
})
