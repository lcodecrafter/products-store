import { useEffect, useState } from 'react'
import { getProducts } from '../../api/products'
import type { ProductListItem } from '../../api/products'

const INITIAL_LIMIT = 20

type UseProductsResult = {
  products: ProductListItem[]
  isLoading: boolean
  error: Error | null
}

export function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    getProducts({ limit: INITIAL_LIMIT }, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return
        setProducts(result)
        setIsLoading(false)
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return
        setError(cause instanceof Error ? cause : new Error('Failed to load products'))
        setIsLoading(false)
      })

    return () => controller.abort()
  }, [])

  return { products, isLoading, error }
}
