import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { ProductDetail } from './api/products'
import { mockFetchJson, restoreApiEnv, stubApiEnv } from './test/mockFetch'
import App from './App'

const sampleDetail: ProductDetail = {
  id: 'iphone-16',
  brand: 'Apple',
  name: 'iPhone 16',
  description: 'The latest iPhone',
  basePrice: 1099,
  rating: 4.5,
  specs: {
    screen: '6.1"',
    resolution: '2556x1179',
    processor: 'A18',
    mainCamera: '48MP',
    selfieCamera: '12MP',
    battery: '3561mAh',
    os: 'iOS 18',
    screenRefreshRate: '60Hz',
  },
  colorOptions: [{ name: 'Black', hexCode: '#000000', imageUrl: 'http://img/black.jpg' }],
  storageOptions: [{ capacity: '128GB', price: 1099 }],
  similarProducts: [],
}

beforeEach(() => {
  stubApiEnv()
  mockFetchJson(200, [])
})

afterEach(() => {
  restoreApiEnv()
})

describe('App shell and routing', () => {
  it('renders the catalog route at /', async () => {
    window.history.pushState({}, '', '/')

    render(<App />)

    expect(screen.getByRole('searchbox', { name: 'Search products' })).toBeInTheDocument()
    expect(await screen.findByText('0 RESULTS')).toBeInTheDocument()
  })

  it('renders the product detail route with the fetched product', async () => {
    mockFetchJson(200, sampleDetail)
    window.history.pushState({}, '', '/product/iphone-16')

    render(<App />)

    expect(await screen.findByRole('heading', { name: 'iPhone 16' })).toBeInTheDocument()
  })

  it('renders the cart route', () => {
    window.history.pushState({}, '', '/cart')

    render(<App />)

    expect(screen.getByRole('heading', { name: 'CART (0)' })).toBeInTheDocument()
  })

  it('keeps the logo linked to the catalog route', async () => {
    const user = userEvent.setup()
    window.history.pushState({}, '', '/cart')

    render(<App />)

    await user.click(screen.getByRole('link', { name: 'Go to catalog' }))

    expect(window.location.pathname).toBe('/')
    expect(screen.getByRole('searchbox', { name: 'Search products' })).toBeInTheDocument()
    expect(await screen.findByText('0 RESULTS')).toBeInTheDocument()
  })

  it('shows the cart link with the current item count', async () => {
    window.history.pushState({}, '', '/')

    render(<App />)

    const cartLink = screen.getByRole('link', { name: 'Cart, 0 items' })

    expect(cartLink).toHaveAttribute('href', '/cart')
    expect(cartLink).toHaveTextContent('0')
    expect(await screen.findByText('0 RESULTS')).toBeInTheDocument()
  })
})
