import { useEffect, useState } from 'react'
import { ApiRequestError } from '../../api/client'
import { getProductById } from '../../api/products'
import type { ProductDetail } from '../../api/products'

type UseProductDetailResult = {
  product: ProductDetail | null
  isLoading: boolean
  error: Error | null
  notFound: boolean
}

export function useProductDetail(id: string | undefined): UseProductDetailResult {
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [fetchFailed, setFetchFailed] = useState(false)
  const [settledId, setSettledId] = useState<string | undefined>(undefined)
  const isLoading = Boolean(id) && settledId !== id

  useEffect(() => {
    if (!id) return

    const controller = new AbortController()

    getProductById(id, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return
        setProduct(result)
        setError(null)
        setFetchFailed(false)
        setSettledId(id)
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return

        if (cause instanceof ApiRequestError && cause.status === 404) {
          setProduct(null)
          setError(null)
          setFetchFailed(true)
        } else {
          setProduct(null)
          setFetchFailed(false)
          setError(cause instanceof Error ? cause : new Error('Failed to load product'))
        }

        setSettledId(id)
      })

    return () => controller.abort()
  }, [id])

  return {
    product,
    isLoading,
    error,
    notFound: !id || fetchFailed,
  }
}
