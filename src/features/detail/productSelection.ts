import type { ColorOption, StorageOption } from '../../api/products'

export type ProductSelection = {
  color: ColorOption | null
  storage: StorageOption | null
}

export function canAddToCart(selection: ProductSelection): boolean {
  return selection.color !== null && selection.storage !== null
}
