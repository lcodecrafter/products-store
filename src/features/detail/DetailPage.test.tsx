import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ProductDetail } from '../../api/products'
import { CartProvider } from '../cart/CartContext'
import { DetailPage } from './DetailPage'

const { getProductByIdMock } = vi.hoisted(() => ({
  getProductByIdMock: vi.fn(),
}))

vi.mock('../../api/products', () => ({
  getProductById: getProductByIdMock,
}))

const sampleDetail: ProductDetail = {
  id: 'iphone-16',
  brand: 'Apple',
  name: 'iPhone 16',
  description: 'The latest iPhone',
  basePrice: 999,
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
  colorOptions: [
    { name: 'Black', hexCode: '#000000', imageUrl: 'http://img/black.jpg' },
    { name: 'White', hexCode: '#ffffff', imageUrl: 'http://img/white.jpg' },
  ],
  storageOptions: [
    { capacity: '128GB', price: 999 },
    { capacity: '256GB', price: 1199 },
  ],
  similarProducts: [],
}

beforeEach(() => {
  getProductByIdMock.mockReset()
  getProductByIdMock.mockResolvedValue(sampleDetail)
})

afterEach(() => {
  vi.clearAllMocks()
})

function renderDetailPage() {
  return render(
    <CartProvider>
      <MemoryRouter initialEntries={['/product/iphone-16']}>
        <Routes>
          <Route path="/product/:id" element={<DetailPage />} />
        </Routes>
      </MemoryRouter>
    </CartProvider>,
  )
}

describe('DetailPage add to cart gating', () => {
  it('starts with the add button disabled', async () => {
    renderDetailPage()

    expect(await screen.findByRole('button', { name: 'AÑADIR' })).toBeDisabled()
  })

  it('keeps the add button disabled when only a color is selected', async () => {
    const user = userEvent.setup()
    renderDetailPage()
    const addButton = await screen.findByRole('button', { name: 'AÑADIR' })

    await user.click(screen.getByRole('button', { name: 'Black' }))

    expect(addButton).toBeDisabled()
  })

  it('keeps the add button disabled when only storage is selected', async () => {
    const user = userEvent.setup()
    renderDetailPage()
    const addButton = await screen.findByRole('button', { name: 'AÑADIR' })

    await user.click(screen.getByRole('button', { name: '128GB' }))

    expect(addButton).toBeDisabled()
  })

  it('enables the add button once both color and storage are selected', async () => {
    const user = userEvent.setup()
    renderDetailPage()
    const addButton = await screen.findByRole('button', { name: 'AÑADIR' })

    await user.click(screen.getByRole('button', { name: 'Black' }))
    await user.click(screen.getByRole('button', { name: '128GB' }))

    expect(addButton).toBeEnabled()
  })

  it('updates the displayed price when the selected storage price differs from the base price', async () => {
    const user = userEvent.setup()
    renderDetailPage()
    await screen.findByRole('button', { name: 'AÑADIR' })

    expect(screen.getByText('From 999 EUR')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '256GB' }))

    expect(screen.queryByText('From 999 EUR')).not.toBeInTheDocument()
    expect(screen.getByText('1,199 EUR')).toBeInTheDocument()
  })
})
