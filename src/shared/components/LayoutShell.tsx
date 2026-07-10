import type { PropsWithChildren } from 'react'
import { useCart } from '../../features/cart/useCart'
import { Navbar } from './Navbar'
import styles from './LayoutShell.module.css'

export function LayoutShell({ children }: PropsWithChildren) {
  const { itemCount } = useCart()

  return (
    <div className={styles.shell}>
      <Navbar cartItemCount={itemCount} />
      <main className={styles.content}>{children}</main>
    </div>
  )
}
