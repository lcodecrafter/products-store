import styles from './PriceTag.module.css'
import { formatPrice } from './price'

type PriceTagProps = {
  amount: number
  prefix?: string
}

export function PriceTag({ amount, prefix }: PriceTagProps) {
  const formattedPrice = formatPrice(amount)

  return (
    <span className={styles.price}>{prefix ? `${prefix} ${formattedPrice}` : formattedPrice}</span>
  )
}
