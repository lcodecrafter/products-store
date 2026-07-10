import { useEffect, useMemo, useReducer } from 'react'
import type { PropsWithChildren } from 'react'
import { cartReducer, getCartItemCount, getCartTotal, initialCartState } from './cartReducer'
import type { CartState } from './cartReducer'
import { CartContext } from './cartContextValue'

const STORAGE_KEY = 'mobile-list:cart'

function loadInitialState(): CartState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialCartState

    const parsed = JSON.parse(raw) as CartState
    return Array.isArray(parsed.items) ? parsed : initialCartState
  } catch {
    return initialCartState
  }
}

export function CartProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(cartReducer, undefined, loadInitialState)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Storage can be unavailable (quota exceeded, private browsing) — the
      // in-memory cart still works, it just won't survive a reload.
    }
  }, [state])

  const value = useMemo(
    () => ({ state, dispatch, itemCount: getCartItemCount(state), total: getCartTotal(state) }),
    [state],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
