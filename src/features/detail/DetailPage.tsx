import { useState } from 'react'
import { useParams } from 'react-router-dom'
import type { ColorOption, StorageOption } from '../../api/products'
import { BackButton, EmptyState, PriceTag, ProductCard, Spinner } from '../../shared/components'
import { useCart } from '../cart/useCart'
import styles from './ProductDetail.module.css'
import { canAddToCart } from './productSelection'
import { useProductDetail } from './useProductDetail'

function toSpecLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .toUpperCase()
}

export function DetailPage() {
  const { id } = useParams<{ id: string }>()
  const { product, isLoading, error, notFound } = useProductDetail(id)
  const { dispatch } = useCart()

  const [selectedColor, setSelectedColor] = useState<ColorOption | null>(null)
  const [selectedStorage, setSelectedStorage] = useState<StorageOption | null>(null)

  if (isLoading) {
    return (
      <>
        <BackButton className={styles.backButton} />
        <Spinner label="Loading product" />
      </>
    )
  }

  if (notFound) {
    return (
      <>
        <BackButton className={styles.backButton} />
        <EmptyState title="Product not found" description="This phone is no longer available." />
      </>
    )
  }

  if (error || !product) {
    return (
      <>
        <BackButton className={styles.backButton} />
        <EmptyState title="Something went wrong" description={error?.message} />
      </>
    )
  }

  const displayImage = selectedColor?.imageUrl ?? product.colorOptions[0]?.imageUrl
  const displayPrice = selectedStorage?.price ?? product.basePrice
  const canAdd = canAddToCart({ color: selectedColor, storage: selectedStorage })

  function handleAddToCart() {
    if (!selectedColor || !selectedStorage || !product) return

    dispatch({
      type: 'cart/add',
      payload: {
        id: product.id,
        name: product.name,
        price: selectedStorage.price,
        imageUrl: selectedColor.imageUrl,
        selectedColor: selectedColor.name,
        selectedStorage: selectedStorage.capacity,
      },
    })
  }

  return (
    <section>
      <BackButton className={styles.backButton} />
      <div className={styles.detail}>
        <div className={styles.imageWrapper}>
          {displayImage ? (
            <img className={styles.image} src={displayImage} alt={product.name} />
          ) : null}
        </div>

        <div className={styles.info}>
          <p className={styles.brand}>{product.brand}</p>
          <h1 className={styles.name}>{product.name}</h1>
          <PriceTag
            amount={displayPrice}
            prefix={selectedStorage ? undefined : 'From'}
            className={styles.price}
          />

          <div className={styles.storageSection}>
            <p className={styles.sectionLabel}>STORAGE — HOW MUCH SPACE DO YOU NEED?</p>
            <div className={styles.storageOptions}>
              {product.storageOptions.map((storage) => (
                <button
                  key={storage.capacity}
                  type="button"
                  className={styles.storageBox}
                  aria-pressed={selectedStorage?.capacity === storage.capacity}
                  data-selected={selectedStorage?.capacity === storage.capacity}
                  onClick={() => setSelectedStorage(storage)}
                >
                  {storage.capacity}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.colorSection}>
            <p className={styles.sectionLabel}>COLOR — PICK YOUR FAVOURITE</p>
            <div className={styles.swatchRow}>
              {product.colorOptions.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  className={styles.swatch}
                  style={{ backgroundColor: color.hexCode }}
                  aria-pressed={selectedColor?.name === color.name}
                  aria-label={color.name}
                  data-selected={selectedColor?.name === color.name}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
            {selectedColor ? <p className={styles.colorName}>{selectedColor.name}</p> : null}
          </div>

          <button
            type="button"
            className={styles.addButton}
            disabled={!canAdd}
            onClick={handleAddToCart}
          >
            AÑADIR
          </button>
        </div>
      </div>

      <div className={styles.specs}>
        <p className={styles.sectionLabel}>SPECIFICATIONS</p>
        <dl className={styles.specsTable}>
          {Object.entries(product.specs).map(([key, value]) => (
            <div key={key} className={styles.specRow}>
              <dt className={styles.specLabel}>{toSpecLabel(key)}</dt>
              <dd className={styles.specValue}>{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {product.similarProducts.length > 0 ? (
        <div className={styles.similar}>
          <p className={styles.sectionLabel}>SIMILAR ITEMS</p>
          <div className={styles.similarGrid}>
            {product.similarProducts.map((similarProduct) => (
              <ProductCard key={similarProduct.id} product={similarProduct} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}
