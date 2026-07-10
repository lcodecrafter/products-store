import type { PropsWithChildren } from 'react'
import { Navbar } from './Navbar'
import styles from './LayoutShell.module.css'

export function LayoutShell({ children }: PropsWithChildren) {
  return (
    <div className={styles.shell}>
      <Navbar cartItemCount={0} />
      <main className={styles.content}>{children}</main>
    </div>
  )
}
