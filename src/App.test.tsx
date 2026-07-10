import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App shell and routing', () => {
  it('renders the catalog route at /', () => {
    window.history.pushState({}, '', '/')

    render(<App />)

    expect(screen.getByRole('heading', { name: 'Catalog' })).toBeInTheDocument()
  })

  it('renders the product detail route with the product id', () => {
    window.history.pushState({}, '', '/product/iphone-16')

    render(<App />)

    expect(screen.getByRole('heading', { name: 'Product detail: iphone-16' })).toBeInTheDocument()
  })

  it('renders the cart route', () => {
    window.history.pushState({}, '', '/cart')

    render(<App />)

    expect(screen.getByRole('heading', { name: 'Cart' })).toBeInTheDocument()
  })

  it('keeps the logo linked to the catalog route', async () => {
    const user = userEvent.setup()
    window.history.pushState({}, '', '/cart')

    render(<App />)

    await user.click(screen.getByRole('link', { name: 'Go to catalog' }))

    expect(screen.getByRole('heading', { name: 'Catalog' })).toBeInTheDocument()
  })

  it('shows the cart link with the current item count', () => {
    window.history.pushState({}, '', '/')

    render(<App />)

    const cartLink = screen.getByRole('link', { name: 'Cart, 0 items' })

    expect(cartLink).toHaveAttribute('href', '/cart')
    expect(cartLink).toHaveTextContent('0')
  })
})
