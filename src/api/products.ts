import { request } from './client'

export interface ProductListItem {
  id: string
  brand: string
  name: string
  basePrice: number
  imageUrl: string
}

export interface ColorOption {
  name: string
  hexCode: string
  imageUrl: string
}

export interface StorageOption {
  capacity: string
  price: number
}

export interface ProductSpecs {
  screen: string
  resolution: string
  processor: string
  mainCamera: string
  selfieCamera: string
  battery: string
  os: string
  screenRefreshRate: string
}

export interface ProductDetail {
  id: string
  brand: string
  name: string
  description: string
  basePrice: number
  rating: number
  specs: ProductSpecs
  colorOptions: ColorOption[]
  storageOptions: StorageOption[]
  similarProducts: ProductListItem[]
}

export interface GetProductsParams {
  search?: string
  limit?: number
  offset?: number
}

export function getProducts(
  params: GetProductsParams = {},
  signal?: AbortSignal,
): Promise<ProductListItem[]> {
  const query = new URLSearchParams()
  if (params.search !== undefined) query.set('search', params.search)
  if (params.limit !== undefined) query.set('limit', String(params.limit))
  if (params.offset !== undefined) query.set('offset', String(params.offset))

  const qs = query.toString()
  return request<ProductListItem[]>(qs ? `/products?${qs}` : '/products', signal)
}

export function getProductById(id: string, signal?: AbortSignal): Promise<ProductDetail> {
  return request<ProductDetail>(`/products/${id}`, signal)
}
