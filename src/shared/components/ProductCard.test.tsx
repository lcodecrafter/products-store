import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import type { ProductListItem } from '../../api/products'
import { ProductCard } from './ProductCard'

const product: ProductListItem = {
  id: 'iphone-16',
  brand: 'Apple',
  name: 'iPhone 16',
  basePrice: 1099,
  imageUrl: 'http://img/iphone-16.jpg',
}

describe('ProductCard', () => {
  it('renders the brand, name and formatted price', () => {
    render(
      <MemoryRouter>
        <ProductCard product={product} />
      </MemoryRouter>,
    )

    expect(screen.getByText('Apple')).toBeInTheDocument()
    expect(screen.getByText('iPhone 16')).toBeInTheDocument()
    expect(screen.getByText('1,099 EUR')).toBeInTheDocument()
  })

  it('links to the product detail route', () => {
    render(
      <MemoryRouter>
        <ProductCard product={product} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link')).toHaveAttribute('href', '/product/iphone-16')
  })
})
