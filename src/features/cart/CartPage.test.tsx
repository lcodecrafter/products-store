import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { CartProvider } from './CartContext'
import { CartPage } from './CartPage'
import { useCart } from './useCart'

beforeEach(() => {
  window.localStorage.clear()
})

function AddIphoneButton() {
  const { dispatch } = useCart()

  return (
    <button
      type="button"
      onClick={() =>
        dispatch({
          type: 'cart/add',
          payload: {
            id: 'iphone-16',
            name: 'iPhone 16',
            price: 1099,
            imageUrl: 'http://img/iphone-16.jpg',
            selectedColor: 'Black',
            selectedStorage: '128GB',
          },
        })
      }
    >
      Add iPhone
    </button>
  )
}

function AddPixelButton() {
  const { dispatch } = useCart()

  return (
    <button
      type="button"
      onClick={() =>
        dispatch({
          type: 'cart/add',
          payload: {
            id: 'pixel-9',
            name: 'Pixel 9',
            price: 799,
            imageUrl: 'http://img/pixel-9.jpg',
          },
        })
      }
    >
      Add Pixel
    </button>
  )
}

function renderCartPage() {
  return render(
    <CartProvider>
      <MemoryRouter initialEntries={['/cart']}>
        <AddIphoneButton />
        <AddPixelButton />
        <Routes>
          <Route path="/" element={<p>Catalog page</p>} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    </CartProvider>,
  )
}

describe('CartPage empty state', () => {
  it('renders the empty state and no total when there are no items', () => {
    renderCartPage()

    expect(screen.getByText('CART (0)')).toBeInTheDocument()
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
    expect(screen.queryByText(/Total/)).not.toBeInTheDocument()
  })

  it('navigates back to the catalog from continue shopping', async () => {
    const user = userEvent.setup()
    renderCartPage()

    await user.click(screen.getByRole('button', { name: 'Continue shopping' }))

    expect(screen.getByText('Catalog page')).toBeInTheDocument()
  })
})

describe('CartPage with items', () => {
  it('shows a line per item and the total computed from the reducer state', async () => {
    const user = userEvent.setup()
    renderCartPage()

    await user.click(screen.getByRole('button', { name: 'Add iPhone' }))
    await user.click(screen.getByRole('button', { name: 'Add Pixel' }))

    expect(screen.getByText('CART (2)')).toBeInTheDocument()
    expect(screen.getByText('iPhone 16')).toBeInTheDocument()
    expect(screen.getByText('128GB | Black')).toBeInTheDocument()
    expect(screen.getByText('Pixel 9')).toBeInTheDocument()
    expect(screen.getByText('Total 1,898 EUR')).toBeInTheDocument()
  })

  it('shows the unit price without a quantity suffix for a single unit', async () => {
    const user = userEvent.setup()
    renderCartPage()

    await user.click(screen.getByRole('button', { name: 'Add Pixel' }))

    expect(screen.getByText('799 EUR')).toBeInTheDocument()
  })

  it('appends the quantity next to the price once a line is merged', async () => {
    const user = userEvent.setup()
    renderCartPage()

    await user.click(screen.getByRole('button', { name: 'Add Pixel' }))
    await user.click(screen.getByRole('button', { name: 'Add Pixel' }))

    expect(screen.getByText('CART (2)')).toBeInTheDocument()
    expect(screen.getByText('799 EUR × 2')).toBeInTheDocument()
    expect(screen.getByText('Total 1,598 EUR')).toBeInTheDocument()
  })

  it('renders a disabled pay button next to the total', async () => {
    const user = userEvent.setup()
    renderCartPage()

    await user.click(screen.getByRole('button', { name: 'Add Pixel' }))

    expect(screen.getByRole('button', { name: 'Pay' })).toBeDisabled()
  })

  it('removes a line and updates the total', async () => {
    const user = userEvent.setup()
    renderCartPage()

    await user.click(screen.getByRole('button', { name: 'Add iPhone' }))
    await user.click(screen.getByRole('button', { name: 'Add Pixel' }))

    const [removeIphone] = screen.getAllByRole('button', { name: 'Eliminar' })
    await user.click(removeIphone)

    expect(screen.queryByText('iPhone 16')).not.toBeInTheDocument()
    expect(screen.getByText('CART (1)')).toBeInTheDocument()
    expect(screen.getByText('Total 799 EUR')).toBeInTheDocument()
  })

  it('falls back to the empty state once the last item is removed', async () => {
    const user = userEvent.setup()
    renderCartPage()

    await user.click(screen.getByRole('button', { name: 'Add Pixel' }))
    await user.click(screen.getByRole('button', { name: 'Eliminar' }))

    expect(screen.getByText('CART (0)')).toBeInTheDocument()
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
  })
})
