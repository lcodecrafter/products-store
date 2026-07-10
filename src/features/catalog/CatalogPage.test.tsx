import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockFetchJson, restoreApiEnv, stubApiEnv, TEST_API_BASE_URL } from '../../test/mockFetch'
import { CatalogPage } from './CatalogPage'

beforeEach(() => {
  stubApiEnv()
})

afterEach(() => {
  restoreApiEnv()
})

const sampleList = [
  { id: '1', brand: 'Apple', name: 'iPhone 14', basePrice: 999, imageUrl: 'http://img/1.jpg' },
  { id: '2', brand: 'Google', name: 'Pixel 9', basePrice: 799, imageUrl: 'http://img/2.jpg' },
]

const pixelResults = [sampleList[1]]

function renderCatalogPage() {
  return render(
    <MemoryRouter>
      <CatalogPage />
    </MemoryRouter>,
  )
}

function mockSearchFetch() {
  const fetchMock = vi.fn().mockImplementation((url: string) => {
    const search = new URL(url).searchParams.get('search')
    const body = search === 'Pixel' ? pixelResults : sampleList

    return Promise.resolve({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve(body),
    })
  })

  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('CatalogPage', () => {
  it('shows a loading state while the products are being fetched', async () => {
    mockFetchJson(200, sampleList)

    renderCatalogPage()

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(await screen.findByText('iPhone 14')).toBeInTheDocument()
  })

  it('renders a product card for every fetched product', async () => {
    mockFetchJson(200, sampleList)

    renderCatalogPage()

    await waitFor(() => expect(screen.getAllByRole('link')).toHaveLength(2))

    expect(screen.getByText('iPhone 14')).toBeInTheDocument()
    expect(screen.getByText('Pixel 9')).toBeInTheDocument()
    expect(screen.getByText('2 RESULTS')).toBeInTheDocument()
  })

  it('keeps the search input controlled and renders debounced filtered results', async () => {
    const user = userEvent.setup()
    const fetchMock = mockSearchFetch()

    renderCatalogPage()

    const searchInput = await screen.findByRole('searchbox', { name: 'Search products' })
    await screen.findByText('iPhone 14')

    await user.type(searchInput, 'Pixel')

    expect(searchInput).toHaveValue('Pixel')

    await waitFor(() => {
      expect(screen.getByText('1 RESULT')).toBeInTheDocument()
      expect(screen.queryByText('iPhone 14')).not.toBeInTheDocument()
    })
    expect(screen.getByText('Pixel 9')).toBeInTheDocument()

    const requestedUrls = fetchMock.mock.calls.map(([url]) => String(url))
    expect(requestedUrls).toContain(`${TEST_API_BASE_URL}/products?search=Pixel`)
  })

  it('shows an error state when the request fails', async () => {
    mockFetchJson(500, { error: 'Internal Server Error', message: 'Something broke' })

    renderCatalogPage()

    await waitFor(() => expect(screen.getByText('Something broke')).toBeInTheDocument())

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('shows a 0 results state when the request succeeds without products', async () => {
    mockFetchJson(200, [])

    renderCatalogPage()

    expect(await screen.findByText('0 RESULTS')).toBeInTheDocument()
    expect(screen.getByText('Try another search.')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
