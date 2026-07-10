export interface ErrorEntity {
  error: string
  message: string
}

export class ApiRequestError extends Error {
  readonly status: number
  readonly body: ErrorEntity

  constructor(status: number, body: ErrorEntity) {
    super(body.message ?? body.error)
    this.name = 'ApiRequestError'
    this.status = status
    this.body = body
  }
}

export async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL as string
  const apiKey = import.meta.env.VITE_API_KEY as string

  const response = await fetch(`${baseUrl}${path}`, {
    headers: { 'x-api-key': apiKey },
    signal,
  })

  if (!response.ok) {
    let body: ErrorEntity
    try {
      body = (await response.json()) as ErrorEntity
    } catch {
      body = { error: String(response.status), message: response.statusText }
    }
    throw new ApiRequestError(response.status, body)
  }

  return response.json() as Promise<T>
}
