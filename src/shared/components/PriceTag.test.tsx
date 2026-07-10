import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PriceTag } from './PriceTag'

describe('PriceTag', () => {
  it('formats whole euro prices with the EUR suffix', () => {
    render(<PriceTag amount={1099} />)

    expect(screen.getByText('1,099 EUR')).toBeInTheDocument()
  })

  it('supports the detail price prefix', () => {
    render(<PriceTag amount={1249} prefix="From" />)

    expect(screen.getByText('From 1,249 EUR')).toBeInTheDocument()
  })
})
