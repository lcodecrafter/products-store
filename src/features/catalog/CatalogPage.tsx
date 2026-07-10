import { useState } from 'react'
import { EmptyState, ProductCard, Spinner } from '../../shared/components'
import styles from './CatalogPage.module.css'
import { useProducts } from './useProducts'

function formatResultsCount(count: number): string {
  return `${count} ${count === 1 ? 'RESULT' : 'RESULTS'}`
}

export function CatalogPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const { products, isLoading, error } = useProducts(searchTerm)
  const uniqueProducts = Array.from(
    new Map(products.map((product) => [product.id, product])).values(),
  )
  const resultsCount = formatResultsCount(uniqueProducts.length)

  return (
    <section>
      <div className={styles.toolbar}>
        <label className={styles.searchLabel} htmlFor="catalog-search">
          Search products
        </label>
        <input
          id="catalog-search"
          className={styles.searchInput}
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search for a smartphone..."
        />
        {!isLoading && !error && products.length > 0 ? (
          <p className={styles.resultsCount}>{resultsCount}</p>
        ) : null}
      </div>

      {isLoading ? <Spinner label="Loading products" /> : null}

      {error ? <EmptyState title="Something went wrong" description={error.message} /> : null}

      {!isLoading && !error && products.length === 0 ? (
        <EmptyState title="0 RESULTS" description="Try another search." />
      ) : null}

      {!isLoading && !error && products.length > 0 ? (
        <div className={styles.grid}>
          {uniqueProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : null}
    </section>
  )
}
