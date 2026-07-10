import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  flushPromises,
  mockFetchDeferred,
  mockFetchJson,
  mockFetchRejection,
  restoreApiEnv,
  stubApiEnv,
  TEST_API_BASE_URL,
} from '../../test/mockFetch'
import { useProducts } from './useProducts'

const reactStateTracker = vi.hoisted(() => ({
  enabled: false,
  calls: [] as unknown[],
}))

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()

  return {
    ...actual,
    useState: <State>(initialState: State | (() => State)) => {
      const [value, setValue] = actual.useState(initialState)
      const trackedSetValue: typeof setValue = (nextValue) => {
        if (reactStateTracker.enabled) {
          reactStateTracker.calls.push(nextValue)
        }

        setValue(nextValue)
      }

      return [value, trackedSetValue]
    },
  }
})

beforeEach(() => {
  stubApiEnv()
})

afterEach(() => {
  vi.useRealTimers()
  reactStateTracker.enabled = false
  reactStateTracker.calls = []
  restoreApiEnv()
})

const sampleList = [
  {
    id: '1',
    brand: 'Apple',
    name: 'iPhone 14',
    basePrice: 999,
    imageUrl: 'http://img/1.jpg',
  },
]

describe('useProducts', () => {
  it('starts in a loading state with an empty product list', async () => {
    mockFetchJson(200, sampleList)

    const { result } = renderHook(() => useProducts())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.products).toEqual([])
    expect(result.current.error).toBeNull()

    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })

  it('resolves with the fetched products on success', async () => {
    mockFetchJson(200, sampleList)

    const { result } = renderHook(() => useProducts())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.products).toEqual(sampleList)
    expect(result.current.error).toBeNull()
  })

  it('requests the initial page with a limit of 21', async () => {
    mockFetchJson(200, sampleList)

    const { result } = renderHook(() => useProducts())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string]
    expect(url).toBe(`${TEST_API_BASE_URL}/products?limit=21`)
  })

  it('debounces search changes before requesting filtered products', () => {
    vi.useFakeTimers()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() => new Promise(() => undefined)),
    )

    const { rerender } = renderHook(({ search }) => useProducts(search), {
      initialProps: { search: '' },
    })

    expect(fetch).toHaveBeenCalledTimes(1)

    rerender({ search: 'pixel' })

    act(() => {
      vi.advanceTimersByTime(299)
    })

    expect(fetch).toHaveBeenCalledTimes(1)

    act(() => {
      vi.advanceTimersByTime(1)
    })

    expect(fetch).toHaveBeenCalledTimes(2)
    const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[1] as [string]
    expect(url).toBe(`${TEST_API_BASE_URL}/products?search=pixel`)
  })

  it('sets loading while a debounced search request is pending', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url === `${TEST_API_BASE_URL}/products?limit=21`) {
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: () => Promise.resolve(sampleList),
        })
      }

      return new Promise(() => undefined)
    })
    vi.stubGlobal('fetch', fetchMock)

    const { result, rerender } = renderHook(({ search }) => useProducts(search), {
      initialProps: { search: '' },
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    vi.useFakeTimers()
    rerender({ search: 'pixel' })

    expect(result.current.isLoading).toBe(false)

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.error).toBeNull()
    const lastCall = fetchMock.mock.calls.at(-1) as [string, RequestInit]
    expect(lastCall[0]).toBe(`${TEST_API_BASE_URL}/products?search=pixel`)
    expect(lastCall[1].headers).toEqual({ 'x-api-key': 'test-key' })
    expect(lastCall[1].signal).toBeInstanceOf(AbortSignal)
  })

  it('aborts the previous request when the debounced search changes', () => {
    vi.useFakeTimers()
    const capturedSignals: AbortSignal[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
        if (init?.signal) capturedSignals.push(init.signal)
        return new Promise(() => undefined)
      }),
    )

    const { rerender } = renderHook(({ search }) => useProducts(search), {
      initialProps: { search: '' },
    })

    expect(capturedSignals).toHaveLength(1)

    rerender({ search: 'pixel' })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(capturedSignals).toHaveLength(2)
    expect(capturedSignals[0]?.aborted).toBe(true)
    expect(capturedSignals[1]?.aborted).toBe(false)
  })

  it('exposes an error and stops loading when the request fails with an HTTP error', async () => {
    mockFetchJson(500, { error: 'Internal Server Error', message: 'Something broke' })

    const { result } = renderHook(() => useProducts())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.products).toEqual([])
    expect(result.current.error).not.toBeNull()
    expect(result.current.error?.message).toBe('Something broke')
  })

  it('exposes an error when the network request itself fails', async () => {
    mockFetchRejection(new TypeError('Network request failed'))

    const { result } = renderHook(() => useProducts())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.products).toEqual([])
    expect(result.current.error).not.toBeNull()
    expect(result.current.error?.message).toBe('Network request failed')
  })

  it('aborts the in-flight request on unmount', () => {
    const deferred = mockFetchDeferred()
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort')

    const { unmount } = renderHook(() => useProducts())

    unmount()

    expect(abortSpy).toHaveBeenCalledTimes(1)
    expect(deferred.getSignal()?.aborted).toBe(true)

    abortSpy.mockRestore()
  })

  it('ignores a late successful response that arrives after unmount', async () => {
    const deferred = mockFetchDeferred()

    const { result, unmount } = renderHook(() => useProducts())
    const stateBeforeUnmount = result.current

    unmount()
    reactStateTracker.calls = []
    reactStateTracker.enabled = true
    deferred.settle(200, sampleList)
    await act(async () => {
      await flushPromises()
    })
    reactStateTracker.enabled = false

    expect(result.current).toBe(stateBeforeUnmount)
    expect(result.current.products).toEqual([])
    expect(result.current.isLoading).toBe(true)
    expect(result.current.error).toBeNull()
    expect(reactStateTracker.calls).toEqual([])
  })

  it('ignores a late failure that arrives after unmount', async () => {
    const deferred = mockFetchDeferred()

    const { result, unmount } = renderHook(() => useProducts())
    const stateBeforeUnmount = result.current

    unmount()
    deferred.fail(new DOMException('The operation was aborted.', 'AbortError'))
    await act(async () => {
      await flushPromises()
    })

    expect(result.current).toBe(stateBeforeUnmount)
    expect(result.current.products).toEqual([])
    expect(result.current.isLoading).toBe(true)
    expect(result.current.error).toBeNull()
  })
})
