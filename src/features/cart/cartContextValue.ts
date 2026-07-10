import { createContext } from 'react'
import type { Dispatch } from 'react'
import type { CartAction, CartState } from './cartReducer'

export type CartContextValue = {
  state: CartState
  dispatch: Dispatch<CartAction>
  itemCount: number
  total: number
}

export const CartContext = createContext<CartContextValue | null>(null)
