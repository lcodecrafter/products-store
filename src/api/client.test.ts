import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiRequestError, request } from './client'

const BASE_URL = 'https://api.example.com'
const API_KEY = 'test-key'

beforeEach(() => {
  vi.stubEnv('VITE_API_BASE_URL', BASE_URL)
  vi.stubEnv('VITE_API_KEY', API_KEY)
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

async function getRejectedValue(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise
  } catch (error) {
    return error
  }

  throw new Error('Expected promise to reject')
}

function mockFetch(status: number, body: unknown, ok = status >= 200 && status < 300): void {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok,
      status,
      statusText: status === 401 ? 'Unauthorized' : status === 404 ? 'Not Found' : 'OK',
      json: () => Promise.resolve(body),
    }),
  )
}

describe('request', () => {
  it('resolves with the parsed body on a successful response', async () => {
    mockFetch(200, { hello: 'world' })
    const result = await request<{ hello: string }>('/anything')
    expect(result).toEqual({ hello: 'world' })
  })

  it('builds the request URL from the base URL and path', async () => {
    mockFetch(200, {})
    await request('/products')
    const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string]
    expect(url).toBe(`${BASE_URL}/products`)
  })

  it('sends the x-api-key header', async () => {
    mockFetch(200, {})
    await request('/products')
    const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit]
    expect((init.headers as Record<string, string>)['x-api-key']).toBe(API_KEY)
  })

  it('forwards an AbortSignal to fetch', async () => {
    mockFetch(200, {})
    const controller = new AbortController()
    await request('/products', controller.signal)
    const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit]
    expect(init.signal).toBe(controller.signal)
  })

  it('throws ApiRequestError with the response status and parsed ErrorEntity on 401', async () => {
    const errorBody = { error: '401', message: 'Invalid API key' }
    mockFetch(401, errorBody, false)
    const error = await getRejectedValue(request('/products'))
    expect(error).toBeInstanceOf(ApiRequestError)
    expect(error).toMatchObject({ status: 401, body: errorBody })
  })

  it('throws ApiRequestError with status 404', async () => {
    const errorBody = { error: 'Not Found', message: 'Product not found' }
    mockFetch(404, errorBody, false)
    const error = await getRejectedValue(request('/products/missing'))
    expect(error).toBeInstanceOf(ApiRequestError)
    expect(error).toMatchObject({ status: 404, body: errorBody })
  })

  it('uses the ErrorEntity message as the Error message', async () => {
    mockFetch(404, { error: 'Not Found', message: 'Product not found' }, false)
    const error = await getRejectedValue(request('/products/missing'))
    expect((error as ApiRequestError).message).toBe('Product not found')
  })

  it('falls back to a status-based error when the error body cannot be parsed', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('invalid json')),
      }),
    )
    const error = await getRejectedValue(request('/products'))
    expect(error).toBeInstanceOf(ApiRequestError)
    expect(error).toMatchObject({
      status: 500,
      body: { error: '500', message: 'Internal Server Error' },
    })
  })
})
