import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiRequestError } from './client'
import { getProductById, getProducts } from './products'
import type { ProductDetail, ProductListItem } from './products'

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

function mockFetch(status: number, body: unknown): void {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 404 ? 'Not Found' : 'OK',
      json: () => Promise.resolve(body),
    }),
  )
}

const sampleList: ProductListItem[] = [
  { id: '1', brand: 'Apple', name: 'iPhone 14', basePrice: 999, imageUrl: 'http://img/1.jpg' },
]

const sampleDetail: ProductDetail = {
  id: '1',
  brand: 'Apple',
  name: 'iPhone 14',
  description: 'Great phone',
  basePrice: 999,
  rating: 4.5,
  specs: {
    screen: '6.1"',
    resolution: '2532x1170',
    processor: 'A15',
    mainCamera: '12MP',
    selfieCamera: '12MP',
    battery: '3279mAh',
    os: 'iOS 16',
    screenRefreshRate: '60Hz',
  },
  colorOptions: [{ name: 'Midnight', hexCode: '#000000', imageUrl: 'http://img/mid.jpg' }],
  storageOptions: [{ capacity: '128GB', price: 999 }],
  similarProducts: [],
}

describe('getProducts', () => {
  it('returns a parsed list on 200', async () => {
    mockFetch(200, sampleList)
    const result = await getProducts({ limit: 20 })
    expect(result).toEqual(sampleList)
  })

  it('builds the query string from the given params', async () => {
    mockFetch(200, sampleList)
    await getProducts({ search: 'apple', limit: 10, offset: 5 })
    const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string]
    expect(url).toContain('/products?')
    expect(url).toContain('search=apple')
    expect(url).toContain('limit=10')
    expect(url).toContain('offset=5')
  })

  it('requests the bare /products path when no params are given', async () => {
    mockFetch(200, sampleList)
    await getProducts()
    const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string]
    expect(url).toBe(`${BASE_URL}/products`)
  })

  it('forwards an AbortSignal to the underlying request', async () => {
    mockFetch(200, sampleList)
    const controller = new AbortController()
    await getProducts({}, controller.signal)
    const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit]
    expect(init.signal).toBe(controller.signal)
  })
})

describe('getProductById', () => {
  it('returns a parsed ProductDetail on 200', async () => {
    mockFetch(200, sampleDetail)
    const result = await getProductById('1')
    expect(result).toEqual(sampleDetail)
  })

  it('requests the /products/:id path', async () => {
    mockFetch(200, sampleDetail)
    await getProductById('1')
    const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string]
    expect(url).toBe(`${BASE_URL}/products/1`)
  })

  it('forwards an AbortSignal to the underlying request', async () => {
    mockFetch(200, sampleDetail)
    const controller = new AbortController()
    await getProductById('1', controller.signal)
    const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit]
    expect(init.signal).toBe(controller.signal)
  })

  it('propagates an ApiRequestError from the transport layer', async () => {
    mockFetch(404, { error: 'Not Found', message: 'Product not found' })
    await expect(getProductById('missing')).rejects.toBeInstanceOf(ApiRequestError)
  })
})
