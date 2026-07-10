import { vi } from 'vitest'

export const TEST_API_BASE_URL = 'https://api.example.com'
export const TEST_API_KEY = 'test-key'

export function stubApiEnv(): void {
  vi.stubEnv('VITE_API_BASE_URL', TEST_API_BASE_URL)
  vi.stubEnv('VITE_API_KEY', TEST_API_KEY)
}

export function restoreApiEnv(): void {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
}

function statusText(status: number): string {
  if (status === 401) return 'Unauthorized'
  if (status === 404) return 'Not Found'
  if (status === 500) return 'Internal Server Error'
  return 'OK'
}

function buildResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: statusText(status),
    json: () => Promise.resolve(body),
  }
}

export function mockFetchJson(status: number, body: unknown): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn().mockResolvedValue(buildResponse(status, body))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

export function mockFetchRejection(error: unknown): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn().mockRejectedValue(error)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

type DeferredFetch = {
  fetchMock: ReturnType<typeof vi.fn>
  settle: (status: number, body: unknown) => void
  fail: (error: unknown) => void
  getSignal: () => AbortSignal | undefined
}

/**
 * A fetch double that never settles on its own — the caller controls exactly
 * when (and if) the underlying promise resolves or rejects. Used to exercise
 * races between an in-flight request and consumer-side cancellation.
 */
export function mockFetchDeferred(): DeferredFetch {
  let settleFn: ((response: unknown) => void) | undefined
  let failFn: ((error: unknown) => void) | undefined
  let capturedSignal: AbortSignal | undefined

  function getDeferredHandlers(): {
    settle: (response: unknown) => void
    fail: (error: unknown) => void
  } {
    if (!settleFn || !failFn) {
      throw new Error('Cannot settle deferred fetch before fetch is called')
    }

    return { settle: settleFn, fail: failFn }
  }

  const fetchMock = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
    capturedSignal = init?.signal ?? undefined
    return new Promise((resolvePromise, rejectPromise) => {
      settleFn = resolvePromise
      failFn = rejectPromise
    })
  })

  vi.stubGlobal('fetch', fetchMock)

  return {
    fetchMock,
    settle: (status, body) => {
      getDeferredHandlers().settle(buildResponse(status, body))
    },
    fail: (error) => {
      getDeferredHandlers().fail(error)
    },
    getSignal: () => capturedSignal,
  }
}

export function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}
