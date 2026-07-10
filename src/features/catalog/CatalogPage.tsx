import { EmptyState, ProductCard, Spinner } from '../../shared/components'
import styles from './CatalogPage.module.css'
import { useProducts } from './useProducts'

export function CatalogPage() {
  const { products, isLoading, error } = useProducts()

  return (
    <section>
      <h1>Catalog</h1>

      {isLoading ? <Spinner label="Loading products" /> : null}

      {error ? <EmptyState title="Something went wrong" description={error.message} /> : null}

      {!isLoading && !error && products.length === 0 ? (
        <EmptyState title="No products found" description="Try again later." />
      ) : null}

      {!isLoading && !error && products.length > 0 ? (
        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : null}
    </section>
  )
}
