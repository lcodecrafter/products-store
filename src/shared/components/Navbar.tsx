import { Link } from 'react-router-dom'
import { Icon } from './Icon'
import styles from './Navbar.module.css'

type NavbarProps = {
  cartItemCount: number
}

export function Navbar({ cartItemCount }: NavbarProps) {
  return (
    <header className={styles.header}>
      <Link className={styles.logoLink} to="/" aria-label="Go to catalog">
        <Icon name="logo" className={styles.logoIcon} />
      </Link>

      <Link className={styles.cartLink} to="/cart" aria-label={`Cart, ${cartItemCount} items`}>
        <Icon name="bag" className={styles.bagIcon} />
        <span>{cartItemCount}</span>
      </Link>
    </header>
  )
}
