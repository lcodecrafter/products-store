import { useEffect, useState } from 'react'
import { getProducts } from '../../api/products'
import type { ProductListItem } from '../../api/products'

// use 21 instead of 20 because there is 1 duplicated element and I removed it for better UX
const INITIAL_LIMIT = 21
const SEARCH_DEBOUNCE_MS = 300

type UseProductsResult = {
  products: ProductListItem[]
  isLoading: boolean
  error: Error | null
}

export function useDebounce<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value)
    }, delayMs)

    return () => window.clearTimeout(timeoutId)
  }, [value, delayMs])

  return debouncedValue
}

export function useProducts(searchTerm = ''): UseProductsResult {
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [settledSearchTerm, setSettledSearchTerm] = useState<string | null>(null)
  const debouncedSearchTerm = useDebounce(searchTerm, SEARCH_DEBOUNCE_MS)
  const isLoading = settledSearchTerm !== debouncedSearchTerm

  useEffect(() => {
    const controller = new AbortController()
    const search = debouncedSearchTerm.trim()
    const params = search ? { search } : { limit: INITIAL_LIMIT }

    getProducts(params, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return
        setProducts(result)
        setError(null)
        setSettledSearchTerm(debouncedSearchTerm)
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return
        setError(cause instanceof Error ? cause : new Error('Failed to load products'))
        setSettledSearchTerm(debouncedSearchTerm)
      })

    return () => controller.abort()
  }, [debouncedSearchTerm])

  return { products, isLoading, error: isLoading ? null : error }
}
