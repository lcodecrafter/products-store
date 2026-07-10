export type CartLine = {
  id: string
  name: string
  price: number
  imageUrl: string
  selectedColor?: string
  selectedStorage?: string
}

export type CartItem = CartLine & {
  quantity: number
}

export type CartState = {
  items: CartItem[]
}

export type CartAction =
  | { type: 'cart/add'; payload: CartLine & { quantity?: number } }
  | {
      type: 'cart/remove'
      payload: { id: string; selectedColor?: string; selectedStorage?: string }
    }
  | { type: 'cart/clear' }

export const initialCartState: CartState = { items: [] }

export function getLineKey(
  line: Pick<CartLine, 'id' | 'selectedColor' | 'selectedStorage'>,
): string {
  return `${line.id}::${line.selectedColor ?? ''}::${line.selectedStorage ?? ''}`
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'cart/add': {
      const { quantity = 1, ...line } = action.payload
      const key = getLineKey(line)
      const existingIndex = state.items.findIndex((item) => getLineKey(item) === key)

      if (existingIndex === -1) {
        return { items: [...state.items, { ...line, quantity }] }
      }

      const items = [...state.items]
      items[existingIndex] = {
        ...items[existingIndex],
        quantity: items[existingIndex].quantity + quantity,
      }
      return { items }
    }

    case 'cart/remove': {
      const key = getLineKey(action.payload)
      const items = state.items.filter((item) => getLineKey(item) !== key)
      return items.length === state.items.length ? state : { items }
    }

    case 'cart/clear':
      return initialCartState

    default:
      return state
  }
}

export function getCartItemCount(state: CartState): number {
  return state.items.reduce((total, item) => total + item.quantity, 0)
}

export function getCartTotal(state: CartState): number {
  return state.items.reduce((total, item) => total + item.price * item.quantity, 0)
}
