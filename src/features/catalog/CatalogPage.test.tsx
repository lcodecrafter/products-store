import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mockFetchJson, restoreApiEnv, stubApiEnv } from '../../test/mockFetch'
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

function renderCatalogPage() {
  return render(
    <MemoryRouter>
      <CatalogPage />
    </MemoryRouter>,
  )
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
  })

  it('shows an error state when the request fails', async () => {
    mockFetchJson(500, { error: 'Internal Server Error', message: 'Something broke' })

    renderCatalogPage()

    await waitFor(() => expect(screen.getByText('Something broke')).toBeInTheDocument())

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('shows an empty state when the request succeeds without products', async () => {
    mockFetchJson(200, [])

    renderCatalogPage()

    expect(await screen.findByText('No products found')).toBeInTheDocument()
    expect(screen.getByText('Try again later.')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
