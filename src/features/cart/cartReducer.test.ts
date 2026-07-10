import { describe, expect, it } from 'vitest'
import { cartReducer, getCartItemCount, getCartTotal, initialCartState } from './cartReducer'
import type { CartLine, CartState } from './cartReducer'

const iphone: CartLine = {
  id: 'iphone-16',
  name: 'iPhone 16',
  price: 1099,
  imageUrl: 'http://img/iphone-16.jpg',
  selectedColor: 'Black',
  selectedStorage: '128GB',
}

const pixel: CartLine = {
  id: 'pixel-9',
  name: 'Pixel 9',
  price: 799,
  imageUrl: 'http://img/pixel-9.jpg',
}

describe('cartReducer', () => {
  it('adds a new line with quantity 1 by default', () => {
    const state = cartReducer(initialCartState, { type: 'cart/add', payload: iphone })

    expect(state.items).toEqual([{ ...iphone, quantity: 1 }])
  })

  it('increments quantity when the same line is added again', () => {
    const afterFirstAdd = cartReducer(initialCartState, { type: 'cart/add', payload: iphone })
    const state = cartReducer(afterFirstAdd, { type: 'cart/add', payload: iphone })

    expect(state.items).toHaveLength(1)
    expect(state.items[0].quantity).toBe(2)
  })

  it('adds a new line instead of merging when color or storage differ', () => {
    const afterFirstAdd = cartReducer(initialCartState, { type: 'cart/add', payload: iphone })
    const state = cartReducer(afterFirstAdd, {
      type: 'cart/add',
      payload: { ...iphone, selectedColor: 'White' },
    })

    expect(state.items).toHaveLength(2)
    expect(state.items[0].quantity).toBe(1)
    expect(state.items[1].quantity).toBe(1)
  })

  it('respects an explicit quantity on add', () => {
    const state = cartReducer(initialCartState, {
      type: 'cart/add',
      payload: { ...pixel, quantity: 3 },
    })

    expect(state.items[0].quantity).toBe(3)
  })

  it('removes the matching line', () => {
    const withTwoLines: CartState = {
      items: [
        { ...iphone, quantity: 1 },
        { ...pixel, quantity: 2 },
      ],
    }

    const state = cartReducer(withTwoLines, {
      type: 'cart/remove',
      payload: {
        id: iphone.id,
        selectedColor: iphone.selectedColor,
        selectedStorage: iphone.selectedStorage,
      },
    })

    expect(state.items).toEqual([{ ...pixel, quantity: 2 }])
  })

  it('is a no-op when removing a line that does not exist', () => {
    const withOneLine: CartState = { items: [{ ...pixel, quantity: 1 }] }

    const state = cartReducer(withOneLine, {
      type: 'cart/remove',
      payload: { id: 'not-in-cart' },
    })

    expect(state).toBe(withOneLine)
  })

  it('clears every line', () => {
    const withLines: CartState = {
      items: [
        { ...iphone, quantity: 1 },
        { ...pixel, quantity: 2 },
      ],
    }

    const state = cartReducer(withLines, { type: 'cart/clear' })

    expect(state).toEqual(initialCartState)
  })
})

describe('getCartItemCount', () => {
  it('sums quantities across every line', () => {
    const state: CartState = {
      items: [
        { ...iphone, quantity: 2 },
        { ...pixel, quantity: 3 },
      ],
    }

    expect(getCartItemCount(state)).toBe(5)
  })

  it('returns 0 for an empty cart', () => {
    expect(getCartItemCount(initialCartState)).toBe(0)
  })
})

describe('getCartTotal', () => {
  it('sums price times quantity across every line', () => {
    const state: CartState = {
      items: [
        { ...iphone, quantity: 2 },
        { ...pixel, quantity: 1 },
      ],
    }

    expect(getCartTotal(state)).toBe(1099 * 2 + 799)
  })

  it('returns 0 for an empty cart', () => {
    expect(getCartTotal(initialCartState)).toBe(0)
  })
})
