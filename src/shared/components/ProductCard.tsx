import { Link } from 'react-router-dom'
import type { ProductListItem } from '../../api/products'
import { PriceTag } from './PriceTag'
import styles from './ProductCard.module.css'

type ProductCardProps = {
  product: ProductListItem
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link className={styles.card} to={`/product/${product.id}`}>
      <div className={styles.imageWrapper}>
        <img className={styles.image} src={product.imageUrl} alt={product.name} />
      </div>
      <div className={styles.info}>
        <div>
          <p className={styles.brand}>{product.brand}</p>
          <p className={styles.name}>{product.name}</p>
        </div>
        <PriceTag amount={product.basePrice} />
      </div>
    </Link>
  )
}
