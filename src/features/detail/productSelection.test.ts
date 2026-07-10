import { describe, expect, it } from 'vitest'
import { canAddToCart } from './productSelection'
import type { ProductSelection } from './productSelection'

const color = { name: 'Midnight', hexCode: '#000000', imageUrl: 'http://img/midnight.jpg' }
const storage = { capacity: '128GB', price: 999 }

describe('canAddToCart', () => {
  it('is disabled when neither color nor storage is selected', () => {
    const selection: ProductSelection = { color: null, storage: null }

    expect(canAddToCart(selection)).toBe(false)
  })

  it('is disabled when only color is selected', () => {
    const selection: ProductSelection = { color, storage: null }

    expect(canAddToCart(selection)).toBe(false)
  })

  it('is disabled when only storage is selected', () => {
    const selection: ProductSelection = { color: null, storage }

    expect(canAddToCart(selection)).toBe(false)
  })

  it('is enabled only when both color and storage are selected', () => {
    const selection: ProductSelection = { color, storage }

    expect(canAddToCart(selection)).toBe(true)
  })
})
