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

  it('requests the initial page with a limit of 20', async () => {
    mockFetchJson(200, sampleList)

    const { result } = renderHook(() => useProducts())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string]
    expect(url).toBe(`${TEST_API_BASE_URL}/products?limit=20`)
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
