import styles from './PriceTag.module.css'
import { formatPrice } from './price'

type PriceTagProps = {
  amount: number
  prefix?: string
  className?: string
}

export function PriceTag({ amount, prefix, className }: PriceTagProps) {
  const formattedPrice = formatPrice(amount)
  const classes = className ? `${styles.price} ${className}` : styles.price

  return <span className={classes}>{prefix ? `${prefix} ${formattedPrice}` : formattedPrice}</span>
}
