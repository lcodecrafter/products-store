import styles from './EmptyState.module.css'

type EmptyStateProps = {
  title: string
  description?: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <section className={styles.emptyState} aria-live="polite">
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </section>
  )
}
